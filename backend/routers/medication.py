from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.medication import MedicationCreate, MedicationResponse, AdherenceSummaryResponse
from services.auth_service import get_current_user
from services.medication_service import (
    get_user_medications,
    create_user_medication,
    delete_user_medication,
    toggle_medication_today,
    get_adherence_summary
)

router = APIRouter(prefix="/api/medications", tags=["Medication Adherence"])

@router.get("", response_model=List[MedicationResponse])
def list_medications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all active medications for authenticated user with today's status"""
    return get_user_medications(db, current_user.id)

@router.post("", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def add_medication(
    data: MedicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a new medication in patient's daily routine"""
    return create_user_medication(db, current_user.id, data)

@router.delete("/{med_id}", status_code=status.HTTP_200_OK)
def remove_medication(
    med_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a medication from patient's routine"""
    delete_user_medication(db, current_user.id, med_id)
    return {"message": "Medication deleted successfully"}

@router.post("/{med_id}/toggle", status_code=status.HTTP_200_OK)
def toggle_medication(
    med_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle today's taken status for a medication"""
    taken = toggle_medication_today(db, current_user.id, med_id)
    return {"medication_id": med_id, "taken_today": taken}

@router.get("/adherence", response_model=AdherenceSummaryResponse)
def get_adherence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve 7-day and 30-day adherence percentage and consecutive streak"""
    return get_adherence_summary(db, current_user.id)
