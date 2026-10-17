from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

class MedicationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of medication (e.g. Metformin)")
    dosage: str = Field(..., min_length=1, max_length=50, description="Dosage (e.g. 500mg, 1 tablet)")
    frequency: str = Field(..., description="Frequency (e.g. Once Daily, Twice Daily, As Needed)")
    time_of_day: Optional[str] = Field("Morning", max_length=50, description="Morning, Afternoon, Night")
    instructions: Optional[str] = Field(None, max_length=200, description="e.g. Take after meals with water")

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    taken_today: bool = False

    class Config:
        from_attributes = True

class MedicationLogResponse(BaseModel):
    id: int
    medication_id: int
    log_date: date
    status: str
    logged_at: datetime

    class Config:
        from_attributes = True

class AdherenceSummaryResponse(BaseModel):
    total_medications: int
    taken_today_count: int
    adherence_rate_7d: float      # e.g., 85.7%
    adherence_rate_30d: float     # e.g., 90.0%
    streak_days: int              # e.g., 5 consecutive days of adherence
