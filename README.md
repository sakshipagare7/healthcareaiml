# AI-Powered Preventive Healthcare and Emergency Response System

**College Computer Engineering Capstone Project**  
*A locally runnable, privacy-preserving, full-stack clinical decision-support and emergency triage platform.*

---

## 1. Project Description

Modern healthcare systems often operate reactively—treating acute disease complications rather than intervening during early subclinical stages. The **AI-Powered Preventive Healthcare and Emergency Response System** addresses this challenge by providing individuals with an authenticated, private, locally runnable web application that:
1. **Tracks Personal Health Vitals and Laboratory Markers**: Users manually input their real physiological vitals (blood pressure, heart rate, height, weight, glucose, lipid panels, renal labs).
2. **Executes Machine Learning Risk Predictions**: Holdout-trained Scikit-Learn Random Forest classifiers estimate individualized risk probabilities for three major chronic diseases: **Type 2 Diabetes Mellitus**, **Cardiovascular Disease**, and **Chronic Kidney Disease (CKD)**.
3. **Explains Predictions Transparently**: Leverages tree feature importances (Gini impurity reduction) to show users which specific biomarkers most heavily influenced the model's estimate.
4. **Delivers Rule-Based Preventive Guidance**: Synthesizes evidence-informed lifestyle and clinical follow-up recommendations directly tied to the user's specific readings (e.g., blood pressure, BMI, fasting glucose).
5. **Provides Instant Emergency Triage**: Evaluates high-acuity red-flag symptoms (chest crisis, FAST stroke signs, breathing failure) and acute vital extremes with zero latency, providing direct guidance to dial **India National Emergency Number 112**.

### Academic & Clinical Integrity Rules
- **No demo records or synthetic pre-population**: Every user begins with an empty dashboard until they record their own measurements.
- **Strict User Isolation**: Every record is linked via database foreign keys to the authenticated user ID (`user_id = current_user.id`). User A can never inspect or alter User B's health records or assessments.
- **No Hardcoded Risk Scores or Fabricated Outputs**: If a model has not been trained, or if a required laboratory biomarker is unentered, the API returns a documented `not_trained` or `unavailable` status code with instructions—never a random or faked score.
- **Academic Prototype Classification**: Risk categories (Low `<30%`, Moderate `30–60%`, High `>60%`) are explicitly labeled as educational prototypes, not definitive clinical diagnostic thresholds.

---

## 2. Features

- **Authentication & Security**:
  - Secure account registration and login.
  - Passwords hashed using `bcrypt` (12 rounds of salt).
  - Cryptographically signed JWT tokens stored in `httpOnly`, `SameSite=Lax` cookies.
  - FastAPI dependency injection validates authentication on every private endpoint.
- **Health Profile Management**:
  - Form validation with physiological range boundaries (e.g., Age 1–120, Height 50–250 cm, BP 40–300 mmHg).
  - Live client-side and backend-verified Body Mass Index (BMI) calculation: $\text{BMI} = \frac{\text{weight (kg)}}{(\text{height (m)})^2}$.
  - Clearly designated required core vitals vs. optional clinical lab tests.
  - Optional unentered laboratory tests stored strictly as `NULL`, never as `0`.
- **Machine Learning Inference**:
  - Separate dedicated pipelines for Diabetes, Cardiovascular Disease, and CKD.
  - Automated feature imputation via `SimpleImputer(strategy='median')` and standard feature scaling via `StandardScaler()`.
  - Missing field contract detection: lists exact missing inputs required for each disease model.
- **Explainable Decision Factors**:
  - Highlights top contributing features using Random Forest `feature_importances_`.
  - Compares user measurements against model feature weights.
- **Rule-Based Preventive Engine**:
  - Deterministic clinical guidelines triggered by user vitals (e.g., Systolic BP > 130 mmHg, Fasting Glucose ≥ 126 mg/dL, BMI > 25 kg/m²).
  - Discloses exact trigger criteria with mandatory educational disclaimer.
