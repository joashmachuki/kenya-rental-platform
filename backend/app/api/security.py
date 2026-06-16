from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import User, Property, VerificationStatus, UserRole
from app.models.reports import PropertyReport
from app.models.escrow import EscrowPayment
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
import os
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

router = APIRouter(prefix="/security", tags=["Security"])

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class EscrowInitiate(BaseModel):
    property_id: int
    amount: float

class DisputeRequest(BaseModel):
    reason: str

class ReportRequest(BaseModel):
    reason: str
    details: str = None

def require_auth(user_id: str = Depends(get_current_user_id)):
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return int(user_id)

@router.post("/send-otp")
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == request.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = str(random.randint(100000, 999999))
    print(f"[OTP] Phone: {request.phone} | Code: {otp} | Expires: 10 min")
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    return {"message": "OTP sent", "otp": otp, "expires_in": "10 minutes"}

@router.post("/verify-otp")
def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == request.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.otp_code != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

    user.phone_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Phone verified successfully"}

@router.post("/verify-identity")
def verify_identity(
    id_number: str = Form(...),
    id_document: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(require_auth)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserRole.LANDLORD:
        raise HTTPException(status_code=403, detail="Only landlords can verify identity")

    allowed = {"pdf", "jpg", "jpeg", "png"}
    ext = id_document.filename.rsplit(".", 1)[1].lower() if "." in id_document.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, PNG allowed")

    filename = f"id_{user.id}_{datetime.utcnow().timestamp()}.{ext}"
    upload_dir = os.path.join("uploads", "ids")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(id_document.file.read())

    user.id_number = id_number
    user.id_document_url = f"/uploads/ids/{filename}"
    user.verification_status = VerificationStatus.PENDING
    user.verification_submitted_at = datetime.utcnow()
    db.commit()

    return {"message": "Identity verification submitted. Awaiting admin approval.", "status": "pending"}

@router.post("/initiate-escrow")
def initiate_escrow(request: EscrowInitiate, db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    prop = db.query(Property).filter(Property.id == request.property_id).first()
    if not prop or prop.is_hidden:
        raise HTTPException(status_code=404, detail="Property not found or inactive")

    if prop.approval_status != VerificationStatus.VERIFIED:
        raise HTTPException(status_code=400, detail="This property is not verified yet")

    existing = db.query(EscrowPayment).filter(
        EscrowPayment.renter_id == user.id,
        EscrowPayment.property_id == request.property_id,
        EscrowPayment.status == "held"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You already have an active payment for this property")

    escrow = EscrowPayment(
        renter_id=user.id,
        property_id=request.property_id,
        landlord_id=prop.owner_id,
        amount=request.amount,
        status="held"
    )

    db.add(escrow)
    db.commit()

    return {
        "message": "Payment held in escrow",
        "escrow_id": escrow.id,
        "status": "held",
        "instructions": "Funds are held securely. Visit the property and confirm to release payment to landlord."
    }

@router.post("/confirm-viewing/{escrow_id}")
def confirm_viewing(escrow_id: int, db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    escrow = db.query(EscrowPayment).filter(EscrowPayment.id == escrow_id).first()
    if not escrow or escrow.renter_id != user_id:
        raise HTTPException(status_code=404, detail="Escrow not found")

    if escrow.status != "held":
        raise HTTPException(status_code=400, detail=f"Payment already {escrow.status}")

    escrow.renter_confirmed_viewing = True
    escrow.status = "released"
    escrow.released_at = datetime.utcnow()

    landlord = db.query(User).filter(User.id == escrow.landlord_id).first()
    if landlord:
        landlord.trust_score += 10

    db.commit()

    return {"message": "Viewing confirmed. Payment released to landlord.", "status": "released"}

@router.post("/dispute/{escrow_id}")
def dispute_payment(escrow_id: int, request: DisputeRequest, db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    escrow = db.query(EscrowPayment).filter(EscrowPayment.id == escrow_id).first()
    if not escrow or escrow.renter_id != user_id:
        raise HTTPException(status_code=404, detail="Escrow not found")

    if escrow.status != "held":
        raise HTTPException(status_code=400, detail="Cannot dispute this payment")

    escrow.status = "disputed"
    escrow.dispute_reason = request.reason

    landlord = db.query(User).filter(User.id == escrow.landlord_id).first()
    if landlord:
        landlord.report_count += 1
        if landlord.report_count >= 3:
            landlord.is_banned = True
            landlord.ban_reason = "Multiple payment disputes"

    db.commit()

    return {"message": "Dispute filed. Our team will review within 24 hours.", "status": "disputed"}

@router.post("/report-property/{property_id}")
def report_property(property_id: int, request: ReportRequest, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    valid_reasons = ["fake_listing", "wrong_price", "scam", "already_rented", "wrong_location", "other",
                     "fake", "price", "scam_or_fraud", "unresponsive", "does_not_exist", "inappropriate", "other"]
    if request.reason not in valid_reasons:
        raise HTTPException(status_code=400, detail=f"Invalid reason. Choose from: {', '.join(valid_reasons)}")

    report = PropertyReport(
        reporter_id=0,
        property_id=property_id,
        reason=request.reason,
        details=request.details
    )

    db.add(report)
    prop.reports_count = (prop.reports_count or 0) + 1

    if prop.reports_count >= 3:
        prop.is_hidden = True
        prop.status = "flagged"
        prop.flag_reason = f"Auto-paused after {prop.reports_count} reports"

        landlord = db.query(User).filter(User.id == prop.owner_id).first()
        if landlord:
            landlord.report_count += 1
            if landlord.report_count >= 5:
                landlord.is_banned = True
                landlord.ban_reason = "Multiple properties reported"

    db.commit()

    return {
        "message": "Report submitted successfully",
        "property_status": "paused" if prop.is_hidden else "active",
        "report_count": prop.reports_count
    }

@router.post("/upload-photos/{property_id}")
def upload_photos(
    property_id: int,
    photos: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(require_auth)
):
    user = db.query(User).filter(User.id == user_id).first()
    prop = db.query(Property).filter(Property.id == property_id).first()

    if not prop or prop.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Property not found")

    uploaded = []
    for photo in photos:
        ext = photo.filename.rsplit(".", 1)[1].lower() if "." in photo.filename else ""
        if ext not in {"jpg", "jpeg", "png"}:
            continue

        filename = f"prop_{property_id}_{datetime.utcnow().timestamp()}.{ext}"
        upload_dir = os.path.join("uploads", "listings")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)

        with open(file_path, "wb") as f:
            f.write(photo.file.read())

        is_geotagged = False
        photo_lat = None
        photo_lng = None
        taken_at = None

        try:
            img = Image.open(file_path)
            exif = img._getexif()
            if exif:
                for tag_id, value in exif.items():
                    tag = TAGS.get(tag_id, tag_id)
                    if tag == "GPSInfo":
                        gps_info = {}
                        for key in value.keys():
                            decode = GPSTAGS.get(key, key)
                            gps_info[decode] = value[key]

                        def convert_dms(dms):
                            degrees = dms[0]
                            minutes = dms[1] / 60.0
                            seconds = dms[2] / 3600.0
                            return degrees + minutes + seconds

                        if "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
                            photo_lat = convert_dms(gps_info["GPSLatitude"])
                            photo_lng = convert_dms(gps_info["GPSLongitude"])
                            if gps_info.get("GPSLatitudeRef") == "S":
                                photo_lat = -photo_lat
                            if gps_info.get("GPSLongitudeRef") == "W":
                                photo_lng = -photo_lng
                            is_geotagged = True

                    if tag == "DateTimeOriginal":
                        taken_at = datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
        except Exception:
            pass

        uploaded.append({
            "url": f"/uploads/listings/{filename}",
            "is_geotagged": is_geotagged,
            "location": {"lat": photo_lat, "lng": photo_lng} if is_geotagged else None
        })

    return {"message": f"{len(uploaded)} photos uploaded", "photos": uploaded}

@router.get("/landlord-contact/{landlord_id}")
def reveal_landlord_contact(landlord_id: int, db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    user = db.query(User).filter(User.id == user_id).first()
    landlord = db.query(User).filter(User.id == landlord_id).first()

    if not landlord or landlord.role != UserRole.LANDLORD:
        raise HTTPException(status_code=404, detail="Landlord not found")

    has_paid = db.query(EscrowPayment).filter(
        EscrowPayment.renter_id == user.id,
        EscrowPayment.landlord_id == landlord_id,
        EscrowPayment.status.in_(["held", "released"])
    ).first()

    if not has_paid:
        phone_masked = landlord.phone[:6] + "XXX-XXX" if landlord.phone and len(landlord.phone) > 6 else None
        return {
            "error": "Pay unlock fee to see contact details",
            "phone": phone_masked,
            "email": "***@***.com" if landlord.email else None
        }

    return {
        "phone": landlord.phone,
        "email": landlord.email,
        "name": landlord.full_name,
        "verified": landlord.verification_status == VerificationStatus.VERIFIED,
        "trust_score": landlord.trust_score
    }

@router.get("/admin/pending-verifications")
def get_pending_verifications(db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    pending = db.query(User).filter(User.verification_status == VerificationStatus.PENDING).all()

    return {
        "verifications": [{
            "id": u.id,
            "name": u.full_name,
            "phone": u.phone,
            "id_number": u.id_number,
            "id_document": u.id_document_url,
            "submitted_at": u.verification_submitted_at.isoformat() if u.verification_submitted_at else None
        } for u in pending]
    }

@router.get("/admin/revenue")
def get_revenue(db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    return {
        "total_unlocks": 0,
        "total_subscriptions": 0,
        "total_featured": 0,
        "unlock_revenue": 0,
        "subscription_revenue": 0,
        "featured_revenue": 0,
        "total_revenue": 0
    }

@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == user_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    users = db.query(User).order_by(User.created_at.desc()).all()

    return {
        "users": [{
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
            "verified": u.verification_status.value if hasattr(u.verification_status, 'value') else str(u.verification_status),
            "phone_verified": u.phone_verified,
            "trust_score": u.trust_score,
            "report_count": u.report_count,
            "is_banned": u.is_banned,
            "created_at": u.created_at.isoformat() if u.created_at else None
        } for u in users]
    }

@router.post("/admin/verify-landlord/{user_id}")
def approve_landlord(user_id: int, db: Session = Depends(get_db), admin_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.verification_status = VerificationStatus.VERIFIED
    user.verified_at = datetime.utcnow()
    user.trust_score = 50
    db.commit()

    return {"message": f"Landlord {user.full_name} verified"}

@router.get("/admin/pending-listings")
def get_pending_listings(db: Session = Depends(get_db), user_id: int = Depends(require_auth)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    pending = db.query(Property).filter(Property.approval_status == VerificationStatus.PENDING).all()

    return {
        "listings": [{
            "id": l.id,
            "title": l.title,
            "landlord": l.owner.full_name if l.owner else None,
            "location": f"{l.county}, {l.sub_county}",
            "price": l.monthly_rent,
            "created_at": l.created_at.isoformat() if l.created_at else None
        } for l in pending]
    }

@router.post("/admin/approve-listing/{listing_id}")
def approve_listing(listing_id: int, db: Session = Depends(get_db), admin_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    prop = db.query(Property).filter(Property.id == listing_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    prop.approval_status = VerificationStatus.VERIFIED
    prop.approved_at = datetime.utcnow()
    db.commit()

    return {"message": f"Property '{prop.title}' approved"}

@router.get("/admin/reports")
def get_all_reports(db: Session = Depends(get_db), admin_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    reports = db.query(PropertyReport).order_by(PropertyReport.created_at.desc()).all()

    return {
        "reports": [{
            "id": r.id,
            "property_id": r.property_id,
            "property_title": r.property.title if r.property else "Unknown",
            "property_location": f"{r.property.county}, {r.property.sub_county}" if r.property else "",
            "landlord_name": r.property.owner.full_name if r.property and r.property.owner else "Unknown",
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "property_status": r.property.status if r.property else None,
            "property_is_hidden": r.property.is_hidden if r.property else None,
            "reports_count": r.property.reports_count if r.property else 0
        } for r in reports]
    }

@router.post("/admin/reports/{report_id}/dismiss")
def dismiss_report(report_id: int, db: Session = Depends(get_db), admin_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    report = db.query(PropertyReport).filter(PropertyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = "dismissed"
    db.commit()

    return {"message": "Report dismissed"}

@router.post("/admin/reports/{report_id}/hide-property")
def hide_reported_property(report_id: int, db: Session = Depends(get_db), admin_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    report = db.query(PropertyReport).filter(PropertyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    prop = db.query(Property).filter(Property.id == report.property_id).first()
    if prop:
        prop.is_hidden = True
        prop.status = "flagged"
        prop.flag_reason = f"Hidden by admin after report #{report.id}"

    report.status = "resolved"
    db.commit()

    return {"message": "Property hidden"}

@router.post("/admin/reports/{report_id}/ban-landlord")
def ban_reported_landlord(report_id: int, db: Session = Depends(get_db), admin_id: int = Depends(require_auth)):
    admin = db.query(User).filter(User.id == admin_id).first()
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    report = db.query(PropertyReport).filter(PropertyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    prop = db.query(Property).filter(Property.id == report.property_id).first()
    if prop:
        prop.is_hidden = True
        prop.status = "flagged"

        landlord = db.query(User).filter(User.id == prop.owner_id).first()
        if landlord:
            landlord.is_banned = True
            landlord.ban_reason = f"Banned by admin after report #{report.id}"

    report.status = "resolved"
    db.commit()

    return {"message": "Landlord banned and property hidden"}
