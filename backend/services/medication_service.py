from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from models.medication import Medication, MedicationLog
from schemas.medication import MedicationCreate, MedicationResponse, AdherenceSummaryResponse

def get_user_medications(db: Session, user_id: int) -> List[MedicationResponse]:
    """Retrieve all active medications for user with today's taken status"""
    meds = db.query(Medication).filter(
        Medication.user_id == user_id,
        Medication.is_active == True
    ).order_by(Medication.id.asc()).all()

    today = date.today()
    # Get all logs for today for this user
    today_logs = db.query(MedicationLog).filter(
        MedicationLog.user_id == user_id,
        MedicationLog.log_date == today,
        MedicationLog.status == "taken"
    ).all()
    taken_med_ids = {log.medication_id for log in today_logs}

    result = []
    for med in meds:
        res = MedicationResponse.model_validate(med)
        res.taken_today = med.id in taken_med_ids
        result.append(res)
    return result

def create_user_medication(db: Session, user_id: int, data: MedicationCreate) -> MedicationResponse:
    """Add a new medication for user"""
    med = Medication(
        user_id=user_id,
        name=data.name.strip(),
        dosage=data.dosage.strip(),
        frequency=data.frequency.strip(),
        time_of_day=data.time_of_day.strip() if data.time_of_day else "Morning",
        instructions=data.instructions.strip() if data.instructions else None,
        is_active=True
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    res = MedicationResponse.model_validate(med)
    res.taken_today = False
    return res

def delete_user_medication(db: Session, user_id: int, med_id: int) -> bool:
    """Soft delete or remove a medication belonging to user"""
    med = db.query(Medication).filter(
        Medication.id == med_id,
        Medication.user_id == user_id
    ).first()
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found or unauthorized"
        )
    db.delete(med)
    db.commit()
    return True

def toggle_medication_today(db: Session, user_id: int, med_id: int) -> bool:
    """Toggle taken status for medication today"""
    med = db.query(Medication).filter(
        Medication.id == med_id,
        Medication.user_id == user_id
    ).first()
    if not med:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found or unauthorized"
        )

    today = date.today()
    existing_log = db.query(MedicationLog).filter(
        MedicationLog.user_id == user_id,
        MedicationLog.medication_id == med_id,
        MedicationLog.log_date == today
    ).first()

    if existing_log:
        if existing_log.status == "taken":
            # Untake
            db.delete(existing_log)
            db.commit()
            return False
        else:
            existing_log.status = "taken"
            existing_log.logged_at = datetime.utcnow()
            db.commit()
            return True
    else:
        # Mark as taken
        new_log = MedicationLog(
            user_id=user_id,
            medication_id=med_id,
            log_date=today,
            status="taken",
            logged_at=datetime.utcnow()
        )
        db.add(new_log)
        db.commit()
        return True

def get_adherence_summary(db: Session, user_id: int) -> AdherenceSummaryResponse:
    """Compute 7-day and 30-day adherence rates and consecutive streak"""
    active_meds = db.query(Medication).filter(
        Medication.user_id == user_id,
        Medication.is_active == True
    ).all()
    total_meds = len(active_meds)

    today = date.today()

    if total_meds == 0:
        return AdherenceSummaryResponse(
            total_medications=0,
            taken_today_count=0,
            adherence_rate_7d=100.0,
            adherence_rate_30d=100.0,
            streak_days=0
        )

    # Today's count
    today_taken = db.query(MedicationLog).filter(
        MedicationLog.user_id == user_id,
        MedicationLog.log_date == today,
        MedicationLog.status == "taken"
    ).count()

    # Calculate 7-day adherence
    seven_days_ago = today - timedelta(days=6)
    expected_7d = total_meds * 7
    actual_7d = db.query(MedicationLog).filter(
        MedicationLog.user_id == user_id,
        MedicationLog.log_date >= seven_days_ago,
        MedicationLog.log_date <= today,
        MedicationLog.status == "taken"
    ).count()
    rate_7d = round((actual_7d / expected_7d) * 100.0, 1) if expected_7d > 0 else 100.0

    # Calculate 30-day adherence
    thirty_days_ago = today - timedelta(days=29)
    expected_30d = total_meds * 30
    actual_30d = db.query(MedicationLog).filter(
        MedicationLog.user_id == user_id,
        MedicationLog.log_date >= thirty_days_ago,
        MedicationLog.log_date <= today,
        MedicationLog.status == "taken"
    ).count()
    rate_30d = round((actual_30d / expected_30d) * 100.0, 1) if expected_30d > 0 else 100.0

    # Calculate streak (consecutive days where at least 1 dose was logged)
    streak = 0
    curr = today
    while True:
        cnt = db.query(MedicationLog).filter(
            MedicationLog.user_id == user_id,
            MedicationLog.log_date == curr,
            MedicationLog.status == "taken"
        ).count()
        if cnt > 0:
            streak += 1
            curr -= timedelta(days=1)
        else:
            # If checking today and 0 taken yet, check if yesterday was logged
            if curr == today:
                curr -= timedelta(days=1)
                continue
            break

    return AdherenceSummaryResponse(
        total_medications=total_meds,
        taken_today_count=today_taken,
        adherence_rate_7d=min(100.0, rate_7d),
        adherence_rate_30d=min(100.0, rate_30d),
        streak_days=streak
    )
