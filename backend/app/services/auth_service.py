from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import User, UserRole, VerificationStatus
from app.schemas.schemas import UserCreate, UserLogin, UserUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import get_settings

settings = get_settings()

def register_user(db: Session, user_data: UserCreate):
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if db.query(User).filter(User.phone == user_data.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    db_user = User(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        location=user_data.location,
        bio=user_data.bio
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer", "user": db_user}

def login_user(db: Session, login_data: UserLogin):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    if user.is_banned:
        raise HTTPException(status_code=403, detail=f"Account banned: {user.ban_reason or 'Violation of terms'}")

    if user.role == UserRole.LANDLORD and not user.phone_verified:
        raise HTTPException(status_code=403, detail="Phone not verified. Please verify your phone number first.")
    
    if user.role == UserRole.ADMIN and not user.phone_verified:
        pass  # Admins don't need phone verification

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def update_user(db: Session, user_id: int, user_data: UserUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

def get_current_user(db: Session, token: str):
    from app.core.security import verify_token
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
