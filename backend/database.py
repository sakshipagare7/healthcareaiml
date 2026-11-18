import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

engine = None

if DATABASE_URL:
    # Render and Heroku use postgres://, but SQLAlchemy requires postgresql://
    # In SQLAlchemy 2.1+, explicitly specifying postgresql+psycopg2:// ensures
    # it uses the installed psycopg2-binary driver
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    try:
        # Configure production pool with pre-ping and recycle to prevent stale connections on cloud providers
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10
        )
        print("[SUCCESS] Connected to production PostgreSQL database via DATABASE_URL.")
    except Exception as e:
        print(f"[WARN] Failed to initialize PostgreSQL engine with DATABASE_URL: {e}. Falling back to SQLite.")
        engine = None

if engine is None:
    # Fallback to local SQLite database
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(BASE_DIR, "healthcare.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    print("[INFO] Using local SQLite database.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
