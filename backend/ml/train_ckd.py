import os
import sys
import datetime
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, BACKEND_DIR)

from ml.evaluate import compute_classification_metrics, save_metrics_json

DATASET_PATH = os.path.join(BACKEND_DIR, "datasets", "ckd.csv")
MODEL_OUTPUT_PATH = os.path.join(BACKEND_DIR, "saved_models", "ckd.joblib")
METRICS_OUTPUT_PATH = os.path.join(BACKEND_DIR, "saved_models", "ckd_metrics.json")

def clean_ckd_dataframe(df: pd.DataFrame):
    """Clean UCI CKD dataset with handling for missing values and whitespace/tabs"""
    df = df.copy()
    if "id" in df.columns:
        df = df.drop(columns=["id"])

    # Clean target
    df["classification"] = df["classification"].astype(str).str.strip().str.replace("\t", "")
    y = (df["classification"] == "ckd").astype(int)
    X = df.drop(columns=["classification"])

    # Binary string maps
    binary_maps = {
        "rbc": {"normal": 0, "abnormal": 1},
        "pc": {"normal": 0, "abnormal": 1},
        "pcc": {"notpresent": 0, "present": 1},
        "ba": {"notpresent": 0, "present": 1},
        "htn": {"no": 0, "yes": 1},
        "dm": {"no": 0, "yes": 1, "\tno": 0, "\tyes": 1, " yes": 1},
        "cad": {"no": 0, "yes": 1, "\tno": 0},
        "appet": {"good": 0, "poor": 1},
        "pe": {"no": 0, "yes": 1},
        "ane": {"no": 0, "yes": 1}
    }

    for col, mapping in binary_maps.items():
        if col in X.columns:
            X[col] = X[col].astype(str).str.strip().map(lambda v: mapping.get(v, np.nan))

    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    return X, y

def train_ckd_model():
    print("==================================================")
    print("Training Chronic Kidney Disease (CKD) Model (Random Forest)")
    print("==================================================")

    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset not found at {DATASET_PATH}")
        print("To download the dataset, run: python ml/download_datasets.py")
        print("Or place 'kidney_disease.csv' as 'backend/datasets/ckd.csv'.")
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    X, y = clean_ckd_dataframe(df)
    feature_names = list(X.columns)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_split=4,
            random_state=42
        ))
    ])

    print("Fitting model pipeline on training fold (n =", len(X_train), ")...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)

    metrics = compute_classification_metrics(y_test, y_pred, y_prob)
    rf_model = pipeline.named_steps["classifier"]
    importances = dict(zip(feature_names, [round(float(v), 4) for v in rf_model.feature_importances_]))

    full_metrics = {
        "disease": "ckd",
        "display_name": "Chronic Kidney Disease",
        "algorithm": "RandomForestClassifier",
        "dataset_name": "UCI Chronic Kidney Disease Database",
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "accuracy": metrics["accuracy"],
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "f1": metrics["f1"],
        "roc_auc": metrics["roc_auc"],
        "feature_names": feature_names,
        "feature_importances": importances,
        "trained_at": datetime.datetime.utcnow().isoformat() + "Z"
    }

    os.makedirs(os.path.dirname(MODEL_OUTPUT_PATH), exist_ok=True)
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    save_metrics_json(full_metrics, METRICS_OUTPUT_PATH)

    print("\n--- Test Set Evaluation Results ---")
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1']:.4f}")
    print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
    print(f"\nModel saved to:   {MODEL_OUTPUT_PATH}")
    print(f"Metrics saved to: {METRICS_OUTPUT_PATH}")
    print("[SUCCESS] CKD model training complete.")

if __name__ == "__main__":
    train_ckd_model()
