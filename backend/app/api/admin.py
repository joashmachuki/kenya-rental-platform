from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, VerificationStatus
from app.core.security import get_current_user_id

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/pending-verifications")
def get_pending_verifications(
    db: Session = Depends(get_db),
    admin_id: str = Depends(get_current_user_id)
):
    if not admin_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    admin = db.query(User).filter(User.id == int(admin_id)).first()
    if not admin or admin.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    pending_users = db.query(User).filter(
        User.verification_status == VerificationStatus.PENDING,
        User.id_document_url.isnot(None)
    ).all()
    
    return {
        "users": [
            {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "phone": u.phone,
                "id_number": u.id_number,
                "id_document_url": u.id_document_url,
                "verification_submitted_at": u.verification_submitted_at,
                "created_at": u.created_at
            }
            for u in pending_users
        ]
    }