- **Emergency Response System**:
  - **Symptom Check**: Evaluates chest pain, severe breathing difficulty, FAST stroke signs, syncope, and uncontrolled bleeding.
  - **Measurement Urgent Alerts**: Checks vital crisis thresholds (Systolic $\ge 180$ or $\le 90$, Diastolic $\ge 120$ or $\le 60$, Glucose $\ge 300$ or $\le 50$, Heart rate $\ge 130$ or $\le 40$).
  - One-click `tel:112` call integration.
- **Longitudinal History**:
  - Immutable assessment archive. Updating current vitals never mutates historical assessment records.
- **Model Performance & Metrics Transparency**:
  - UI page rendering holdout test-set Accuracy, Precision, Recall, F1, and ROC-AUC.
  - Interactive Recharts bar visualization of feature importance distributions.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | SQLite (serverless, file-based: `backend/healthcare.db`) |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Joblib |
| **Authentication** | `bcrypt` password hashing, `python-jose` JWT, `httpOnly` Cookies |
| **Runtime & Shell** | Windows 10/11, PowerShell, VS Code |

*Zero external cloud services, zero paid APIs, zero Docker requirements, zero external database servers.*

---

## 4. Folder Structure

```
aimlproject/
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/page.tsx               # Login page
│   │   ├── (auth)/register/page.tsx            # User registration page
│   │   ├── dashboard/page.tsx                  # Command center & vitals summary
│   │   ├── health/new/page.tsx                 # Health metrics entry form
│   │   ├── health/edit/[id]/page.tsx           # Health metrics edit form
│   │   ├── prediction/page.tsx                 # Assessment execution runner
│   │   ├── prediction/results/[assessmentId]/page.tsx # Detailed ML results
│   │   ├── history/page.tsx                    # Historical assessment archives
│   │   ├── emergency/page.tsx                  # Red-flag symptoms & vital triage
│   │   ├── models/page.tsx                     # Model metrics & test performance
│   │   ├── layout.tsx                          # Root layout with AuthProvider
│   │   ├── globals.css                         # Tailwind CSS directives
│   │   └── page.tsx                            # Project landing page
│   ├── components/
│   │   ├── Sidebar.tsx                         # Navigation sidebar
│   │   ├── Navbar.tsx                          # Top navigation header
│   │   └── AppShell.tsx                        # Authenticated route wrapper
│   ├── lib/
│   │   ├── api.ts                              # Typed API client with credentials
│   │   └── auth.tsx                            # React AuthContext & useAuth hook
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.mjs                         # API proxy rewrites to port 8000
├── backend/
│   ├── main.py                                 # FastAPI application & CORS
│   ├── database.py                             # SQLite engine & get_db dependency
│   ├── models/                                 # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── health_profile.py
│   │   ├── assessment.py
│   │   └── prediction_result.py
│   ├── schemas/                                # Pydantic v2 validation schemas
│   │   ├── auth.py
│   │   ├── health.py
│   │   ├── assessment.py
│   │   ├── emergency.py
│   │   └── model_status.py
│   ├── routers/                                # FastAPI API routes
│   │   ├── auth.py
│   │   ├── health.py
│   │   ├── assessment.py
│   │   ├── emergency.py
│   │   └── models.py
│   ├── services/                               # Business logic & rule engines
│   │   ├── auth_service.py
│   │   ├── health_service.py
│   │   ├── recommendation_service.py
│   │   └── emergency_service.py
│   ├── ml/                                     # Machine learning pipeline
│   │   ├── download_datasets.py                # Automated benchmark dataset fetcher
│   │   ├── evaluate.py                         # Test-set metrics calculation
│   │   ├── train_diabetes.py                   # Pima Diabetes Random Forest trainer
│   │   ├── train_cardio.py                     # UCI Heart Disease trainer
│   │   ├── train_ckd.py                        # UCI CKD trainer
│   │   └── predict.py                          # Multi-model inference & mapper
│   ├── datasets/                               # Benchmark clinical CSV datasets
│   │   ├── diabetes.csv
│   │   ├── heart.csv
│   │   └── ckd.csv
│   ├── saved_models/                           # Trained .joblib pipelines & metrics
│   │   ├── diabetes.joblib / diabetes_metrics.json
│   │   ├── cardiovascular.joblib / cardiovascular_metrics.json
│   │   └── ckd.joblib / ckd_metrics.json
│   └── requirements.txt
├── README.md
└── .gitignore
```

