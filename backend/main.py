import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from routers import auth, complaints, notices, assets, analytics, assistant, notifications

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NivasaAI API",
    description="AI-powered Smart Society Operations & Predictive Maintenance Platform API Docs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
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
