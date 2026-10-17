import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.assessment import Assessment
from models.prediction_result import PredictionResult
from schemas.assessment import (
    AssessmentCreate,
    AssessmentResponse,
    PredictionResultItem,
    CounterfactualSimulationRequest,
    CounterfactualSimulationResponse
)
from schemas.health import HealthProfileResponse
from services.auth_service import get_current_user
from services.health_service import get_user_latest_profile, get_user_profile_by_id
from ml.predict import run_all_disease_predictions, run_counterfactual_simulation

router = APIRouter(prefix="/api/assessments", tags=["Assessments & Risk Predictions"])

def format_assessment_item(assessment: Assessment) -> AssessmentResponse:
    """Format SQLAlchemy Assessment into full Pydantic response"""
    results_list = []
    for pr in assessment.prediction_results:
        factors = []
        recs = []
        if pr.contributing_factors:
            try:
                factors = json.loads(pr.contributing_factors)
            except Exception:
                factors = []
        if pr.recommendations:
            try:
                recs = json.loads(pr.recommendations)
            except Exception:
                recs = []

        results_list.append(PredictionResultItem(
            id=pr.id,
            disease=pr.disease,
            risk_score=pr.risk_score,
            risk_category=pr.risk_category,
            contributing_factors=factors,
            recommendations=recs,
            model_version=pr.model_version,
            status=pr.status,
            missing_fields=None,
            instructions=None
        ))

    profile_resp = None
    if assessment.health_profile:
        profile_resp = HealthProfileResponse.model_validate(assessment.health_profile)

    model_versions_dict = {}
    if assessment.model_versions:
        try:
            model_versions_dict = json.loads(assessment.model_versions)
        except Exception:
            model_versions_dict = {}

    return AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        health_profile_id=assessment.health_profile_id,
        created_at=assessment.created_at,
        model_versions=model_versions_dict,
        prediction_results=results_list,
        health_profile=profile_resp
    )

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def run_and_save_assessment(
    assessment_in: AssessmentCreate = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run machine learning risk predictions on user health data and save immutable assessment.
    """
    # 1. Fetch relevant health profile
    if assessment_in and assessment_in.health_profile_id:
        profile = get_user_profile_by_id(db, current_user.id, assessment_in.health_profile_id)
    else:
        profile = get_user_latest_profile(db, current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No health profile found. Please enter your health metrics before running an assessment."
        )

    # 2. Run real ML pipelines (or return missing_fields / not_trained contracts)
    raw_predictions = run_all_disease_predictions(profile)

    # 3. Create Assessment record
    versions_map = {
        "engine": "Scikit-Learn Random Forest Pipeline",
        "models": {p["disease"]: p.get("model_version", "v1.0") for p in raw_predictions}
    }

    assessment = Assessment(
        user_id=current_user.id,
        health_profile_id=profile.id,
        model_versions=json.dumps(versions_map)
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # 4. Save Prediction Results
    formatted_items: List[PredictionResultItem] = []
    for res in raw_predictions:
        pr = PredictionResult(
            assessment_id=assessment.id,
            disease=res["disease"],
            risk_score=res.get("risk_score"),
            risk_category=res.get("risk_category", "Unavailable"),
            contributing_factors=json.dumps(res.get("contributing_factors", [])),
            recommendations=json.dumps(res.get("recommendations", [])),
            model_version=res.get("model_version"),
            status=res["status"]
        )
        db.add(pr)
        db.commit()
        db.refresh(pr)

        formatted_items.append(PredictionResultItem(
            id=pr.id,
            disease=pr.disease,
            risk_score=pr.risk_score,
            risk_category=pr.risk_category,
            contributing_factors=res.get("contributing_factors", []),
            recommendations=res.get("recommendations", []),
            model_version=pr.model_version,
            status=pr.status,
            missing_fields=res.get("missing_fields"),
            instructions=res.get("instructions")
        ))

    profile_resp = HealthProfileResponse.model_validate(profile)

    return AssessmentResponse(
        id=assessment.id,
        user_id=assessment.user_id,
        health_profile_id=assessment.health_profile_id,
        created_at=assessment.created_at,
        model_versions=versions_map,
        prediction_results=formatted_items,
        health_profile=profile_resp
    )

@router.get("", response_model=List[AssessmentResponse])
def get_user_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve assessment history for current authenticated user only.
    """
    assessments = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    ).order_by(Assessment.id.desc()).all()

    return [format_assessment_item(a) for a in assessments]

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_single_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a single historical assessment by ID.
    Strictly verifies ownership: User A can never see User B's assessment.
    """
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found or access denied."
        )

    return format_assessment_item(assessment)

@router.post("/simulate", response_model=CounterfactualSimulationResponse)
def simulate_counterfactual_risk(
    req: CounterfactualSimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Counterfactual Explainable AI Simulator ('What-If' Analysis).
    Takes a baseline health profile and user-controlled hypothetical sliders (BMI, BP, Glucose, Smoking),
    re-runs the trained Random Forest models, and calculates the risk reduction delta.
    """
    if req.health_profile_id:
        baseline = get_user_profile_by_id(db, current_user.id, req.health_profile_id)
    else:
        baseline = get_user_latest_profile(db, current_user.id)

    if not baseline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No health profile recorded yet to run What-If simulations on. Please enter health measurements first."
        )

    sim_data = req.model_dump(exclude_unset=True)
    result = run_counterfactual_simulation(baseline, sim_data)
    return CounterfactualSimulationResponse.model_validate(result)
