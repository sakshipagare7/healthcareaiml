from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    health_profile_id = Column(Integer, ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    model_versions = Column(Text, nullable=True)  # JSON-encoded dictionary of versions

    user = relationship("User", back_populates="assessments")
    health_profile = relationship("HealthProfile", back_populates="assessments")
    prediction_results = relationship("PredictionResult", back_populates="assessment", cascade="all, delete-orphan")
