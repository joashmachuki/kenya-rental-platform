from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, PropertyType, PropertyStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    role: UserRole = UserRole.RENTER
    location: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_verified: bool
    is_active: bool
    phone_verified: Optional[bool] = None
    verification_status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Property Schemas
class PropertyBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=20)
    property_type: PropertyType
    county: str
    sub_county: str
    ward: str
    town: Optional[str] = None
    street_address: Optional[str] = None
    monthly_rent: float = Field(..., gt=0)
    deposit_amount: Optional[float] = 0
    negotiable: bool = False
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    furnished: bool = False
    square_footage: Optional[float] = None
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    year_built: Optional[int] = None
    distance_from_road: Optional[str] = None
    elevator: Optional[bool] = False
    electricity_reliability: Optional[str] = "consistent"
    security: Optional[bool] = False
    balcony: Optional[bool] = False
    kitchen_type: Optional[str] = "closed"
    garbage_collection: Optional[bool] = False
    nearby_amenities: Optional[List[str]] = []
    bathroom_type: Optional[str] = "shared"
    pet_policy: Optional[str] = "not_allowed"
    amenities: Optional[List[str]] = []
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    preferred_contact: Optional[str] = "phone"

class PropertyCreate(PropertyBase):
    images: Optional[List[str]] = []
    videos: Optional[List[str]] = []

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: Optional[PropertyStatus] = None
    monthly_rent: Optional[float] = None
    deposit_amount: Optional[float] = None
    negotiable: Optional[bool] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    furnished: Optional[bool] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    preferred_contact: Optional[str] = None
    distance_from_road: Optional[str] = None
    elevator: Optional[bool] = None
    electricity_reliability: Optional[str] = None
    electricity_token: Optional[str] = None
    security: Optional[bool] = None
    balcony: Optional[bool] = None
    kitchen_type: Optional[str] = None
    garbage_collection: Optional[bool] = None
    nearby_amenities: Optional[List[str]] = None
    bathroom_type: Optional[str] = None
    pet_policy: Optional[str] = None
    distance_from_road: Optional[str] = None
    elevator: Optional[bool] = None
    electricity_reliability: Optional[str] = None
    electricity_token: Optional[str] = None
    security: Optional[bool] = None
    balcony: Optional[bool] = None
    kitchen_type: Optional[str] = None
    garbage_collection: Optional[bool] = None
    nearby_amenities: Optional[List[str]] = None
    bathroom_type: Optional[str] = None
    pet_policy: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    status: PropertyStatus
    images: List[str]
    videos: List[str]
    is_featured: bool
    view_count: int
    inquiry_count: int
    is_flagged: bool
    distance_from_road: Optional[str] = None
    elevator: Optional[bool] = False
    electricity_reliability: Optional[str] = "consistent"
    security: Optional[bool] = False
    balcony: Optional[bool] = False
    kitchen_type: Optional[str] = "closed"
    garbage_collection: Optional[bool] = False
    nearby_amenities: Optional[List[str]] = []
    bathroom_type: Optional[str] = "shared"
    pet_policy: Optional[str] = "not_allowed"
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class PropertyListResponse(BaseModel):
    id: int
    title: str
    property_type: PropertyType
    county: str
    sub_county: str
    ward: str
    town: Optional[str] = None
    monthly_rent: float
    bedrooms: int
    bathrooms: int
    furnished: bool
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    distance_from_road: Optional[str] = None
    elevator: Optional[bool] = False
    security: Optional[bool] = False
    balcony: Optional[bool] = False
    bathroom_type: Optional[str] = "shared"
    images: List[str]
    videos: List[str]
    status: PropertyStatus
    is_featured: bool
    created_at: datetime
    owner_name: Optional[str] = None
    owner_avatar: Optional[str] = None

    class Config:
        from_attributes = True

# Search & Filter
class PropertySearch(BaseModel):
    county: Optional[str] = None
    sub_county: Optional[str] = None
    ward: Optional[str] = None
    property_type: Optional[PropertyType] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bedrooms: Optional[int] = None
    furnished: Optional[bool] = None
    query: Optional[str] = None
    sort_by: Optional[str] = "newest"  # newest, price_asc, price_desc, popular
    page: int = 1
    per_page: int = 12

# Message Schemas
class MessageCreate(BaseModel):
    property_id: int
    content: str = Field(..., min_length=1, max_length=2000)

class MessageResponse(BaseModel):
    id: int
    property_id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender_name: Optional[str] = None
    sender_avatar: Optional[str] = None
    property_title: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    property_id: int
    property_title: str
    property_image: Optional[str] = None
    other_user_id: int
    other_user_name: str
    other_user_avatar: Optional[str] = None
    last_message: str
    last_message_time: datetime
    unread_count: int

# Favorite Schemas
class FavoriteResponse(BaseModel):
    id: int
    property_id: int
    created_at: datetime
    property: PropertyListResponse

    class Config:
        from_attributes = True

# Report Schemas
class ReportCreate(BaseModel):
    property_id: int
    reason: str = Field(..., min_length=5)
    details: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    property_id: int
    reporter_id: int
    reason: str
    details: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStats(BaseModel):
    total_properties: int
    total_users: int
    total_landlords: int
    total_renters: int
    total_messages: int
    pending_reports: int
    recent_properties: List[PropertyListResponse]
    popular_locations: List[dict]

# Kenya Locations
class LocationData(BaseModel):
    county: str
    sub_counties: List[dict]
