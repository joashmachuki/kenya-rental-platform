from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    RENTER = "renter"
    LANDLORD = "landlord"
    ADMIN = "admin"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"
    BEDSITTER = "bedsitter"
    STUDIO = "studio"
    ONE_BEDROOM = "1_bedroom"
    TWO_BEDROOM = "2_bedroom"
    THREE_BEDROOM = "3_bedroom"
    FOUR_PLUS_BEDROOM = "4_plus_bedroom"
    TOWNHOUSE = "townhouse"
    VILLA = "villa"
    COMMERCIAL = "commercial"
    OFFICE = "office"
    WAREHOUSE = "warehouse"

class PropertyStatus(str, enum.Enum):
    AVAILABLE = "available"
    RENTED = "rented"
    PENDING = "pending"
    SUSPENDED = "suspended"
    FLAGGED = "flagged"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.RENTER)
    avatar_url = Column(String(500))
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    bio = Column(Text)
    location = Column(String(255))
    id_number = Column(String(50))

    id_document_url = Column(String(500))
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    verification_submitted_at = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    phone_verified = Column(Boolean, default=False)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

    trust_score = Column(Integer, default=0)
    report_count = Column(Integer, default=0)
    is_banned = Column(Boolean, default=False)
    ban_reason = Column(Text, nullable=True)

    properties = relationship("Property", back_populates="owner", foreign_keys="Property.owner_id", cascade="all, delete-orphan")
    transactions = relationship("PaymentTransaction", back_populates="user")
    subscription = relationship("LandlordSubscription", back_populates="user", uselist=False)
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    reports_made = relationship("PropertyReport", back_populates="reporter")

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(Enum(PropertyType), nullable=False)
    status = Column(Enum(PropertyStatus), default=PropertyStatus.AVAILABLE)
    reports_count = Column(Integer, default=0)
    is_hidden = Column(Boolean, default=False)

    county = Column(String(100), nullable=False, index=True)
    sub_county = Column(String(100), nullable=False, index=True)
    ward = Column(String(100), nullable=False)
    town = Column(String(100))
    street_address = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)

    monthly_rent = Column(Float, nullable=False)
    deposit_amount = Column(Float, default=0)
    negotiable = Column(Boolean, default=False)

    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Integer, default=0)
    furnished = Column(Boolean, default=False)
    square_footage = Column(Float)
    floor_number = Column(Integer)
    total_floors = Column(Integer)
    year_built = Column(Integer)
    
    distance_from_road = Column(String(50))
    elevator = Column(Boolean, default=False)
    electricity_reliability = Column(String(50), default="consistent")
    electricity_token = Column(String(100), nullable=True)
    security = Column(Boolean, default=False)
    balcony = Column(Boolean, default=False)
    kitchen_type = Column(String(50), default="closed")
    garbage_collection = Column(Boolean, default=False)
    nearby_amenities = Column(JSON, default=list)
    bathroom_type = Column(String(50), default="shared")
    pet_policy = Column(String(50), default="not_allowed")

    amenities = Column(JSON, default=list)
    images = Column(JSON, default=list)
    videos = Column(JSON, default=list)

    contact_phone = Column(String(20))
    contact_email = Column(String(255))
    preferred_contact = Column(String(50), default="phone")

    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    inquiry_count = Column(Integer, default=0)
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(String(255))

    approval_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="properties", foreign_keys=[owner_id])
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="property")
    property_reports = relationship("PropertyReport", back_populates="property")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    property = relationship("Property", back_populates="messages")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorites")

