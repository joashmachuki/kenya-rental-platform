from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="KES")
    payment_type = Column(String, nullable=False)
    status = Column(String, default="pending")
    mpesa_receipt = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="transactions")

class LandlordSubscription(Base):
    __tablename__ = "landlord_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_type = Column(String, nullable=False)
    listings_allowed = Column(Integer, default=1)
    listings_used = Column(Integer, default=0)
    featured_credits = Column(Integer, default=0)
    amount_paid = Column(Float, default=0)
    status = Column(String, default="active")
    starts_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="subscription")

class FeaturedListing(Base):
    __tablename__ = "featured_listings"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_paid = Column(Float, nullable=False)
    starts_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String, default="active")
