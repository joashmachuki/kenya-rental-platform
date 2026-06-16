from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.database import engine, Base
from app.api import auth, properties, messages, locations, payments, reports, security, verification, admin

Base.metadata.create_all(bind=engine)

os.makedirs("uploads/properties", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/ids", exist_ok=True)
os.makedirs("uploads/listings", exist_ok=True)

app = FastAPI(
    title="KejaFind - Kenya Rental Platform",
    description="Modern rental property platform for Kenya",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(security.router, prefix="/api")
app.include_router(verification.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "KejaFind API - Kenya Rental Platform", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "scam_protection": "active"}
