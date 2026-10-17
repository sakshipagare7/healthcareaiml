from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class SingleModelStatus(BaseModel):
    disease: str
    display_name: str
    is_trained: bool
    status: str  # "ready" or "not_trained"
    file_path: str
    dataset_name: str
    required_features: List[str]
    optional_features: List[str]
    instructions: Optional[str] = None

class ModelStatusSummary(BaseModel):
    models: Dict[str, SingleModelStatus]

class SingleModelMetrics(BaseModel):
    disease: str
    algorithm: str
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: Optional[float] = None
    test_samples: int
    train_samples: int
    feature_names: List[str]
    feature_importances: Dict[str, float]
    trained_at: str

class ModelMetricsSummary(BaseModel):
    metrics: Dict[str, Any]
