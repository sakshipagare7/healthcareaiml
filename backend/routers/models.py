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

@router.get("/diagnose")
def run_model_diagnostics():
    """
    Diagnostic endpoint to test model loading and predict_single_disease on Render
    """
    import sys, traceback, sklearn, numpy, pandas, joblib
    from ml.predict import predict_single_disease, MockProfile

    test_profile = MockProfile(
        age=25,
        sex="female",
        systolic_bp=120,
        diastolic_bp=80,
        heart_rate=72,
        bmi=23.51,
        blood_glucose=80.0,
        total_cholesterol=170.0,
        serum_creatinine=0.15,
        blood_urea=None,
        family_history_diabetes=False,
        family_history_cardio=False,
        family_history_kidney=False,
        symptoms=""
    )

    results = {}
    for disease in ["diabetes", "cardiovascular", "ckd"]:
        try:
            res = predict_single_disease(disease, test_profile, [])
            results[disease] = res
        except Exception as e:
            results[disease] = {
                "error": str(e),
                "traceback": traceback.format_exc()
            }

    return {
        "python_version": sys.version,
        "sklearn_version": sklearn.__version__,
        "numpy_version": numpy.__version__,
        "pandas_version": pandas.__version__,
        "joblib_version": joblib.__version__,
        "predictions": results
    }