---

## 5. Windows PowerShell Setup

Open **PowerShell** as an ordinary user.

### Step 5.1: Backend Virtual Environment & Dependencies
```powershell
# Navigate to the backend directory
cd C:\Users\HP\Desktop\aimlproject\backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip and install all required packages
pip install -r requirements.txt
```

> **PowerShell Execution Policy Note**: If you encounter an execution policy error when activating the virtual environment, run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Step 5.2: Frontend Dependencies
Open a second PowerShell window:
```powershell
# Navigate to the frontend directory
cd C:\Users\HP\Desktop\aimlproject\frontend

# Install node dependencies
npm install
```

---

## 6. Dataset Download Instructions

The system trains on three recognized medical benchmark datasets:

1. **Type 2 Diabetes Mellitus**:
   - **Dataset**: Pima Indians Diabetes Database (National Institute of Diabetes and Digestive and Kidney Diseases).
   - **Target**: Binary `Outcome` (0: Non-diabetic, 1: Diabetic).
   - **File placement**: `backend/datasets/diabetes.csv`
   - **Direct URL**: `https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv`

2. **Cardiovascular Disease**:
   - **Dataset**: UCI Heart Disease Database (Cleveland Clinic Foundation).
   - **Target**: `target` (0: Absence, 1: Presence of heart disease).
   - **File placement**: `backend/datasets/heart.csv`
   - **Direct URL**: `https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data`

3. **Chronic Kidney Disease (CKD)**:
   - **Dataset**: UCI Chronic Kidney Disease Database.
   - **Target**: `classification` (0: `notckd`, 1: `ckd`).
   - **File placement**: `backend/datasets/ckd.csv`
   - **Direct URL**: `https://raw.githubusercontent.com/vamshikrishnajr/chronic-kidney-disease-diagnosis/master/kidney_disease.csv`

### Automated Download Command
Run the bundled automated fetcher inside your backend virtual environment:
```powershell
cd C:\Users\HP\Desktop\aimlproject\backend
.\venv\Scripts\python ml/download_datasets.py
```
This script downloads, validates, and sets column headers automatically into `backend/datasets/`.

---

## 7. Model Training Commands

Train all three Scikit-Learn pipelines. Each script performs 80/20 train/test splitting, fits preprocessing imputers and Random Forest classifiers exclusively on the training fold, evaluates metrics on the holdout test fold, and outputs the serialized model `.joblib` and metrics `.json`:

```powershell
cd C:\Users\HP\Desktop\aimlproject\backend

# 1. Train Diabetes Random Forest Model
.\venv\Scripts\python ml/train_diabetes.py

# 2. Train Cardiovascular Random Forest Model
.\venv\Scripts\python ml/train_cardio.py

# 3. Train Chronic Kidney Disease (CKD) Random Forest Model
.\venv\Scripts\python ml/train_ckd.py
```

### Real Test-Set Benchmark Results
- **Diabetes (Pima)**: Test Accuracy: `72.73%`, ROC-AUC: `0.8113`
- **Cardiovascular (Cleveland)**: Test Accuracy: `90.16%`, ROC-AUC: `0.9513`
- **CKD (UCI Kidney)**: Test Accuracy: `100.00%`, ROC-AUC: `1.0000`

---

## 8. Running the Application

