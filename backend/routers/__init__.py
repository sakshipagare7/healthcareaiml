from routers.auth import router as auth_router
from routers.health import router as health_router
from routers.assessment import router as assessment_router
from routers.emergency import router as emergency_router
from routers.models import router as models_router
from routers.medication import router as medication_router

__all__ = ["auth_router", "health_router", "assessment_router", "emergency_router", "models_router", "medication_router"]
