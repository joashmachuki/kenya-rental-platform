from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from fastapi import HTTPException
from app.models.models import Message, Property, User
from app.schemas.schemas import MessageCreate

def send_message(db: Session, message_data: MessageCreate, sender_id: int):
    property_obj = db.query(Property).filter(Property.id == message_data.property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    if property_obj.owner_id == sender_id:
        raise HTTPException(status_code=400, detail="Cannot message your own property")

    message = Message(
        property_id=message_data.property_id,
        sender_id=sender_id,
        receiver_id=property_obj.owner_id,
        content=message_data.content
    )

    property_obj.inquiry_count += 1
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_conversations(db: Session, user_id: int):
    # Get all unique conversations for a user
    sent = db.query(Message).filter(Message.sender_id == user_id).all()
    received = db.query(Message).filter(Message.receiver_id == user_id).all()

    conversations = {}

    for msg in sent + received:
        key = (msg.property_id, msg.receiver_id if msg.sender_id == user_id else msg.sender_id)
        if key not in conversations or conversations[key]["last_time"] < msg.created_at:
            other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
            other_user = db.query(User).filter(User.id == other_user_id).first()
            property_obj = db.query(Property).filter(Property.id == msg.property_id).first()

            conversations[key] = {
                "property_id": msg.property_id,
                "property_title": property_obj.title if property_obj else "Unknown",
                "property_image": property_obj.images[0] if property_obj and property_obj.images else None,
                "other_user_id": other_user_id,
                "other_user_name": other_user.full_name if other_user else "Unknown",
                "other_user_avatar": other_user.avatar_url if other_user else None,
                "last_message": msg.content,
                "last_message_time": msg.created_at,
            }

    result = []
    for key, conv in conversations.items():
        unread = db.query(Message).filter(
            Message.property_id == conv["property_id"],
            Message.receiver_id == user_id,
            Message.is_read == False
        ).count()
        conv["unread_count"] = unread
        result.append(conv)

    result.sort(key=lambda x: x["last_message_time"], reverse=True)
    return result

def get_messages(db: Session, property_id: int, user_id: int, other_user_id: int):
    messages = db.query(Message).filter(
        Message.property_id == property_id,
        or_(
            and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == user_id)
        )
    ).order_by(Message.created_at.asc()).all()

    # Mark as read
    for msg in messages:
        if msg.receiver_id == user_id and not msg.is_read:
            msg.is_read = True
    db.commit()

    return messages
