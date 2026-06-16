from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import Property, User
from app.models.reports import PropertyReport
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ReportCreate(BaseModel):
    property_id: int
    reason: str
    description: str = None

@router.post("/report")
def create_report(request: ReportCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    property = db.query(Property).filter(Property.id == request.property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    report = PropertyReport(
        reporter_id=user.id,
        property_id=request.property_id,
        reason=request.reason,
        description=request.description,
        status="open"
    )
    
    db.add(report)
    
    property.reports_count = (property.reports_count or 0) + 1
    if property.reports_count >= 3:
        property.status = "flagged"
    
    db.commit()
    
    return {"success": True, "message": "Report submitted. Thank you for keeping our platform safe."}

@router.get("/admin/reports")
def get_reports(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reports = db.query(PropertyReport).filter(Report.status == "open").order_by(Report.created_at.desc()).all()
    
    return {
        "reports": [
            {
                "id": r.id,
                "property_id": r.property_id,
                "property_title": r.property.title if r.property else "Unknown",
                "reporter_name": r.reporter.full_name if r.reporter else "Unknown",
                "reason": r.reason,
                "description": r.description,
                "created_at": r.created_at,
                "reports_count": r.property.reports_count if r.property else 0
            }
            for r in reports
        ]
    }

@router.post("/admin/reports/{report_id}/resolve")
def resolve_report(report_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    report = db.query(PropertyReport).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = "resolved"
    report.resolved_at = datetime.utcnow()
    db.commit()
    
    return {"success": True}

@router.post("/admin/properties/{property_id}/hide")
def hide_property(property_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    property.is_hidden = True
    property.status = "suspended"
    db.commit()
    
    return {"success": True, "message": "Property hidden from public view"}
