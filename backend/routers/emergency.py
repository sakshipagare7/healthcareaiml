from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.health_profile import HealthProfile
from models.user import User
from schemas.emergency import (
    SymptomsCheckRequest, SymptomsCheckResponse,
    MeasurementsCheckRequest, MeasurementsCheckResponse,
    PublicEmergencyCardResponse
)
from services.emergency_service import evaluate_emergency_symptoms, evaluate_emergency_measurements

router = APIRouter(prefix="/api/emergency", tags=["Emergency Response"])

@router.get("/card/{profile_id}", response_model=PublicEmergencyCardResponse)
def get_public_emergency_card(profile_id: int, db: Session = Depends(get_db)):
    """
    Public emergency endpoint for first responders and paramedics scanning QR code.
    Returns blood group, allergies, ICE contacts, and critical baseline vitals without auth.
    Never exposes passwords, tokens, or sensitive account credentials.
    """
    profile = db.query(HealthProfile).filter(HealthProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency medical record not found."
        )

    user = db.query(User).filter(User.id == profile.user_id).first()
    user_name = user.full_name if user else "Patient"

    return PublicEmergencyCardResponse(
        profile_id=profile.id,
        full_name=user_name,
        age=profile.age,
        sex=profile.sex,
        blood_group=profile.blood_group or "Not Specified",
        allergies=profile.allergies or "No Known Drug Allergies",
        emergency_contact_name=profile.emergency_contact_name or "Not Provided",
        emergency_contact_phone=profile.emergency_contact_phone or "None",
        emergency_contact_relation=profile.emergency_contact_relation or "",
        systolic_bp=profile.systolic_bp,
        diastolic_bp=profile.diastolic_bp,
        heart_rate=profile.heart_rate,
        blood_glucose=profile.blood_glucose,
        bmi=profile.bmi,
        measured_on=str(profile.measured_on)
    )

@router.post("/symptoms", response_model=SymptomsCheckResponse)
def check_emergency_symptoms(payload: SymptomsCheckRequest):
    """
    Rapid symptom evaluation for acute life threats.
    Bypasses ML models for instantaneous, zero-latency safety response.
    """
    result = evaluate_emergency_symptoms(payload.symptoms)
    return SymptomsCheckResponse(**result)

@router.post("/measurements", response_model=MeasurementsCheckResponse)
def check_emergency_measurements(payload: MeasurementsCheckRequest):
    """
    Check physiological vital signs against critical acute clinical thresholds.
    """
    result = evaluate_emergency_measurements(
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        blood_glucose=payload.blood_glucose,
        heart_rate=payload.heart_rate
    )
    return MeasurementsCheckResponse(**result)
