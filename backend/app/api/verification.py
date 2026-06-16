from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
import os
import shutil
from uuid import uuid4
from app.core.database import get_db
from app.models.models import User, VerificationStatus
from app.core.security import get_current_user_id

router = APIRouter(prefix="/verification", tags=["Verification"])

UPLOAD_DIR = "uploads/ids"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_SIZE = 5 * 1024 * 1024

@router.post("/upload-id")
def upload_id_document(
    id_number: str = Form(...),
    id_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if id_file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, WebP, PDF allowed")
    
    ext = id_file.filename.split(".")[-1] if "." in id_file.filename else "jpg"
    filename = f"id_{user.id}_{uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(id_file.file, buffer)
    
    user.id_number = id_number
    user.id_document_url = f"/uploads/ids/{filename}"
    user.verification_status = VerificationStatus.PENDING
    user.verification_submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "ID uploaded successfully. Pending admin review.",
        "verification_status": user.verification_status,
        "id_document_url": user.id_document_url
    }

@router.get("/status")
def get_verification_status(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "verification_status": user.verification_status,
        "id_number": user.id_number,
        "id_document_url": user.id_document_url,
        "verification_submitted_at": user.verification_submitted_at,
        "verified_at": user.verified_at,
        "phone_verified": user.phone_verified
    }

@router.post("/admin/approve/{target_user_id}")
def approve_verification(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin_id: str = Depends(get_current_user_id)
):
    if not admin_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    admin = db.query(User).filter(User.id == int(admin_id)).first()
    if not admin or admin.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.verification_status = VerificationStatus.VERIFIED
    user.verified_at = datetime.utcnow()
    user.is_verified = True
    
    db.commit()
    db.refresh(user)
    
    return {"message": "User verified successfully", "user_id": target_user_id}

@router.post("/admin/reject/{target_user_id}")
def reject_verification(
    target_user_id: int,
    reason: str = "",
    db: Session = Depends(get_db),
    admin_id: str = Depends(get_current_user_id)
):
    if not admin_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    admin = db.query(User).filter(User.id == int(admin_id)).first()
    if not admin or admin.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.verification_status = VerificationStatus.REJECTED
    user.id_document_url = None
    user.id_number = None
    
    db.commit()
    db.refresh(user)
    
    return {"message": "Verification rejected", "reason": reason, "user_id": target_user_id}
