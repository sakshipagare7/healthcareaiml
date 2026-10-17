from typing import List, Dict, Any
from models.health_profile import HealthProfile

EDUCATIONAL_DISCLAIMER = "Educational only. Not a substitute for professional medical advice, diagnosis, or treatment."

def generate_preventive_recommendations(profile: HealthProfile) -> List[Dict[str, str]]:
    """
    Generate evidence-informed, rule-based preventive recommendations
    directly from user's entered measurements.
    Strictly NO medication names, NO dosages, NO cure claims.
    """
    recommendations: List[Dict[str, str]] = []

    # 1. Blood Pressure Rules
    if profile.systolic_bp >= 140 or profile.diastolic_bp >= 90:
        recommendations.append({
            "title": "Hypertension Clinical Review",
            "advice": "Schedule an in-person clinical review to confirm blood pressure readings and evaluate cardiovascular risk.",
            "trigger_rule": f"Systolic BP ({profile.systolic_bp} mmHg) >= 140 or Diastolic BP ({profile.diastolic_bp} mmHg) >= 90 (Stage 2 Hypertension criteria).",
            "category": "Cardiovascular"
        })
    elif profile.systolic_bp > 130 or profile.diastolic_bp > 80:
        recommendations.append({
            "title": "Elevated Blood Pressure Monitoring",
            "advice": "Discuss blood pressure trends with a clinician. Prioritize dietary sodium reduction and stress management.",
            "trigger_rule": f"Systolic BP ({profile.systolic_bp} mmHg) > 130 or Diastolic BP ({profile.diastolic_bp} mmHg) > 80 (Stage 1 criteria).",
            "category": "Cardiovascular"
        })

    # 2. Body Mass Index Rules
    if profile.bmi >= 30.0:
        recommendations.append({
            "title": "Weight & Metabolic Health Consultation",
            "advice": "Consider a structured nutrition and physical activity plan supervised by a qualified dietitian or physician.",
            "trigger_rule": f"BMI is {profile.bmi} kg/m² (>= 30.0 kg/m² indicates Obesity classification).",
            "category": "Metabolic & Lifestyle"
        })
    elif profile.bmi > 25.0:
        recommendations.append({
            "title": "Weight Management & Nutrition",
            "advice": "Consider a balanced dietary pattern rich in whole grains and regular daily physical movement.",
            "trigger_rule": f"BMI is {profile.bmi} kg/m² (> 25.0 kg/m² indicates Overweight classification).",
            "category": "Metabolic & Lifestyle"
        })
    elif profile.bmi < 18.5:
        recommendations.append({
            "title": "Underweight Nutritional Review",
            "advice": "Consult a healthcare provider to assess nutritional intake and rule out underlying metabolic causes.",
            "trigger_rule": f"BMI is {profile.bmi} kg/m² (< 18.5 kg/m² indicates Underweight).",
            "category": "Nutrition"
        })

    # 3. Blood Glucose & HbA1c Rules
    if profile.blood_glucose is not None:
        if profile.blood_glucose >= 126.0:
            recommendations.append({
                "title": "Fasting Blood Glucose Follow-up",
                "advice": "Follow up with a clinician for repeat diagnostic testing and personalized metabolic evaluation.",
                "trigger_rule": f"Fasting glucose is {profile.blood_glucose} mg/dL (>= 126 mg/dL meets clinical threshold for diagnostic review).",
                "category": "Endocrine & Diabetes"
            })
        elif profile.blood_glucose >= 100.0:
            recommendations.append({
                "title": "Impaired Fasting Glucose Screening",
                "advice": "Discuss prediabetes screening and lifestyle strategies such as fiber intake and aerobic exercise.",
                "trigger_rule": f"Fasting glucose is {profile.blood_glucose} mg/dL (100-125 mg/dL indicates Impaired Fasting Glucose / Prediabetes range).",
                "category": "Endocrine & Diabetes"
            })

    if profile.hba1c is not None:
        if profile.hba1c >= 6.5:
            recommendations.append({
                "title": "Elevated HbA1c Glycated Hemoglobin",
                "advice": "Follow up promptly with a primary care clinician for diagnostic evaluation.",
                "trigger_rule": f"HbA1c is {profile.hba1c}% (>= 6.5% indicates chronic hyperglycemia).",
                "category": "Endocrine & Diabetes"
            })
        elif profile.hba1c >= 5.7:
            recommendations.append({
                "title": "Prediabetes HbA1c Range",
                "advice": "Adopt preventive lifestyle practices focusing on sugar moderation and sustained physical activity.",
                "trigger_rule": f"HbA1c is {profile.hba1c}% (5.7% - 6.4% indicates elevated risk of developing type 2 diabetes).",
                "category": "Endocrine & Diabetes"
            })

    # 4. Kidney Markers (Creatinine & Urea)
    if profile.serum_creatinine is not None and profile.serum_creatinine > 1.3:
        recommendations.append({
            "title": "Renal Function Assessment",
            "advice": "Discuss serum creatinine with a physician to evaluate glomerular filtration rate and hydration status.",
            "trigger_rule": f"Serum creatinine is {profile.serum_creatinine} mg/dL (> 1.3 mg/dL warrants kidney health review).",
            "category": "Renal / Kidney"
        })

    if profile.blood_urea is not None and profile.blood_urea > 40.0:
        recommendations.append({
            "title": "Blood Urea Level Evaluation",
            "advice": "Ensure adequate daily hydration and consult a physician regarding nitrogen clearance.",
            "trigger_rule": f"Blood urea is {profile.blood_urea} mg/dL (> 40.0 mg/dL is above typical baseline).",
            "category": "Renal / Kidney"
        })

    # 5. Lipid Panel (Cholesterol)
    if profile.total_cholesterol is not None and profile.total_cholesterol > 200.0:
        recommendations.append({
            "title": "Lipid Profile & Heart Health Consultation",
            "advice": "Discuss a comprehensive lipid profile with a clinician, focusing on reducing saturated fats and increasing soluble fiber.",
            "trigger_rule": f"Total cholesterol is {profile.total_cholesterol} mg/dL (> 200 mg/dL indicates elevated circulating lipids).",
            "category": "Cardiovascular"
        })

    # 6. Lifestyle Factors
    if profile.smoking_status == "current":
        recommendations.append({
            "title": "Smoking Cessation Program",
            "advice": "Smoking cessation support is strongly recommended. Quitting tobacco rapidly lowers heart attack and stroke risk.",
            "trigger_rule": "Current tobacco use reported (substantially amplifies vascular, pulmonary, and oncological risks).",
            "category": "Lifestyle Intervention"
        })

    if profile.physical_activity == "sedentary":
        recommendations.append({
            "title": "Physical Activity Optimization",
            "advice": "Aim for at least 150 minutes of moderate aerobic activity (e.g., brisk walking) per week, started gradually.",
            "trigger_rule": "Sedentary activity level reported (prolonged inactivity is an independent cardiovascular risk factor).",
            "category": "Physical Health"
        })

    # 7. Family History
    if profile.family_history_cardio or profile.family_history_diabetes or profile.family_history_kidney:
        triggers = []
        if profile.family_history_cardio: triggers.append("Cardiovascular")
        if profile.family_history_diabetes: triggers.append("Diabetes")
        if profile.family_history_kidney: triggers.append("Renal")
        recommendations.append({
            "title": "Family Risk Factor Vigilance",
            "advice": "Inform your physician of your family history to tailor individualized early screening intervals.",
            "trigger_rule": f"Family history noted for: {', '.join(triggers)}.",
            "category": "Preventive Screening"
        })

    return recommendations
