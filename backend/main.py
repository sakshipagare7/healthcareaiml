import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # Ensures models are imported for SQLAlchemy metadata
from routers import auth_router, health_router, assessment_router, emergency_router, models_router, medication_router

# Initialize database schema tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Preventive Healthcare and Emergency Response System",
    description="Locally runnable college computer engineering capstone project API",
    version="1.0.0"
)

# CORS configuration allowing credentials for cookies
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + custom_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(health_router)
app.include_router(assessment_router)
app.include_router(emergency_router)
app.include_router(models_router)
app.include_router(medication_router)

@app.on_event("startup")
def warmup_models():
    """Verify and initialize machine learning model pipelines on startup"""
    try:
        from ml.predict import ensure_model_pipeline
        for d in ["diabetes", "cardiovascular", "ckd"]:
            ensure_model_pipeline(d)
        print("[SUCCESS] Machine learning models initialized and verified.")
    except Exception as e:
        print(f"[WARN] Startup model initialization error: {e}")

@app.get("/")
def root():
    return {
        "system": "AI-Powered Preventive Healthcare and Emergency Response System",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0",
        "environment": "Local Machine (Windows PowerShell + SQLite)"
    }

@app.get("/api/healthcheck")
def healthcheck():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
