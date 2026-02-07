from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

# Shared database connection
from database import db

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str

# Helper function to create notifications
async def create_notification(user_id: str, title: str, message: str, notification_type: str):
    """Helper function to create notifications"""
    notification_id = f"notif_{uuid.uuid4().hex[:12]}"
    notification = {
        "notification_id": notification_id,
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    return notification

@router.get("/notifications/{user_id}")
async def get_notifications(user_id: str):
    """Get notifications for a user"""
    notifications = await db.notifications.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return notifications

@router.get("/notifications/{user_id}/unread-count")
async def get_unread_count(user_id: str):
    """Get unread notification count for a user"""
    count = await db.notifications.count_documents({"user_id": user_id, "read": False})
    return {"unread_count": count}

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user_id: str):
    """Mark a notification as read"""
    await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": user_id},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}

@router.put("/notifications/{user_id}/read-all")
async def mark_all_read(user_id: str):
    """Mark all notifications as read for a user"""
    await db.notifications.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

@router.post("/notifications")
async def create_notification_endpoint(data: NotificationCreate):
    """Create a new notification"""
    notification = await create_notification(
        user_id=data.user_id,
        title=data.title,
        message=data.message,
        notification_type=data.type
    )
    return notification
