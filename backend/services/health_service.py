from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.health_profile import HealthProfile
from schemas.health import HealthProfileCreate, HealthProfileUpdate

def compute_bmi(height_cm: float, weight_kg: float) -> float:
    """Compute Body Mass Index (BMI = weight / (height in m)^2)"""
    if height_cm <= 0:
        return 0.0
    height_m = height_cm / 100.0
    return round(weight_kg / (height_m * height_m), 2)

def get_user_latest_profile(db: Session, user_id: int) -> Optional[HealthProfile]:
    """Retrieve the most recent health profile belonging to user_id"""
    return db.query(HealthProfile).filter(
        HealthProfile.user_id == user_id
    ).order_by(HealthProfile.id.desc()).first()

def get_user_health_history(db: Session, user_id: int):
    """Retrieve all historical health profiles for user_id chronologically"""
    return db.query(HealthProfile).filter(
        HealthProfile.user_id == user_id
    ).order_by(HealthProfile.measured_on.asc(), HealthProfile.id.asc()).all()

def get_user_profile_by_id(db: Session, user_id: int, profile_id: int) -> HealthProfile:
    """Retrieve a specific health profile ensuring user ownership"""
    profile = db.query(HealthProfile).filter(
        HealthProfile.id == profile_id,
        HealthProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found or does not belong to the current user"
        )
    return profile

def create_health_profile(db: Session, user_id: int, data: HealthProfileCreate) -> HealthProfile:
    """Create a new health profile entry for user"""
    profile_data = data.model_dump()
    bmi = compute_bmi(data.height_cm, data.weight_kg)
    profile_data["bmi"] = bmi
    profile_data["user_id"] = user_id

    profile = HealthProfile(**profile_data)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def update_health_profile(db: Session, user_id: int, profile_id: int, data: HealthProfileUpdate) -> HealthProfile:
    """Update existing health profile for user, preserving historical integrity"""
    profile = get_user_profile_by_id(db, user_id, profile_id)
    update_data = data.model_dump(exclude_unset=True)

    # Recompute BMI if height or weight is updated
    height_cm = update_data.get("height_cm", profile.height_cm)
    weight_kg = update_data.get("weight_kg", profile.weight_kg)
    if "height_cm" in update_data or "weight_kg" in update_data:
        update_data["bmi"] = compute_bmi(height_cm, weight_kg)

    for field, val in update_data.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile
