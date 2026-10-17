from typing import List, Dict, Any, Optional

EMERGENCY_SYMPTOMS_LIST = [
    "chest pain/pressure",
    "severe breathing difficulty",
    "stroke signs (FAST)",
    "loss of consciousness",
    "severe uncontrolled bleeding"
]

def evaluate_emergency_symptoms(selected_symptoms: List[str]) -> Dict[str, Any]:
    """
    Immediate red-flag symptom triage.
    Executes instantly with zero machine learning dependencies.
    """
    normalized_selected = [s.strip().lower() for s in selected_symptoms]
    matched = []

    for red_flag in EMERGENCY_SYMPTOMS_LIST:
        for user_sym in normalized_selected:
            if red_flag in user_sym or user_sym in red_flag or ("stroke" in user_sym and "stroke" in red_flag) or ("chest" in user_sym and "chest" in red_flag) or ("breath" in user_sym and "breath" in red_flag) or ("bleed" in user_sym and "bleed" in red_flag) or ("conscious" in user_sym and "conscious" in red_flag):
                if red_flag not in matched:
                    matched.append(red_flag)

    if matched:
        return {
            "severity": "emergency",
            "emergency_number": "112",
            "disclaimer": "This app does not contact emergency services. Call 112 immediately or seek immediate emergency department care.",
            "message": "CRITICAL EMERGENCY DETECTED: You have reported acute, life-threatening symptoms.",
            "identified_symptoms": matched,
            "actions": [
                "Call 112 (India National Emergency) immediately or have someone drive you to the nearest hospital emergency room.",
                "Do NOT attempt to drive yourself.",
                "If experiencing chest pain, sit comfortably and try to remain calm.",
                "If stroke signs (FAST: Face drooping, Arm weakness, Speech difficulty) are present, note the exact time symptoms started."
            ]
        }
    else:
        return {
            "severity": "non_emergency",
            "emergency_number": "112",
            "disclaimer": "This app does not contact emergency services. Call 112 if your condition changes or you develop sudden acute symptoms.",
            "message": "No immediate critical emergency red flags reported in the checklist.",
            "identified_symptoms": [],
            "actions": [
                "Monitor your condition closely.",
                "Schedule a routine appointment with your primary physician for any ongoing or concerning symptoms.",
                "If you develop chest discomfort, severe shortness of breath, or sudden weakness, call 112 right away."
            ]
        }

def evaluate_emergency_measurements(
    systolic_bp: Optional[int] = None,
    diastolic_bp: Optional[int] = None,
    blood_glucose: Optional[float] = None,
    heart_rate: Optional[int] = None
) -> Dict[str, Any]:
    """
    Check vital sign thresholds for immediate clinical urgency.
    Rules:
    - Systolic >= 180 or <= 90 -> urgent
    - Diastolic >= 120 or <= 60 -> urgent
    - Glucose >= 300 or <= 50 -> urgent
    - Heart rate >= 130 or <= 40 -> urgent
    """
    alerts = []

    # Blood Pressure checks
    if systolic_bp is not None:
        if systolic_bp >= 180:
            alerts.append({
                "measurement": "Systolic Blood Pressure",
                "value": float(systolic_bp),
                "status": "urgent",
                "rule_triggered": f"Systolic BP {systolic_bp} mmHg >= 180 mmHg (Hypertensive Crisis range)",
                "advice": "Retest after 5 minutes. If still elevated, seek immediate emergency medical evaluation."
            })
        elif systolic_bp <= 90:
            alerts.append({
                "measurement": "Systolic Blood Pressure",
                "value": float(systolic_bp),
                "status": "urgent",
                "rule_triggered": f"Systolic BP {systolic_bp} mmHg <= 90 mmHg (Severe Hypotension)",
                "advice": "Sit or lie down. Hydrate if able, and seek urgent clinical attention if feeling dizzy or faint."
            })

    if diastolic_bp is not None:
        if diastolic_bp >= 120:
            alerts.append({
                "measurement": "Diastolic Blood Pressure",
                "value": float(diastolic_bp),
                "status": "urgent",
                "rule_triggered": f"Diastolic BP {diastolic_bp} mmHg >= 120 mmHg (Hypertensive Crisis range)",
                "advice": "Seek immediate emergency medical evaluation."
            })
        elif diastolic_bp <= 60:
            alerts.append({
                "measurement": "Diastolic Blood Pressure",
                "value": float(diastolic_bp),
                "status": "urgent",
                "rule_triggered": f"Diastolic BP {diastolic_bp} mmHg <= 60 mmHg (Low Diastolic Pressure)",
                "advice": "Monitor closely for dizziness, lightheadedness, or fatigue."
            })

    # Glucose checks
    if blood_glucose is not None:
        if blood_glucose >= 300.0:
            alerts.append({
                "measurement": "Blood Glucose",
                "value": float(blood_glucose),
                "status": "urgent",
                "rule_triggered": f"Blood Glucose {blood_glucose} mg/dL >= 300 mg/dL (Severe Hyperglycemia)",
                "advice": "Urgent risk of ketoacidosis or hyperosmolar state. Contact emergency services or endocrinologist promptly."
            })
        elif blood_glucose <= 50.0:
            alerts.append({
                "measurement": "Blood Glucose",
                "value": float(blood_glucose),
                "status": "urgent",
                "rule_triggered": f"Blood Glucose {blood_glucose} mg/dL <= 50 mg/dL (Severe Hypoglycemia)",
                "advice": "Consume 15-20g fast-acting carbohydrates immediately (juice/glucose tablet). Seek urgent help if unassisted."
            })

    # Heart Rate checks
    if heart_rate is not None:
        if heart_rate >= 130:
            alerts.append({
                "measurement": "Heart Rate",
                "value": float(heart_rate),
                "status": "urgent",
                "rule_triggered": f"Heart Rate {heart_rate} bpm >= 130 bpm (Severe Tachycardia at rest)",
                "advice": "Rest quietly. If accompanied by shortness of breath, dizziness, or chest tightness, call 112."
            })
        elif heart_rate <= 40:
            alerts.append({
                "measurement": "Heart Rate",
                "value": float(heart_rate),
                "status": "urgent",
                "rule_triggered": f"Heart Rate {heart_rate} bpm <= 40 bpm (Severe Bradycardia)",
                "advice": "Seek prompt clinical assessment, especially if experiencing syncope, fatigue, or confusion."
            })

    has_urgent = any(a["status"] == "urgent" for a in alerts)

    return {
        "severity": "urgent" if has_urgent else "normal",
        "emergency_number": "112",
        "disclaimer": "This app does not contact emergency services. Call 112 in case of severe symptoms or acute crisis.",
        "message": "Urgent measurement alerts require clinical attention." if has_urgent else "All entered measurements are outside critical acute alarm thresholds.",
        "alerts": alerts
    }
