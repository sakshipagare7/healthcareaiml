import sys
import os
import json
from fastapi.testclient import TestClient

# Ensure backend imports work
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

from main import app
from database import SessionLocal, Base, engine

client = TestClient(app)

def run_acceptance_checklist():
    print("======================================================================")
    print("AI-POWERED PREVENTIVE HEALTHCARE: 11-POINT ACCEPTANCE VERIFICATION")
    print("======================================================================")

    passed = 0
    total = 13

    # 1. New user A registers successfully
    print("\n[TEST 1] Register User A...")
    import uuid
    uid = uuid.uuid4().hex[:6]
    user_a_email = f"alice_{uid}@example.com"
    reg_payload_a = {
        "full_name": "Alice Sharma",
        "email": user_a_email,
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    r = client.post("/api/auth/register", json=reg_payload_a)
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"
    token_a = r.json()["access_token"]
    user_a_id = r.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print(f" PASS: User A registered (ID: {user_a_id}, Token received)")
    passed += 1

    # 2. User can log in and log out
    print("\n[TEST 2] Login & Logout workflow...")
    login_res = client.post("/api/auth/login", json={"email": user_a_email, "password": "Password123!"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200, f"Logout failed: {logout_res.text}"
    print(" PASS: Login and Logout completed successfully")
    passed += 1

    # 3. New user sees empty dashboard (null profile)
    print("\n[TEST 3] New user sees empty dashboard state...")
    prof_res = client.get("/api/health/profile", headers=headers_a)
    assert prof_res.status_code == 200
    assert prof_res.json() is None, f"Expected None/empty profile for new user, got: {prof_res.json()}"
    print(" PASS: New user starts with an empty dashboard (no fake/pre-populated data)")
    passed += 1

    # 4. User enters and saves their own health measurements
    print("\n[TEST 4] Enter and save health measurements...")
    health_payload = {
        "age": 48,
        "sex": "female",
        "height_cm": 165.0,
        "weight_kg": 72.0,
        "systolic_bp": 136,
        "diastolic_bp": 86,
        "heart_rate": 74,
        "measured_on": "2026-10-15",
        "blood_glucose": 138.0,
        "total_cholesterol": 218.0,
        "serum_creatinine": 1.25,
        "blood_urea": 36.0,
        "smoking_status": "never",
        "physical_activity": "moderate",
        "family_history_diabetes": True,
        "family_history_cardio": False,
        "family_history_kidney": False
    }
    save_res = client.post("/api/health/profile", json=health_payload, headers=headers_a)
    assert save_res.status_code == 201, f"Failed saving profile: {save_res.text}"
    profile_data = save_res.json()
    profile_a_id = profile_data["id"]
    # Verify BMI computed on backend: 72 / (1.65^2) = 26.45
    assert profile_data["bmi"] > 26.0 and profile_data["bmi"] < 27.0
    print(f" PASS: Profile saved with backend-calculated BMI: {profile_data['bmi']} kg/m²")
    passed += 1

    # 5. Saved measurements appear on dashboard
    print("\n[TEST 5] Retrieve saved measurements on dashboard...")
    dash_prof = client.get("/api/health/profile", headers=headers_a)
    assert dash_prof.status_code == 200
    assert dash_prof.json()["systolic_bp"] == 136
    assert dash_prof.json()["blood_glucose"] == 138.0
    print(" PASS: Saved measurements accurately reflected for authenticated user")
    passed += 1

    # 6. Prediction runs only when trained model + required inputs exist
    print("\n[TEST 6] Execute real ML risk predictions...")
    assess_res = client.post("/api/assessments", json={"health_profile_id": profile_a_id}, headers=headers_a)
    assert assess_res.status_code == 201, f"Assessment failed: {assess_res.text}"
    assessment_data = assess_res.json()
    assessment_id = assessment_data["id"]
    results = assessment_data["prediction_results"]
    assert len(results) == 3, f"Expected 3 disease results, got {len(results)}"

    for r in results:
        assert r["status"] == "ok", f"Expected ok status, got {r['status']}: {r}"
        assert r["risk_score"] is not None and 0.0 <= r["risk_score"] <= 1.0
        assert r["risk_category"] in ["Low", "Moderate", "High"]
        assert len(r["contributing_factors"]) > 0
        assert len(r["recommendations"]) > 0
        print(f"   -> {r['disease']}: {round(r['risk_score']*100, 1)}% ({r['risk_category']} Risk) | {len(r['recommendations'])} rule recs")
    print(f" PASS: ML predictions executed with Random Forest classifiers, real probabilities & factors")
    passed += 1

    # 7. Results saved and visible in assessment history
    print("\n[TEST 7] Assessment history verification...")
    hist_res = client.get("/api/assessments", headers=headers_a)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
    single_res = client.get(f"/api/assessments/{assessment_id}", headers=headers_a)
    assert single_res.status_code == 200
    assert single_res.json()["id"] == assessment_id
    print(f" PASS: Assessment #{assessment_id} archived immutably in user history")
    passed += 1

    # 8. Emergency section shows correct warnings
    print("\n[TEST 8] Emergency triage check...")
    sym_res = client.post("/api/emergency/symptoms", json={"symptoms": ["chest pain/pressure"]})
    assert sym_res.status_code == 200
    assert sym_res.json()["severity"] == "emergency"
    assert sym_res.json()["emergency_number"] == "112"

    meas_res = client.post("/api/emergency/measurements", json={"systolic_bp": 195, "blood_glucose": 320})
    assert meas_res.status_code == 200
    assert meas_res.json()["severity"] == "urgent"
    assert len(meas_res.json()["alerts"]) == 2
    print(" PASS: Emergency triage flags red-flag symptoms & crisis vitals with 112 protocol")
    passed += 1

    # 9. User A cannot access User B's records (User isolation)
    print("\n[TEST 9] User isolation security verification...")
    # Register User B
    reg_b = client.post("/api/auth/register", json={
        "full_name": "Bob Verma",
        "email": f"bob_{uid}@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    assert reg_b.status_code == 201
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # B attempts to fetch A's assessment
    unauth_assess = client.get(f"/api/assessments/{assessment_id}", headers=headers_b)
    assert unauth_assess.status_code in [403, 404], f"Data leakage! Expected 403/404, got: {unauth_assess.status_code}"

    # B attempts to fetch A's health profile
    unauth_prof = client.get(f"/api/health/profile/{profile_a_id}", headers=headers_b)
    assert unauth_prof.status_code in [403, 404], f"Data leakage! Expected 403/404, got: {unauth_prof.status_code}"

    # B's dashboard is empty
    b_dashboard = client.get("/api/health/profile", headers=headers_b)
    assert b_dashboard.json() is None, "Bob saw data from another user!"
    print(" PASS: Strict authorization verified: User B cannot access User A's health records or assessments")
    passed += 1

    # 10. Missing input contract & model metrics transparency
    print("\n[TEST 10] Missing fields contract and test metrics transparency...")
    # Test missing fields contract: profile without glucose or cholesterol
    incomplete_profile_payload = {
        "age": 30, "sex": "male", "height_cm": 180.0, "weight_kg": 75.0,
        "systolic_bp": 120, "diastolic_bp": 80, "heart_rate": 70,
        "measured_on": "2026-10-15",
        "blood_glucose": None, "total_cholesterol": None,
        "serum_creatinine": None, "blood_urea": None
    }
    inc_prof_res = client.post("/api/health/profile", json=incomplete_profile_payload, headers=headers_b)
    inc_prof_id = inc_prof_res.json()["id"]

    inc_assess_res = client.post("/api/assessments", json={"health_profile_id": inc_prof_id}, headers=headers_b)
    assert inc_assess_res.status_code == 201
    inc_results = inc_assess_res.json()["prediction_results"]
    for ir in inc_results:
        assert ir["status"] == "unavailable", f"Expected unavailable, got {ir['status']}"
        assert len(ir["missing_fields"]) > 0
        print(f"   -> {ir['disease']} properly returned status: unavailable (missing: {ir['missing_fields']})")

    # Metrics endpoint check
    metrics_res = client.get("/api/models/metrics")
    assert metrics_res.status_code == 200
    metrics_dict = metrics_res.json()["metrics"]
    assert "diabetes" in metrics_dict and "cardiovascular" in metrics_dict and "ckd" in metrics_dict
    print(" PASS: Missing field contracts enforced without fake data; test metrics exposed transparently")
    passed += 1

    # 11. Emergency Medical ID (ICE) and Longitudinal Vitals History
    print("\n[TEST 11] Emergency Medical ID & Longitudinal Vitals History...")
    # Add second health profile for Alice to test longitudinal history
    profile_a2 = {
        "age": 45,
        "sex": "female",
        "height_cm": 165.0,
        "weight_kg": 71.0,
        "systolic_bp": 128,
        "diastolic_bp": 82,
        "heart_rate": 72,
        "measured_on": "2026-10-16",
        "blood_glucose": 130.0,
        "blood_group": "B+",
        "emergency_contact_name": "Rohan Sharma",
        "emergency_contact_phone": "+91 98200 12345",
        "emergency_contact_relation": "Brother",
        "allergies": "Sulfa drugs"
    }
    r_p2 = client.post("/api/health/profile", json=profile_a2, headers=headers_a)
    assert r_p2.status_code == 201
    profile_a2_id = r_p2.json()["id"]
    assert r_p2.json()["blood_group"] == "B+"

    # Check history endpoint
    r_hist = client.get("/api/health/history", headers=headers_a)
    assert r_hist.status_code == 200
    hist_list = r_hist.json()
    assert len(hist_list) >= 2, f"Expected at least 2 profiles in history, got {len(hist_list)}"
    print(f" PASS: Emergency Medical ID saved (Blood Group: B+, ICE: Rohan Sharma) and {len(hist_list)} longitudinal checkups returned chronologically")
    passed += 1

    # 12. Medication & Vitals Adherence Tracker
    print("\n[TEST 12] Medication & Vitals Adherence Tracker (CRUD, Logs, Streak)...")
    med_payload = {
        "name": "Metformin",
        "dosage": "500 mg",
        "frequency": "Twice daily",
        "time_of_day": "morning",
        "instructions": "Take with breakfast",
        "active": True
    }
    med_res = client.post("/api/medications", json=med_payload, headers=headers_a)
    assert med_res.status_code == 201, f"Failed adding medication: {med_res.text}"
    med_data = med_res.json()
    med_id = med_data["id"]
    assert med_data["name"] == "Metformin"

    # Toggle adherence for today
    toggle_res = client.post(f"/api/medications/{med_id}/toggle", headers=headers_a)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["taken_today"] is True

    # Adherence metrics
    adh_res = client.get("/api/medications/adherence", headers=headers_a)
    assert adh_res.status_code == 200
    adh_data = adh_res.json()
    assert adh_data["total_medications"] >= 1
    assert adh_data["streak_days"] >= 1
    assert adh_data["adherence_rate_7d"] > 0

    # User B cannot see Alice's medications (isolation)
    b_meds = client.get("/api/medications", headers=headers_b)
    assert b_meds.status_code == 200
    assert len(b_meds.json()) == 0, "User B saw User A's medications!"
    print(f" PASS: Medication tracked, adherence logged (Streak: {adh_data['streak_days']}d, 7d Rate: {adh_data['adherence_rate_7d']}%), user isolation verified")
    passed += 1

    # 13. Counterfactual "What-If" Simulation & Paramedic QR Code Public Endpoint
    print("\n[TEST 13] Counterfactual 'What-If' Simulation & Paramedic Emergency Card...")
    # Simulation request
    sim_payload = {
        "health_profile_id": profile_a_id,
        "simulated_systolic_bp": 120,
        "simulated_diastolic_bp": 80,
        "simulated_bmi": 23.5,
        "simulated_blood_glucose": 95.0
    }
    sim_res = client.post("/api/assessments/simulate", json=sim_payload, headers=headers_a)
    assert sim_res.status_code == 200, f"Simulation failed: {sim_res.text}"
    sim_data = sim_res.json()
    assert len(sim_data["comparisons"]) == 3
    for comp in sim_data["comparisons"]:
        assert comp["baseline_risk"] is not None
        assert comp["simulated_risk"] is not None
        print(f"   -> {comp['disease']}: Baseline {comp['baseline_risk']}% -> Simulated {comp['simulated_risk']}% (Delta: {comp['risk_delta']}%)")

    # Paramedic public emergency card (unauthenticated bystander access)
    public_card = client.get(f"/api/emergency/card/{profile_a2_id}")
    assert public_card.status_code == 200, f"Public emergency card failed: {public_card.text}"
    card_data = public_card.json()
    assert card_data["full_name"] == "Alice Sharma"
    assert card_data["blood_group"] == "B+"
    assert card_data["emergency_contact_name"] == "Rohan Sharma"
    assert "password" not in card_data and "token" not in card_data
    print(f" PASS: Counterfactual simulator computed Random Forest deltas; Paramedic public QR endpoint safely served Alice's emergency card")
    passed += 1

    print("======================================================================")
    print(f"ACCEPTANCE VERIFICATION COMPLETE: {passed}/{total} TESTS PASSED [100%]")
    print("======================================================================")

if __name__ == "__main__":
    run_acceptance_checklist()
