from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from uuid import uuid4
from app.core.database import get_db
from app.models.models import Property, PropertyStatus, User, UserRole, VerificationStatus
from app.schemas.schemas import PropertyCreate, PropertyUpdate, PropertyResponse, PropertyListResponse
from app.core.security import get_current_user_id
from sqlalchemy import desc

router = APIRouter(prefix="/properties", tags=["Properties"])

UPLOAD_DIR = "uploads/properties"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB

def save_upload_file(upload_file: UploadFile, subfolder: str = "") -> str:
    if subfolder:
        save_dir = os.path.join(UPLOAD_DIR, subfolder)
        os.makedirs(save_dir, exist_ok=True)
    else:
        save_dir = UPLOAD_DIR
    
    ext = upload_file.filename.split(".")[-1] if "." in upload_file.filename else ""
    filename = f"{uuid4()}.{ext}" if ext else str(uuid4())
    filepath = os.path.join(save_dir, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    if subfolder:
        return f"/uploads/properties/{subfolder}/{filename}"
    return f"/uploads/properties/{filename}"

@router.get("")
@router.get("/")
def list_properties(
    county: Optional[str] = None,
    sub_county: Optional[str] = None,
    ward: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    furnished: Optional[bool] = None,
    sort_by: str = "newest",
    page: int = 1,
    per_page: int = 12,
    db: Session = Depends(get_db)
):
    query = db.query(Property).filter(Property.status == PropertyStatus.AVAILABLE)
    
    if county:
        query = query.filter(Property.county == county)
    if sub_county:
        query = query.filter(Property.sub_county == sub_county)
    if ward:
        query = query.filter(Property.ward == ward)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if min_price:
        query = query.filter(Property.monthly_rent >= min_price)
    if max_price:
        query = query.filter(Property.monthly_rent <= max_price)
    if bedrooms:
        query = query.filter(Property.bedrooms == bedrooms)
    if furnished is not None:
        query = query.filter(Property.furnished == furnished)
    
    if sort_by == "price_asc":
        query = query.order_by(Property.monthly_rent.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Property.monthly_rent.desc())
    elif sort_by == "popular":
        query = query.order_by(Property.view_count.desc())
    else:
        query = query.order_by(desc(Property.created_at))
    
    total = query.count()
    properties = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "properties": properties,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }

@router.get("/my-properties")
def my_properties(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    properties = db.query(Property).filter(Property.owner_id == int(user_id)).order_by(desc(Property.created_at)).all()
    return {"properties": properties}


@router.get("/{property_id}")
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return property

@router.post("/")
def create_property(
    title: str = Form(...),
    description: str = Form(...),
    property_type: str = Form(...),
    county: str = Form(...),
    sub_county: str = Form(...),
    ward: str = Form(...),
    town: Optional[str] = Form(None),
    street_address: Optional[str] = Form(None),
    monthly_rent: float = Form(...),
    deposit_amount: Optional[float] = Form(0),
    negotiable: bool = Form(False),
    bedrooms: Optional[int] = Form(0),
    bathrooms: Optional[int] = Form(0),
    furnished: bool = Form(False),
    electricity_reliability: Optional[str] = Form(None),
    electricity_token: Optional[str] = Form(None),
    square_footage: Optional[float] = Form(None),
    amenities: Optional[str] = Form(""),
    contact_phone: Optional[str] = Form(None),
    contact_email: Optional[str] = Form(None),
    preferred_contact: str = Form("phone"),
    images: List[UploadFile] = File(default=[]),
    videos: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required to list properties")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or user.role != UserRole.LANDLORD:
        raise HTTPException(status_code=403, detail="Only landlords can list properties")
    
    if not user.phone_verified:
        raise HTTPException(status_code=403, detail="Phone verification required. Please verify your phone number first.")
    
    if user.verification_status != VerificationStatus.VERIFIED:
        raise HTTPException(status_code=403, detail="Identity verification required. Please complete identity verification first.")
    
    image_urls = []
    for image in images:
        if image.filename and image.content_type in ALLOWED_IMAGE_TYPES:
            image_urls.append(save_upload_file(image))
    
    video_urls = []
    for video in videos:
        if video.filename and video.content_type in ALLOWED_VIDEO_TYPES:
            video_urls.append(save_upload_file(video, "videos"))
    
    amenities_list = [a.strip() for a in amenities.split(",") if a.strip()] if amenities else []
    
    db_property = Property(
        title=title,
        description=description,
        property_type=property_type.upper(),
        county=county,
        sub_county=sub_county,
        ward=ward,
        town=town,
        street_address=street_address,
        monthly_rent=monthly_rent,
        deposit_amount=deposit_amount or 0,
        negotiable=negotiable,
        bedrooms=bedrooms or 0,
        bathrooms=bathrooms or 0,
        furnished=furnished,
        electricity_reliability=electricity_reliability,
        electricity_token=electricity_token,
        square_footage=square_footage,
        amenities=amenities_list,
        images=image_urls,
        videos=video_urls,
        contact_phone=contact_phone or user.phone,
        contact_email=contact_email or user.email,
        preferred_contact=preferred_contact,
        owner_id=user.id,
        status=PropertyStatus.AVAILABLE
    )
    
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property



@router.put("/{property_id}")
async def update_property(
    property_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    if property.owner_id != int(user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    data = await request.json()
    field_map = {
        "price": "monthly_rent",
        "title": "title",
        "description": "description",
        "location": "location",
        "property_type": "property_type",
        "bedrooms": "bedrooms",
        "bathrooms": "bathrooms",
        "square_feet": "square_feet",
        "amenities": "amenities",
        "contact_phone": "contact_phone",
        "contact_email": "contact_email",
        "images": "images",
        "videos": "videos"
    }
    
    for frontend_field, backend_field in field_map.items():
        if frontend_field in data and data[frontend_field] is not None:
            value = data[frontend_field]; setattr(property, backend_field, value.upper() if backend_field == "property_type" and isinstance(value, str) else value)
    
    db.commit()
    db.refresh(property)
    return property

@router.put("/{property_id}/status")
def update_property_status(
    property_id: int,
    status: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    property = db.query(Property).filter(Property.id == property_id, Property.owner_id == int(user_id)).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found or not yours")
    
    if status == "available":
        property.status = PropertyStatus.AVAILABLE
    elif status == "rented":
        property.status = PropertyStatus.RENTED
    elif status == "pending":
        property.status = PropertyStatus.PENDING
    else:
        raise HTTPException(status_code=400, detail="Invalid status. Use 'available', 'rented', or 'pending'")
    
    db.commit()
    return {"message": f"Property marked as {status}"}

@router.delete("/{property_id}")
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    
    property = db.query(Property).filter(Property.id == property_id, Property.owner_id == int(user_id)).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found or not yours")
    
    db.delete(property)
    db.commit()
    return {"message": "Property deleted successfully"}
