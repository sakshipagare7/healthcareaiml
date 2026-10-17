from fastapi import APIRouter
from schemas.model_status import ModelStatusSummary, ModelMetricsSummary
from ml.predict import get_model_status, get_model_metrics

router = APIRouter(prefix="/api/models", tags=["Machine Learning Models"])

@router.get("/status", response_model=ModelStatusSummary)
def check_models_status():
    """
    Check training and file readiness of all clinical risk models.
    """
    statuses = get_model_status()
    return ModelStatusSummary(models=statuses)

@router.get("/metrics", response_model=ModelMetricsSummary)
def get_models_test_metrics():
    """
    Return test-set metrics (accuracy, precision, recall, F1, ROC-AUC)
    computed strictly on holdout folds without data leakage.
    """
    metrics = get_model_metrics()
    return ModelMetricsSummary(metrics=metrics)
