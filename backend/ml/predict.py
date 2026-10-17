import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from models.health_profile import HealthProfile
from services.recommendation_service import generate_preventive_recommendations

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")

FEATURE_CONFIGS = {
    "diabetes": {
        "model_file": os.path.join(SAVED_MODELS_DIR, "diabetes.joblib"),
        "metrics_file": os.path.join(SAVED_MODELS_DIR, "diabetes_metrics.json"),
        "display_name": "Type 2 Diabetes",
        "required_fields": ["age", "bmi", "blood_glucose", "diastolic_bp"],
        "train_script": "python ml/train_diabetes.py"
    },
    "cardiovascular": {
        "model_file": os.path.join(SAVED_MODELS_DIR, "cardiovascular.joblib"),
        "metrics_file": os.path.join(SAVED_MODELS_DIR, "cardiovascular_metrics.json"),
        "display_name": "Cardiovascular Disease",
        "required_fields": ["age", "sex", "systolic_bp", "total_cholesterol", "heart_rate"],
        "train_script": "python ml/train_cardio.py"
    },
    "ckd": {
        "model_file": os.path.join(SAVED_MODELS_DIR, "ckd.joblib"),
        "metrics_file": os.path.join(SAVED_MODELS_DIR, "ckd_metrics.json"),
        "display_name": "Chronic Kidney Disease",
        "required_fields": ["age", "systolic_bp", "serum_creatinine"],
        "train_script": "python ml/train_ckd.py"
    }
}

def determine_risk_category(probability: float) -> str:
    """
    Categorize risk score.
    Documented as prototype category (Low <30%, Moderate 30-60%, High >60%),
    explicitly labeled prototype, not a clinical threshold.
    """
    if probability < 0.30:
        return "Low"
    elif probability <= 0.60:
        return "Moderate"
    else:
        return "High"

def get_model_status() -> Dict[str, Any]:
    """Inspect availability of each model without running predictions"""
    status_summary = {}
    for disease, cfg in FEATURE_CONFIGS.items():
        is_trained = os.path.exists(cfg["model_file"])
        status_summary[disease] = {
            "disease": disease,
            "display_name": cfg["display_name"],
            "is_trained": is_trained,
            "status": "ready" if is_trained else "not_trained",
            "file_path": cfg["model_file"],
            "dataset_name": cfg["display_name"] + " Benchmark",
            "required_features": cfg["required_fields"],
            "optional_features": ["lifestyle", "family_history", "symptoms"],
            "instructions": None if is_trained else f"Model not trained. Run '{cfg['train_script']}'"
        }
    return status_summary

def get_model_metrics() -> Dict[str, Any]:
    """Retrieve saved test-set metrics for trained models"""
    metrics_summary = {}
    for disease, cfg in FEATURE_CONFIGS.items():
        if os.path.exists(cfg["metrics_file"]):
            try:
                with open(cfg["metrics_file"], "r", encoding="utf-8") as f:
                    metrics_summary[disease] = json.load(f)
            except Exception as e:
                metrics_summary[disease] = {"error": f"Failed reading metrics: {str(e)}"}
        else:
            metrics_summary[disease] = {
                "disease": disease,
                "status": "not_trained",
                "instructions": f"Metrics unavailable. Run '{cfg['train_script']}'"
            }
    return metrics_summary

def build_feature_row_diabetes(profile: HealthProfile) -> pd.DataFrame:
    features = [
        "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
        "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
    ]
    pedigree = 0.85 if profile.family_history_diabetes else 0.35
    row = {
        "Pregnancies": 0.0 if profile.sex == "male" else np.nan,
        "Glucose": float(profile.blood_glucose),
        "BloodPressure": float(profile.diastolic_bp),
        "SkinThickness": np.nan,
        "Insulin": np.nan,
        "BMI": float(profile.bmi),
        "DiabetesPedigreeFunction": pedigree,
        "Age": float(profile.age)
    }
    return pd.DataFrame([row], columns=features)

