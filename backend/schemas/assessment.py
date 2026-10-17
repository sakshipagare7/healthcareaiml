from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from schemas.health import HealthProfileResponse

class ContributingFactor(BaseModel):
    feature: str
    importance: float
    user_value: Optional[Any] = None
    description: Optional[str] = None

class RecommendationItem(BaseModel):
    title: str
    advice: str
    trigger_rule: str
    category: str

class PredictionResultItem(BaseModel):
    id: Optional[int] = None
    disease: str
    risk_score: Optional[float] = None
    risk_category: Optional[str] = None
    contributing_factors: Optional[List[ContributingFactor]] = None
    recommendations: Optional[List[RecommendationItem]] = None
    model_version: Optional[str] = None
    status: str  # 'ok', 'unavailable', 'not_trained'
    missing_fields: Optional[List[str]] = None
    instructions: Optional[str] = None

class AssessmentCreate(BaseModel):
    health_profile_id: Optional[int] = None

class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    health_profile_id: int
    created_at: datetime
    model_versions: Optional[dict] = None
    prediction_results: List[PredictionResultItem] = []
    health_profile: Optional[HealthProfileResponse] = None

    class Config:
        from_attributes = True

class CounterfactualSimulationRequest(BaseModel):
    health_profile_id: Optional[int] = None
    simulated_bmi: Optional[float] = None
    simulated_systolic_bp: Optional[int] = None
    simulated_diastolic_bp: Optional[int] = None
    simulated_blood_glucose: Optional[float] = None
    simulated_total_cholesterol: Optional[float] = None
    simulated_smoking_status: Optional[str] = None
    simulated_physical_activity: Optional[str] = None

class DiseaseSimulationComparison(BaseModel):
    disease: str
    display_name: str
    baseline_risk: Optional[float] = None
    baseline_category: Optional[str] = None
    simulated_risk: Optional[float] = None
    simulated_category: Optional[str] = None
    risk_delta: Optional[float] = None
    percent_change: Optional[float] = None
    key_driver: str

class CounterfactualSimulationResponse(BaseModel):
    comparisons: List[DiseaseSimulationComparison]
    overall_summary: str
