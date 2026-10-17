from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.health import HealthProfileCreate, HealthProfileUpdate, HealthProfileResponse
from services.auth_service import get_current_user
from services.health_service import (
    create_health_profile,
    update_health_profile,
    get_user_latest_profile,
    get_user_profile_by_id,
    get_user_health_history,
    delete_health_profile
)

router = APIRouter(prefix="/api/health", tags=["Health Information"])

@router.get("/history", response_model=List[HealthProfileResponse])
def get_health_profile_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all historical health profiles for authenticated user.
    Used for longitudinal vitals trends and time-series charts.
    """
    profiles = get_user_health_history(db, current_user.id)
    return [HealthProfileResponse.model_validate(p) for p in profiles]

@router.post("/profile", response_model=HealthProfileResponse, status_code=status.HTTP_201_CREATED)
def add_health_profile(
    profile_in: HealthProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save new health metrics for the authenticated user.
    Auto-computes BMI on backend.
    """
    profile = create_health_profile(db, current_user.id, profile_in)
    return HealthProfileResponse.model_validate(profile)

@router.get("/profile", response_model=Optional[HealthProfileResponse])
def get_current_health_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve current authenticated user's latest health profile.
    Returns null if no measurements entered yet (empty state).
    """
    profile = get_user_latest_profile(db, current_user.id)
    if not profile:
        return None
    return HealthProfileResponse.model_validate(profile)

@router.get("/profile/{profile_id}", response_model=HealthProfileResponse)
def get_health_profile_by_id(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific profile by ID.
    Strictly verifies ownership by current user.
    """
    profile = get_user_profile_by_id(db, current_user.id, profile_id)
    return HealthProfileResponse.model_validate(profile)

@router.put("/profile/{profile_id}", response_model=HealthProfileResponse)
def update_existing_health_profile(
    profile_id: int,
    profile_in: HealthProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing health profile for the authenticated user.
    Past historical assessments remain immutable.
    """
    profile = update_health_profile(db, current_user.id, profile_id, profile_in)
    return HealthProfileResponse.model_validate(profile)

@router.delete("/profile/{profile_id}")
def delete_existing_health_profile(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific health reading belonging strictly to authenticated user.
    """
    return delete_health_profile(db, current_user.id, profile_id)