def build_feature_row_cardio(profile: HealthProfile) -> pd.DataFrame:
    features = [
        "age", "sex", "cp", "trestbps", "chol", "fbs",
        "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"
    ]
    symptoms_str = (profile.symptoms or "").lower()
    chest_pain = 1.0 if "chest" in symptoms_str else 4.0
    fbs = 1.0 if (profile.blood_glucose and profile.blood_glucose > 120) else 0.0

    row = {
        "age": float(profile.age),
        "sex": 1.0 if profile.sex == "male" else 0.0,
        "cp": chest_pain,
        "trestbps": float(profile.systolic_bp),
        "chol": float(profile.total_cholesterol),
        "fbs": fbs,
        "restecg": np.nan,
        "thalach": float(profile.heart_rate),
        "exang": np.nan,
        "oldpeak": np.nan,
        "slope": np.nan,
        "ca": np.nan,
        "thal": np.nan
    }
    return pd.DataFrame([row], columns=features)

def build_feature_row_ckd(profile: HealthProfile) -> pd.DataFrame:
    features = [
        "age", "bp", "sg", "al", "su", "rbc", "pc", "pcc", "ba",
        "bgr", "bu", "sc", "sod", "pot", "hemo", "pcv", "wc", "rc",
        "htn", "dm", "cad", "appet", "pe", "ane"
    ]
    htn = 1.0 if (profile.systolic_bp >= 140 or profile.diastolic_bp >= 90) else 0.0
    dm = 1.0 if ((profile.blood_glucose and profile.blood_glucose >= 126) or profile.family_history_diabetes) else 0.0
    cad = 1.0 if profile.family_history_cardio else 0.0

    row = {
        "age": float(profile.age),
        "bp": float(profile.systolic_bp),
        "sg": np.nan, "al": np.nan, "su": np.nan, "rbc": np.nan, "pc": np.nan, "pcc": np.nan, "ba": np.nan,
        "bgr": float(profile.blood_glucose) if profile.blood_glucose else np.nan,
        "bu": float(profile.blood_urea) if profile.blood_urea is not None else np.nan,
        "sc": float(profile.serum_creatinine) if profile.serum_creatinine is not None else np.nan,
        "sod": np.nan, "pot": np.nan, "hemo": np.nan, "pcv": np.nan, "wc": np.nan, "rc": np.nan,
        "htn": htn,
        "dm": dm,
        "cad": cad,
        "appet": np.nan, "pe": np.nan, "ane": np.nan
    }
    return pd.DataFrame([row], columns=features)

