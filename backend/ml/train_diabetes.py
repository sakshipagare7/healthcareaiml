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

# Ensure ml package imports work
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, BACKEND_DIR)

from ml.evaluate import compute_classification_metrics, save_metrics_json

DATASET_PATH = os.path.join(BACKEND_DIR, "datasets", "diabetes.csv")
MODEL_OUTPUT_PATH = os.path.join(BACKEND_DIR, "saved_models", "diabetes.joblib")
METRICS_OUTPUT_PATH = os.path.join(BACKEND_DIR, "saved_models", "diabetes_metrics.json")

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

def train_diabetes_model():
    print("==================================================")
    print("Training Diabetes Risk Model (Random Forest)")
    print("==================================================")

    if not os.path.exists(DATASET_PATH):
        print(f"[ERROR] Dataset not found at {DATASET_PATH}")
        print("To download the dataset, run: python ml/download_datasets.py")
        print("Or place 'pima-indians-diabetes.data.csv' as 'backend/datasets/diabetes.csv'.")
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # In Pima, biologically impossible zeros represent missing clinical readings
    zero_as_missing = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    for col in zero_as_missing:
        if col in df.columns:
            df[col] = df[col].replace(0, np.nan)

    X = df[FEATURE_NAMES]
    y = df["Outcome"]

    # Split train and test - Imputers & Scalers are fit ONLY on train to avoid data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_split=5,
            random_state=42
        ))
    ])

    print("Fitting model pipeline on training fold (n =", len(X_train), ")...")
    pipeline.fit(X_train, y_train)

    # Evaluate strictly on unseen test set
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)

    metrics = compute_classification_metrics(y_test, y_pred, y_prob)
    rf_model = pipeline.named_steps["classifier"]
    importances = dict(zip(FEATURE_NAMES, [round(float(v), 4) for v in rf_model.feature_importances_]))

    full_metrics = {
        "disease": "diabetes",
        "display_name": "Type 2 Diabetes Mellitus",
        "algorithm": "RandomForestClassifier",
        "dataset_name": "Pima Indians Diabetes Database",
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "accuracy": metrics["accuracy"],
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "f1": metrics["f1"],
        "roc_auc": metrics["roc_auc"],
        "feature_names": FEATURE_NAMES,
        "feature_importances": importances,
        "trained_at": datetime.datetime.utcnow().isoformat() + "Z"
    }

    # Persist model and metrics
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
    print("[SUCCESS] Diabetes model training complete.")

if __name__ == "__main__":
    train_diabetes_model()
