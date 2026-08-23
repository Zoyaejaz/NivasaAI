import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file using absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(BASE_DIR, ".env")
status = load_dotenv(dotenv_path=dotenv_path, override=True)
print(f"[DEBUG] load_dotenv() status: {status} using path: {dotenv_path}")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres@localhost:5432/nivasa_ai")
print(f"[DEBUG] Resolved DATABASE_URL: {DATABASE_URL}")

# Check page checksums / default parameters for local connection
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