def predict_single_disease(disease: str, profile: HealthProfile, all_recommendations: list) -> Dict[str, Any]:
    cfg = FEATURE_CONFIGS.get(disease)
    if not cfg:
        return {"disease": disease, "status": "unavailable", "instructions": f"Unknown disease model '{disease}'"}

    # 1. Check if model file exists
    if not os.path.exists(cfg["model_file"]):
        return {
            "disease": disease,
            "status": "not_trained",
            "risk_score": None,
            "risk_category": "Model Not Ready",
            "contributing_factors": [],
            "recommendations": [],
            "model_version": None,
            "missing_fields": [],
            "instructions": f"Model not ready. Please run '{cfg['train_script']}' to train on local benchmark dataset."
        }

    # 2. Check for required input fields
    missing_fields = []
    for req in cfg["required_fields"]:
        val = getattr(profile, req, None)
        if val is None:
            missing_fields.append(req)

    if missing_fields:
        return {
            "disease": disease,
            "status": "unavailable",
            "risk_score": None,
            "risk_category": "Data Incomplete",
            "contributing_factors": [],
            "recommendations": [],
            "model_version": None,
            "missing_fields": missing_fields,
            "instructions": f"Missing required health inputs: {', '.join(missing_fields)}. Please update your health information."
        }

    # 3. Load model and run inference
    try:
        pipeline = joblib.load(cfg["model_file"])

        if disease == "diabetes":
            X_input = build_feature_row_diabetes(profile)
        elif disease == "cardiovascular":
            X_input = build_feature_row_cardio(profile)
        elif disease == "ckd":
            X_input = build_feature_row_ckd(profile)
        else:
            return {"disease": disease, "status": "unavailable"}

        prob_pos = float(pipeline.predict_proba(X_input)[0][1])
        category = determine_risk_category(prob_pos)

        # Extract top contributing features from Random Forest
        rf_model = pipeline.named_steps.get("classifier")
        contributing_factors = []
        if rf_model and hasattr(rf_model, "feature_importances_"):
            feature_names = list(X_input.columns)
            importances = rf_model.feature_importances_
            sorted_indices = np.argsort(importances)[::-1][:4]
            for idx in sorted_indices:
                feat = feature_names[idx]
                val = X_input.iloc[0][feat]
                contributing_factors.append({
                    "feature": feat,
                    "importance": round(float(importances[idx]), 4),
                    "user_value": None if np.isnan(val) else round(float(val), 2),
                    "description": f"Feature '{feat}' weighted {round(float(importances[idx])*100, 1)}% in model decision."
                })

        # Relevant recommendations filtered for this disease category
        disease_categories = {
            "diabetes": ["Endocrine & Diabetes", "Metabolic & Lifestyle", "Physical Health"],
            "cardiovascular": ["Cardiovascular", "Metabolic & Lifestyle", "Lifestyle Intervention"],
            "ckd": ["Renal / Kidney", "Cardiovascular", "Endocrine & Diabetes"]
        }
        relevant_recs = [
            r for r in all_recommendations
            if r.get("category") in disease_categories.get(disease, []) or r.get("category") == "Preventive Screening"
        ]

        return {
            "disease": disease,
            "status": "ok",
            "risk_score": round(prob_pos, 4),
            "risk_category": category,
            "contributing_factors": contributing_factors,
            "recommendations": relevant_recs,
            "model_version": "RandomForest_v1.0",
            "missing_fields": [],
            "instructions": None
        }
    except Exception as e:
        return {
            "disease": disease,
            "status": "unavailable",
            "risk_score": None,
            "risk_category": "Execution Error",
            "contributing_factors": [],
            "recommendations": [],
            "model_version": None,
            "missing_fields": [],
            "instructions": f"Prediction error: {str(e)}"
        }

def run_all_disease_predictions(profile: HealthProfile) -> List[Dict[str, Any]]:
    """Execute prediction pipelines for all three chronic diseases"""
    all_recs = generate_preventive_recommendations(profile)
    results = []
    for d in ["diabetes", "cardiovascular", "ckd"]:
        res = predict_single_disease(d, profile, all_recs)
        results.append(res)
    return results

class MockProfile:
    """Lightweight object mimicking HealthProfile for simulation testing"""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

