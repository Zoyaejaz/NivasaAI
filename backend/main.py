import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base, SessionLocal
from models import User
from routers import auth, complaints, notices, assets, analytics, assistant, notifications

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

# Seed default admin & resident users if they do not exist
def seed_default_users():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            print("No admin user found. Seeding default admin user...")
            from auth import hash_password
            admin_pwd = hash_password("admin123")
            admin_user = User(
                email="admin@nivasa.ai",
                hashed_password=admin_pwd,
                full_name="Aarav Sharma",
                role="admin",
                flat_number="Tower 1-101",
                phone_number="9876543210"
            )
            db.add(admin_user)
            
        # Check if resident exists
        resident = db.query(User).filter(User.role == "resident").first()
        if not resident:
            print("No resident user found. Seeding default resident user...")
            from auth import hash_password
            res_pwd = hash_password("resident123")
            resident_user = User(
                email="resident@nivasa.ai",
                hashed_password=res_pwd,
                full_name="Neha Patel",
                role="resident",
                flat_number="Tower 2-504",
                phone_number="8765432109"
            )
            db.add(resident_user)
            
        db.commit()
        print("Database verification/seeding completed.")
    except Exception as e:
        print(f"Error seeding default users: {e}")
        db.rollback()
    finally:
        db.close()

seed_default_users()

app = FastAPI(
    title="NivasaAI API",
    description="AI-powered Smart Society Operations & Predictive Maintenance Platform API Docs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(notices.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

# Serve uploaded static files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "name": "NivasaAI Smart Society API",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
