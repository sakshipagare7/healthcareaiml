from typing import List, Optional
from pydantic import BaseModel

class SymptomsCheckRequest(BaseModel):
    symptoms: List[str]

class SymptomsCheckResponse(BaseModel):
    severity: str  # "emergency" or "non_emergency"
    emergency_number: str = "112"
    disclaimer: str = "This app does not contact emergency services. If in distress, immediately call emergency services or go to the nearest hospital."
    message: str
    actions: List[str]
    identified_symptoms: List[str]

class MeasurementsCheckRequest(BaseModel):
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    blood_glucose: Optional[float] = None
    heart_rate: Optional[int] = None

class MeasurementAlert(BaseModel):
    measurement: str
    value: float
    status: str  # "urgent" or "warning"
    rule_triggered: str
    advice: str

class MeasurementsCheckResponse(BaseModel):
    severity: str  # "urgent" or "normal"
    emergency_number: str = "112"
    disclaimer: str = "This app does not contact emergency services. Call 112 in case of acute crisis."
    message: str
    alerts: List[MeasurementAlert]

class PublicEmergencyCardResponse(BaseModel):
    profile_id: int
    full_name: str
    age: int
    sex: str
    blood_group: Optional[str] = "Not Specified"
    allergies: Optional[str] = "No Known Drug Allergies"
    emergency_contact_name: Optional[str] = "Not Provided"
    emergency_contact_phone: Optional[str] = "None"
    emergency_contact_relation: Optional[str] = ""
    systolic_bp: int
    diastolic_bp: int
    heart_rate: int
    blood_glucose: Optional[float] = None
    bmi: float
    measured_on: str
