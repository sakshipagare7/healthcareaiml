import json
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def compute_classification_metrics(y_true, y_pred, y_prob=None) -> dict:
    """
    Compute rigorous test-set classification metrics without data leakage.
    """
    metrics = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
    }

    if y_prob is not None:
        try:
            # Handle 2D probability array or 1D positive class probabilities
            if len(y_prob.shape) == 2 and y_prob.shape[1] >= 2:
                y_prob_pos = y_prob[:, 1]
            else:
                y_prob_pos = y_prob
            metrics["roc_auc"] = round(float(roc_auc_score(y_true, y_prob_pos)), 4)
        except Exception:
            metrics["roc_auc"] = None
    else:
        metrics["roc_auc"] = None

    return metrics

def save_metrics_json(metrics: dict, output_path: str):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