def run_counterfactual_simulation(baseline: HealthProfile, sim_changes: dict) -> Dict[str, Any]:
    """
    Execute 'What-If' counterfactual explainable AI simulation.
    Compares baseline disease risk scores against hypothetically modified lifestyle/vital parameters.
    """
    # 1. Baseline predictions
    baseline_res = {r["disease"]: r for r in run_all_disease_predictions(baseline)}

    # 2. Build simulated profile attributes
    sim_attrs = {
        "id": baseline.id,
        "user_id": baseline.user_id,
        "age": baseline.age,
        "sex": baseline.sex,
        "height_cm": baseline.height_cm,
        "weight_kg": baseline.weight_kg,
        "bmi": float(sim_changes.get("simulated_bmi") or baseline.bmi),
        "systolic_bp": int(sim_changes.get("simulated_systolic_bp") or baseline.systolic_bp),
        "diastolic_bp": int(sim_changes.get("simulated_diastolic_bp") or baseline.diastolic_bp),
        "heart_rate": baseline.heart_rate,
        "blood_glucose": float(sim_changes.get("simulated_blood_glucose")) if sim_changes.get("simulated_blood_glucose") is not None else baseline.blood_glucose,
        "total_cholesterol": float(sim_changes.get("simulated_total_cholesterol")) if sim_changes.get("simulated_total_cholesterol") is not None else baseline.total_cholesterol,
        "smoking_status": sim_changes.get("simulated_smoking_status") or baseline.smoking_status,
        "physical_activity": sim_changes.get("simulated_physical_activity") or baseline.physical_activity,
        "serum_creatinine": baseline.serum_creatinine,
        "blood_urea": baseline.blood_urea,
        "hba1c": baseline.hba1c,
        "hdl": baseline.hdl,
        "ldl": baseline.ldl,
        "family_history_diabetes": baseline.family_history_diabetes,
        "family_history_cardio": baseline.family_history_cardio,
        "family_history_kidney": baseline.family_history_kidney,
        "symptoms": baseline.symptoms
    }
    sim_profile = MockProfile(**sim_attrs)

    # 3. Simulated predictions
    sim_res = {r["disease"]: r for r in run_all_disease_predictions(sim_profile)}

    comparisons = []
    total_drop = 0.0
    improvements_count = 0

    display_names = {
        "diabetes": "Type 2 Diabetes",
        "cardiovascular": "Cardiovascular Disease",
        "ckd": "Chronic Kidney Disease"
    }

    for d in ["diabetes", "cardiovascular", "ckd"]:
        base_item = baseline_res.get(d, {})
        sim_item = sim_res.get(d, {})

        base_score = base_item.get("risk_score")
        sim_score = sim_item.get("risk_score")

        delta = None
        pct_change = None
        key_driver = "No significant risk alteration."

        if base_score is not None and sim_score is not None:
            delta = round(sim_score - base_score, 4)
            pct_change = round(((sim_score - base_score) / max(base_score, 0.01)) * 100, 1)

            if delta < -0.02:
                improvements_count += 1
                total_drop += abs(delta)
                drivers = []
                if sim_attrs["bmi"] < baseline.bmi:
                    drivers.append(f"BMI reduction ({baseline.bmi} -> {sim_attrs['bmi']})")
                if sim_attrs["systolic_bp"] < baseline.systolic_bp or sim_attrs["diastolic_bp"] < baseline.diastolic_bp:
                    drivers.append(f"BP normalization ({baseline.systolic_bp}/{baseline.diastolic_bp} -> {sim_attrs['systolic_bp']}/{sim_attrs['diastolic_bp']})")
                if sim_attrs["blood_glucose"] is not None and baseline.blood_glucose is not None and sim_attrs["blood_glucose"] < baseline.blood_glucose:
                    drivers.append(f"glycemic control ({baseline.blood_glucose} -> {sim_attrs['blood_glucose']} mg/dL)")
                key_driver = f"Risk reduced primarily via {', '.join(drivers)}." if drivers else "Risk decreased through targeted vital improvement."
            elif delta > 0.02:
                key_driver = "Elevated risk under higher simulated vital thresholds."
            else:
                key_driver = "Risk profile remains stable at target vitals."

        comparisons.append({
            "disease": d,
            "display_name": display_names.get(d, d),
            "baseline_risk": base_score,
            "baseline_category": base_item.get("risk_category"),
            "simulated_risk": sim_score,
            "simulated_category": sim_item.get("risk_category"),
            "risk_delta": delta,
            "percent_change": pct_change,
            "key_driver": key_driver
        })

    if improvements_count > 0:
        summary = f"Simulated lifestyle and clinical adjustments yield measurable risk reductions across {improvements_count} conditions."
    else:
        summary = "Simulated metrics evaluated with real Random Forest models."

    return {
        "comparisons": comparisons,
        "overall_summary": summary
    }
