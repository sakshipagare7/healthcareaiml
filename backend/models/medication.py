from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(100), nullable=False)          # e.g., 'Metformin', 'Telmisartan'
    dosage = Column(String(50), nullable=False)         # e.g., '500 mg', '40 mg'
    frequency = Column(String(50), nullable=False)      # e.g., 'Once Daily', 'Twice Daily', 'As Needed'
    time_of_day = Column(String(50), nullable=True)     # e.g., 'Morning (After breakfast)', 'Night'
    instructions = Column(String(200), nullable=True)   # e.g., 'Take with water after meal'
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="medications")
    logs = relationship("MedicationLog", back_populates="medication", cascade="all, delete-orphan")


class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)

    log_date = Column(Date, default=date.today, nullable=False, index=True)
    status = Column(String(20), default="taken", nullable=False)  # 'taken', 'skipped'
    logged_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    medication = relationship("Medication", back_populates="logs")
