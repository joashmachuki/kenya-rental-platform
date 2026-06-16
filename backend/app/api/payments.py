from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.payments import PaymentTransaction, LandlordSubscription, FeaturedListing
from app.models.models import User
from app.core.security import get_current_user_id
from pydantic import BaseModel
from sqlalchemy import func
from datetime import datetime, timedelta
import random

router = APIRouter()

class MockPaymentRequest(BaseModel):
    phone_number: str
    listing_id: int = None
    payment_type: str

class SubscriptionRequest(BaseModel):
    plan_type: str
    phone_number: str

class FeaturedRequest(BaseModel):
    property_id: int
    phone_number: str

@router.post("/mock-stk-push")
def mock_stk_push(request: MockPaymentRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    amounts = {
        "unlock": 50,
        "basic": 500,
        "pro": 1500,
        "featured": 300
    }
    
    amount = amounts.get(request.payment_type, 50)
    receipt = f"MPESA{random.randint(100000, 999999)}"
    
    transaction = PaymentTransaction(
        user_id=user.id,
        listing_id=request.listing_id,
        amount=amount,
        payment_type=request.payment_type,
        status="completed",
        mpesa_receipt=receipt,
        phone_number=request.phone_number,
        expires_at=datetime.utcnow() + timedelta(days=1) if request.payment_type == "unlock" else None
    )
    
    db.add(transaction)
    db.commit()
    
    return {
        "success": True,
        "receipt": receipt,
        "amount": amount,
        "message": f"KSh {amount} paid successfully. Receipt: {receipt}"
    }

@router.post("/subscribe")
def subscribe(request: SubscriptionRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    plans = {
        "basic": {"listings": 5, "featured": 0, "amount": 500},
        "pro": {"listings": 999, "featured": 1, "amount": 1500}
    }
    
    if request.plan_type not in plans:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan = plans[request.plan_type]
    
    existing = db.query(LandlordSubscription).filter(LandlordSubscription.user_id == user.id).first()
    if existing:
        db.delete(existing)
    
    subscription = LandlordSubscription(
        user_id=user.id,
        plan_type=request.plan_type,
        listings_allowed=plan["listings"],
        listings_used=0,
        featured_credits=plan["featured"],
        amount_paid=plan["amount"],
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    
    db.add(subscription)
    db.commit()
    
    return {"success": True, "plan": request.plan_type, "expires": subscription.expires_at}

@router.post("/feature-listing")
def feature_listing(request: FeaturedRequest, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subscription = db.query(LandlordSubscription).filter(LandlordSubscription.user_id == user.id).first()
    
    if not subscription or subscription.featured_credits < 1:
        raise HTTPException(status_code=400, detail="No featured credits. Pay KSh 300 or upgrade to Pro.")
    
    featured = FeaturedListing(
        property_id=request.property_id,
        landlord_id=user.id,
        amount_paid=300,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    subscription.featured_credits -= 1
    db.add(featured)
    db.commit()
    
    return {"success": True, "featured_until": featured.expires_at}

@router.get("/check-unlock/{listing_id}")
def check_unlock(listing_id: int, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    transaction = db.query(PaymentTransaction).filter(
        PaymentTransaction.user_id == user.id,
        PaymentTransaction.listing_id == listing_id,
        PaymentTransaction.payment_type == "unlock",
        PaymentTransaction.expires_at > datetime.utcnow()
    ).first()
    
    return {"unlocked": transaction is not None, "expires": transaction.expires_at if transaction else None}

@router.get("/my-subscription")
def my_subscription(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    sub = db.query(LandlordSubscription).filter(LandlordSubscription.user_id == user.id).first()
    if not sub:
        return {"plan": "free", "listings_allowed": 1, "listings_used": 0, "featured_credits": 0}
    return {
        "plan": sub.plan_type,
        "listings_allowed": sub.listings_allowed,
        "listings_used": sub.listings_used,
        "featured_credits": sub.featured_credits,
        "expires_at": sub.expires_at,
        "status": sub.status
    }

@router.get("/admin/revenue")
def admin_revenue(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not getattr(user, 'is_admin', False):
        raise HTTPException(status_code=403, detail="Admin only")
    
    total_unlocks = db.query(PaymentTransaction).filter(PaymentTransaction.payment_type == "unlock").count()
    total_subs = db.query(LandlordSubscription).count()
    total_featured = db.query(FeaturedListing).count()
    
    unlock_revenue = db.query(PaymentTransaction).filter(PaymentTransaction.payment_type == "unlock").count() * 50
    sub_revenue = db.query(LandlordSubscription).with_entities(func.sum(LandlordSubscription.amount_paid)).scalar() or 0
    featured_revenue = db.query(FeaturedListing).count() * 300
    
    return {
        "total_unlocks": total_unlocks,
        "total_subscriptions": total_subs,
        "total_featured": total_featured,
        "unlock_revenue": unlock_revenue,
        "subscription_revenue": sub_revenue,
        "featured_revenue": featured_revenue,
        "total_revenue": unlock_revenue + sub_revenue + featured_revenue
    }
