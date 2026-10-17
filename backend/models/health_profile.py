from datetime import datetime, date
from sqlalchemy import Column, Integer, Float, String, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Required fields
    age = Column(Integer, nullable=False)
    sex = Column(String(10), nullable=False)  # 'male', 'female', 'other'
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    bmi = Column(Float, nullable=False)
    systolic_bp = Column(Integer, nullable=False)
    diastolic_bp = Column(Integer, nullable=False)
    heart_rate = Column(Integer, nullable=False)
    measured_on = Column(Date, nullable=False, default=date.today)

    # Optional clinical measurements (Stored as NULL if unmeasured, NEVER 0)
    blood_glucose = Column(Float, nullable=True)        # mg/dL
    hba1c = Column(Float, nullable=True)                # %
    serum_creatinine = Column(Float, nullable=True)     # mg/dL
    blood_urea = Column(Float, nullable=True)           # mg/dL
    total_cholesterol = Column(Float, nullable=True)    # mg/dL
    hdl = Column(Float, nullable=True)                  # mg/dL
    ldl = Column(Float, nullable=True)                  # mg/dL

    # Optional lifestyle & history
    smoking_status = Column(String(20), nullable=True)  # 'never', 'former', 'current'
    physical_activity = Column(String(20), nullable=True)  # 'sedentary', 'light', 'moderate', 'active'
    family_history_diabetes = Column(Boolean, nullable=True)
    family_history_kidney = Column(Boolean, nullable=True)
    family_history_cardio = Column(Boolean, nullable=True)
    symptoms = Column(Text, nullable=True)

    # Emergency Medical ID & In Case of Emergency (ICE) Fields
    blood_group = Column(String(10), nullable=True)              # e.g., 'O+', 'A+', 'B+', 'AB+'
    emergency_contact_name = Column(String(100), nullable=True)  # e.g., 'Primary Guardian / Relative'
    emergency_contact_phone = Column(String(25), nullable=True)  # e.g., '+91 98765 43210'
    emergency_contact_relation = Column(String(50), nullable=True) # e.g., 'Spouse', 'Parent', 'Sibling'
    allergies = Column(Text, nullable=True)                      # e.g., 'Penicillin, Peanuts, Sulfa'

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="health_profiles")
    assessments = relationship("Assessment", back_populates="health_profile", cascade="all, delete-orphan")
