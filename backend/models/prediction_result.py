from sqlalchemy import Column, Integer, Float, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class PredictionResult(Base):
    __tablename__ = "prediction_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)

    disease = Column(String(50), nullable=False)  # 'diabetes', 'ckd', 'cardiovascular'
    risk_score = Column(Float, nullable=True)     # 0.0 - 1.0 (probability), NULL if unavailable
    risk_category = Column(String(50), nullable=True)  # 'Low', 'Moderate', 'High', 'Unavailable'
    contributing_factors = Column(Text, nullable=True)  # JSON-encoded array of feature importance/factors
    recommendations = Column(Text, nullable=True)       # JSON-encoded array of preventive recommendations
    model_version = Column(String(50), nullable=True)
    status = Column(String(20), nullable=False)         # 'ok' or 'unavailable' or 'not_trained'

    assessment = relationship("Assessment", back_populates="prediction_results")
