from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field

class HealthProfileBase(BaseModel):
    # Required core vitals
    age: int = Field(..., ge=1, le=120, description="Age in years (1-120)")
    sex: str = Field(..., pattern="^(male|female|other)$", description="Sex: male, female, or other")
    height_cm: float = Field(..., ge=50.0, le=250.0, description="Height in cm (50-250)")
    weight_kg: float = Field(..., ge=10.0, le=400.0, description="Weight in kg (10-400)")
    systolic_bp: int = Field(..., ge=40, le=300, description="Systolic Blood Pressure (40-300 mmHg)")
    diastolic_bp: int = Field(..., ge=40, le=300, description="Diastolic Blood Pressure (40-300 mmHg)")
    heart_rate: int = Field(..., ge=30, le=250, description="Resting Heart Rate (30-250 bpm)")
    measured_on: date = Field(default_factory=date.today, description="Date of measurement")

    # Optional clinical measurements (Stored as NULL if unmeasured, NEVER 0)
    blood_glucose: Optional[float] = Field(None, ge=20.0, le=800.0, description="Fasting Blood Glucose in mg/dL")
    hba1c: Optional[float] = Field(None, ge=2.0, le=20.0, description="HbA1c level in %")
    serum_creatinine: Optional[float] = Field(None, ge=0.1, le=30.0, description="Serum Creatinine in mg/dL")
    blood_urea: Optional[float] = Field(None, ge=1.0, le=300.0, description="Blood Urea Nitrogen in mg/dL")
    total_cholesterol: Optional[float] = Field(None, ge=50.0, le=600.0, description="Total Cholesterol in mg/dL")
    hdl: Optional[float] = Field(None, ge=10.0, le=150.0, description="HDL Cholesterol in mg/dL")
    ldl: Optional[float] = Field(None, ge=20.0, le=400.0, description="LDL Cholesterol in mg/dL")

    # Optional lifestyle & medical history
    smoking_status: Optional[str] = Field(None, pattern="^(never|former|current)$")
    physical_activity: Optional[str] = Field(None, pattern="^(sedentary|light|moderate|active)$")
    family_history_diabetes: Optional[bool] = None
    family_history_kidney: Optional[bool] = None
    family_history_cardio: Optional[bool] = None
    symptoms: Optional[str] = None

    # Emergency Medical ID & In Case of Emergency (ICE) Fields
    blood_group: Optional[str] = Field(None, max_length=10, description="e.g., O+, A+, B+, AB-, etc.")
    emergency_contact_name: Optional[str] = Field(None, max_length=100, description="Name of emergency contact")
    emergency_contact_phone: Optional[str] = Field(None, max_length=25, description="Phone number of emergency contact")
    emergency_contact_relation: Optional[str] = Field(None, max_length=50, description="Relationship e.g. Parent, Spouse")
    allergies: Optional[str] = Field(None, description="Known drug/food allergies")

class HealthProfileCreate(HealthProfileBase):
    pass

class HealthProfileUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=1, le=120)
    sex: Optional[str] = Field(None, pattern="^(male|female|other)$")
    height_cm: Optional[float] = Field(None, ge=50.0, le=250.0)
    weight_kg: Optional[float] = Field(None, ge=10.0, le=400.0)
    systolic_bp: Optional[int] = Field(None, ge=40, le=300)
    diastolic_bp: Optional[int] = Field(None, ge=40, le=300)
    heart_rate: Optional[int] = Field(None, ge=30, le=250)
    measured_on: Optional[date] = None

    blood_glucose: Optional[float] = Field(None, ge=20.0, le=800.0)
    hba1c: Optional[float] = Field(None, ge=2.0, le=20.0)
    serum_creatinine: Optional[float] = Field(None, ge=0.1, le=30.0)
    blood_urea: Optional[float] = Field(None, ge=1.0, le=300.0)
    total_cholesterol: Optional[float] = Field(None, ge=50.0, le=600.0)
    hdl: Optional[float] = Field(None, ge=10.0, le=150.0)
    ldl: Optional[float] = Field(None, ge=20.0, le=400.0)

    smoking_status: Optional[str] = Field(None, pattern="^(never|former|current)$")
    physical_activity: Optional[str] = Field(None, pattern="^(sedentary|light|moderate|active)$")
    family_history_diabetes: Optional[bool] = None
    family_history_kidney: Optional[bool] = None
    family_history_cardio: Optional[bool] = None
    symptoms: Optional[str] = None

    # Emergency Medical ID & In Case of Emergency (ICE) Fields
    blood_group: Optional[str] = Field(None, max_length=10)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=25)
    emergency_contact_relation: Optional[str] = Field(None, max_length=50)
    allergies: Optional[str] = None

class HealthProfileResponse(HealthProfileBase):
    id: int
    user_id: int
    bmi: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
