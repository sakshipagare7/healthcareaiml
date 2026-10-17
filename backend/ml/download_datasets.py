import os
import urllib.request
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

DATASETS_INFO = {
    "diabetes.csv": {
        "url": "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv",
        "has_header": False,
        "columns": ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome"]
    },
    "heart.csv": {
        "url": "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data",
        "has_header": False,
        "columns": ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target"]
    },
    "ckd.csv": {
        "url": "https://raw.githubusercontent.com/vamshikrishnajr/chronic-kidney-disease-diagnosis/master/kidney_disease.csv",
        "has_header": True,
        "columns": None
    }
}

def download_datasets():
    print("==================================================")
    print("Downloading Clinical Machine Learning Datasets...")
    print("==================================================")
    
    headers = {'User-Agent': 'Mozilla/5.0'}

    for filename, info in DATASETS_INFO.items():
        dest_path = os.path.join(DATASETS_DIR, filename)
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
            print(f"[OK] {filename} already exists at {dest_path}")
            continue

        print(f"Downloading {filename} from {info['url']}...")
        try:
            req = urllib.request.Request(info["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=20) as response:
                content = response.read().decode('utf-8', errors='ignore')

            if not info["has_header"] and info["columns"]:
                # Convert raw text to dataframe with proper column headers
                from io import StringIO
                df = pd.read_csv(StringIO(content), header=None, names=info["columns"], na_values="?")
                # For UCI Heart, binarize target (0 = no disease, >0 = disease present)
                if filename == "heart.csv":
                    df["target"] = (df["target"] > 0).astype(int)
                df.to_csv(dest_path, index=False)
            else:
                with open(dest_path, "w", encoding="utf-8") as f:
                    f.write(content)

            print(f"[SUCCESS] Downloaded and saved {filename} ({os.path.getsize(dest_path)} bytes)")
        except Exception as e:
            print(f"[ERROR] Failed to download {filename}: {e}")

if __name__ == "__main__":
    download_datasets()