### Start the FastAPI Backend (Port 8000)
In the first PowerShell terminal:
```powershell
cd C:\Users\HP\Desktop\aimlproject\backend
.\venv\Scripts\uvicorn main:app --reload --port 8000
```
- API root: `http://localhost:8000`
- Swagger Interactive API documentation: `http://localhost:8000/docs`

### Start the Next.js Frontend (Port 3000)
In the second PowerShell terminal:
```powershell
cd C:\Users\HP\Desktop\aimlproject\frontend
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 9. End-to-End Walkthrough

1. **Register User A**:
   - Navigate to `http://localhost:3000/register`.
   - Create an account (e.g., Full Name: `Alice Sharma`, Email: `alice@example.com`, Password: `Password123!`).
2. **Empty Dashboard Verification**:
   - Alice lands on `/dashboard`.
   - Dashboard explicitly displays: *"No Health Data Yet. Your dashboard is currently empty because no measurements have been recorded."*
3. **Record Health Measurements**:
   - Click **Enter Health Information** (`/health/new`).
   - Enter Age: `52`, Sex: `Female`, Height: `162 cm`, Weight: `74 kg` (watch live BMI calculate to `28.2 kg/m²`).
   - Enter Systolic BP: `138 mmHg`, Diastolic BP: `88 mmHg`, Heart Rate: `76 bpm`.
   - Enter Fasting Blood Glucose: `135 mg/dL`, Total Cholesterol: `215 mg/dL`, Serum Creatinine: `1.2 mg/dL`, Blood Urea: `38 mg/dL`.
   - Click **Save Measurements**.
4. **Inspect Populated Dashboard**:
   - Dashboard now reflects Alice's real vitals with active category chips.
5. **Execute Machine Learning Assessment**:
   - Click **Run Assessment** (`/prediction`).
   - Click **Run AI Assessment**. The backend executes all three Scikit-Learn pipelines.
   - Redirects to `/prediction/results/[assessmentId]`.
   - View calibrated probabilities (e.g., Diabetes `44.8% (Moderate)`, Cardiovascular `52.1% (Moderate)`, CKD `98.6% (High)`).
   - Review top contributing features (e.g., Glucose, BMI, Age, Thalach).
   - Review rule-based preventive suggestions (e.g., elevated fasting glucose clinical follow-up, weight management).
6. **Assessment History**:
   - Click **History** (`/history`) to inspect the archived assessment.
7. **Verify User Isolation (Security Acceptance Test)**:
   - Click **Sign Out**.
   - Register User B (e.g., `bob@example.com`).
   - Bob lands on a completely clean, empty dashboard.
   - Attempting to query Alice's assessment directly via `GET /api/assessments/1` returns `404 Not Found / Access Denied`.
8. **Emergency Triage Check**:
   - Navigate to `/emergency`.
   - Check *"Chest pain, tightness, or radiating pressure"*.
   - Click **Evaluate Symptoms Checklist**.
   - System immediately displays a prominent red emergency alert, action instructions, and direct `tel:112` call integration.

---

## 10. Known Limitations

1. **Academic Demonstration Scope**: The models are trained on historical benchmark datasets (Pima, Cleveland, UCI CKD) and serve as an academic decision-support prototype. They do not substitute for comprehensive in-person medical evaluation by a licensed physician.
2. **Feature Coverage**: In clinical practice, laboratory assays include hundreds of biomarkers (e.g., electrolytes, urine microscopy). The prototype focuses on accessible ambulatory checkup metrics.
3. **Imputation Assumptions**: Where optional values (such as skinfold thickness or ECG details) are unrecorded, median imputation is utilized to ensure numerical stability during pipeline inference.

---

## 11. Emergency System Explanation

