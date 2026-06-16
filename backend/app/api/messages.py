from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import verify_token
from app.schemas.schemas import MessageCreate, MessageResponse, ConversationResponse
from app.services.message_service import send_message, get_conversations, get_messages
from app.services.auth_service import get_user_by_id

router = APIRouter(prefix="/messages", tags=["Messages"])

def get_current_user_id(token: str = Depends(verify_token)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return int(token)

@router.post("", response_model=MessageResponse)
def create_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    msg = send_message(db, message_data, current_user_id)
    return {
        "id": msg.id,
        "property_id": msg.property_id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "is_read": msg.is_read,
        "created_at": msg.created_at,
        "sender_name": msg.sender.full_name if msg.sender else None,
        "sender_avatar": msg.sender.avatar_url if msg.sender else None,
        "property_title": msg.property.title if msg.property else None
    }

@router.get("/conversations")
def conversations(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    return get_conversations(db, current_user_id)

@router.get("/{property_id}/{other_user_id}")
def get_chat_messages(
    property_id: int,
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    messages = get_messages(db, property_id, current_user_id, other_user_id)
    result = []
    for msg in messages:
        sender = get_user_by_id(db, msg.sender_id)
        result.append({
            "id": msg.id,
            "property_id": msg.property_id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "content": msg.content,
            "is_read": msg.is_read,
            "created_at": msg.created_at,
            "sender_name": sender.full_name if sender else "Unknown",
            "sender_avatar": sender.avatar_url if sender else None,
            "property_title": msg.property.title if msg.property else None
        })
    return result
