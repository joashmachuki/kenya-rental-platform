from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from app.services.auth_service import register_user, login_user, get_user_by_id, update_user, get_current_user
from app.core.security import get_current_user_id

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user_data)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, login_data)

@router.get("/me", response_model=UserResponse)
def get_me(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserResponse)
def update_me(user_data: UserUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return update_user(db, int(user_id), user_data)
