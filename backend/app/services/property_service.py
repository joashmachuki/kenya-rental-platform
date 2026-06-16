from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from fastapi import HTTPException
from typing import List, Optional
from app.models.models import Property, User, PropertyStatus, PropertyType
from app.schemas.schemas import PropertyCreate, PropertyUpdate, PropertySearch

def create_property(db: Session, property_data: PropertyCreate, owner_id: int):
    db_property = Property(
        **property_data.model_dump(exclude={"images"}),
        images=property_data.images or [],
        owner_id=owner_id
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

def get_property_by_id(db: Session, property_id: int):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if prop:
        prop.view_count += 1
        db.commit()
    return prop

def search_properties(db: Session, filters: PropertySearch):
    query = db.query(Property).filter(Property.status == PropertyStatus.AVAILABLE)

    if filters.county:
        query = query.filter(Property.county == filters.county)
    if filters.sub_county:
        query = query.filter(Property.sub_county == filters.sub_county)
    if filters.ward:
        query = query.filter(Property.ward == filters.ward)
    if filters.property_type:
        query = query.filter(Property.property_type == filters.property_type)
    if filters.min_price is not None:
        query = query.filter(Property.monthly_rent >= filters.min_price)
    if filters.max_price is not None:
        query = query.filter(Property.monthly_rent <= filters.max_price)
    if filters.bedrooms is not None:
        query = query.filter(Property.bedrooms >= filters.bedrooms)
    if filters.furnished is not None:
        query = query.filter(Property.furnished == filters.furnished)
    if filters.query:
        search = f"%{filters.query}%"
        query = query.filter(
            or_(
                Property.title.ilike(search),
                Property.description.ilike(search),
                Property.county.ilike(search),
                Property.sub_county.ilike(search),
                Property.ward.ilike(search)
            )
        )

    # Sorting
    if filters.sort_by == "price_asc":
        query = query.order_by(Property.monthly_rent.asc())
    elif filters.sort_by == "price_desc":
        query = query.order_by(Property.monthly_rent.desc())
    elif filters.sort_by == "popular":
        query = query.order_by(Property.view_count.desc())
    else:
        query = query.order_by(Property.created_at.desc())

    total = query.count()
    offset = (filters.page - 1) * filters.per_page
    properties = query.offset(offset).limit(filters.per_page).all()

    return {"properties": properties, "total": total, "page": filters.page, "per_page": filters.per_page}

def update_property(db: Session, property_id: int, property_data: PropertyUpdate, owner_id: int):
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == owner_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found or access denied")

    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prop, field, value)

    db.commit()
    db.refresh(prop)
    return prop

def delete_property(db: Session, property_id: int, owner_id: int):
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == owner_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found or access denied")

    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}

def get_user_properties(db: Session, user_id: int):
    return db.query(Property).filter(Property.owner_id == user_id).order_by(Property.created_at.desc()).all()

def get_featured_properties(db: Session, limit: int = 6):
    return db.query(Property).filter(
        Property.status == PropertyStatus.AVAILABLE,
        Property.is_featured == True
    ).order_by(Property.created_at.desc()).limit(limit).all()

def get_recent_properties(db: Session, limit: int = 12):
    return db.query(Property).filter(
        Property.status == PropertyStatus.AVAILABLE
    ).order_by(Property.created_at.desc()).limit(limit).all()

def get_property_stats(db: Session):
    total = db.query(Property).count()
    available = db.query(Property).filter(Property.status == PropertyStatus.AVAILABLE).count()
    rented = db.query(Property).filter(Property.status == PropertyStatus.RENTED).count()

    # Popular counties
    county_stats = db.query(
        Property.county,
        func.count(Property.id).label("count")
    ).group_by(Property.county).order_by(func.count(Property.id).desc()).limit(10).all()

    return {
        "total": total,
        "available": available,
        "rented": rented,
        "popular_counties": [{"county": c.county, "count": c.count} for c in county_stats]
    }