Medical emergencies require **instantaneous, zero-latency safety protocols**. Therefore:
- The emergency symptom checker **does not invoke machine learning models**.
- It runs deterministically with zero dependencies. If any acute red-flag symptom is selected (chest pain, acute dyspnea, FAST stroke signs, loss of consciousness, massive hemorrhage), it immediately flags an emergency.
- Vital sign checks enforce clear physiological crisis boundaries:
  - **Systolic Blood Pressure**: $\ge 180\text{ mmHg}$ (Hypertensive Crisis) or $\le 90\text{ mmHg}$ (Severe Hypotension).
  - **Diastolic Blood Pressure**: $\ge 120\text{ mmHg}$ or $\le 60\text{ mmHg}$.
  - **Blood Glucose**: $\ge 300\text{ mg/dL}$ (Hyperglycemic Crisis) or $\le 50\text{ mg/dL}$ (Severe Hypoglycemia).
  - **Heart Rate**: $\ge 130\text{ bpm}$ (Severe Tachycardia) or $\le 40\text{ bpm}$ (Severe Bradycardia).
- **Non-Negotiable Disclaimer**: The application never falsely claims to dispatch emergency personnel. It clearly instructs: *"This app does not contact emergency services. Call 112."*

---

## 12. Viva Explanation of ML Workflow

*(Reference Guide for Capstone Oral Examination & Project Defense)*

```
[Clinical Datasets] 
       │ (diabetes.csv, heart.csv, ckd.csv)
       ▼
[Data Preprocessing] 
       │ 1. Replace biologically impossible zeros (Glucose, BP, Insulin) with NaN
       │ 2. Clean categorical string fields & trim whitespace
       ▼
[Holdout Split: 80% Train / 20% Test]
       │ Stratified split preserves disease class prevalence
       ├─── Training Fold (80%) ─────────────── Holdout Test Fold (20%) ───┐
       │                                                                   │
       ▼                                                                   │
[Scikit-Learn Pipeline Fitting]                                            │
       │ 1. SimpleImputer(strategy='median')  <-- Fit ONLY on train        │
       │ 2. StandardScaler()                  <-- Fit ONLY on train        │
       │ 3. RandomForestClassifier()          <-- Fit ONLY on train        │
       ▼                                                                   │
[Model Persistence]                                                        │
       │ Saved to backend/saved_models/<disease>.joblib                    │
       │                                                                   │
       ▼                                                                   │
[Holdout Test Evaluation] <────────────────────────────────────────────────┘
       │ Evaluate strictly on unseen test set:
       │ Accuracy, Precision, Recall, F1-Score, ROC-AUC
       │ Persist to backend/saved_models/<disease>_metrics.json
       ▼
[Online Inference Service (predict.py)]
       │ 1. Check model readiness (.joblib existence)
       │ 2. Validate user health input completeness
       │ 3. Execute pipeline.predict_proba()
       │ 4. Extract top Random Forest feature importances
       │ 5. Trigger rule-based preventive recommendations
       ▼
[Client Presentation & Transparency]
       UI displays probability %, prototype category, feature factors, and rules.
```

### Key Examiner Questions & Answers:
- **Q: Why use a Scikit-Learn `Pipeline`?**  
  *A:* Wrapping the `SimpleImputer`, `StandardScaler`, and `RandomForestClassifier` into a unified `Pipeline` guarantees that feature imputation medians and scaling parameters are computed strictly from the training partition and seamlessly applied to test or real-time user inputs without data leakage.
- **Q: Why Random Forest instead of deep learning?**  
  *A:* Random Forest handles tabular clinical data exceptionally well, is robust to outliers and multicollinearity, does not require massive compute resources, and provides native feature importance metrics (`feature_importances_`) for model interpretability.
- **Q: How is data leakage prevented?**  
  *A:* `X_train, X_test, y_train, y_test` are partitioned **before** fitting imputers and scalers. The imputer and scaler only call `.fit()` on `X_train`. They only call `.transform()` on `X_test` and production user vectors.
- **Q: How is user data isolated?**  
  *A:* In the backend, user identity is verified via cryptographically signed JWT cookies decoded in a dependency. All SQLAlchemy queries filter explicitly by `user_id = current_user.id`.
