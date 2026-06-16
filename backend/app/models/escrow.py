from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class EscrowPayment(Base):
    __tablename__ = "escrow_payments"

    id = Column(Integer, primary_key=True, index=True)
    renter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount = Column(Float, nullable=False)
    mpesa_receipt = Column(String(100), nullable=True)

    status = Column(String(20), default="held")

    renter_confirmed_viewing = Column(Boolean, default=False)
    landlord_confirmed = Column(Boolean, default=False)

    held_at = Column(DateTime(timezone=True), server_default=func.now())
    released_at = Column(DateTime(timezone=True), nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)

    dispute_reason = Column(Text, nullable=True)
    dispute_resolved_at = Column(DateTime(timezone=True), nullable=True)

    renter = relationship("User", foreign_keys=[renter_id])
    property = relationship("Property")
    landlord = relationship("User", foreign_keys=[landlord_id])
