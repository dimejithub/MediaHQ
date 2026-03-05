from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import os
import logging

router = APIRouter()

logger = logging.getLogger(__name__)

# Shared database connection
from database import db

# Twilio settings (optional)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER')

twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        from twilio.rest import Client
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        logger.info(f"Twilio client initialized with number: {TWILIO_WHATSAPP_NUMBER}")
    except ImportError:
        logger.warning("Twilio package not installed. WhatsApp disabled.")
else:
    logger.info("Twilio credentials not configured.")

class WhatsAppMessage(BaseModel):
    phone: str
    message: str

class RotaNotification(BaseModel):
    user_ids: List[str]
    service_title: str
    service_date: str
    service_time: str

@router.get("/whatsapp/status")
async def get_whatsapp_status():
    """Check if WhatsApp notifications are configured"""
    return {
        "configured": twilio_client is not None,
        "whatsapp_number": TWILIO_WHATSAPP_NUMBER if twilio_client else None,
        "account_sid_prefix": TWILIO_ACCOUNT_SID[:10] + "..." if TWILIO_ACCOUNT_SID else None
    }

@router.get("/whatsapp/test-connection")
async def test_whatsapp_connection():
    """Test Twilio connection"""
    if not twilio_client:
        return {"success": False, "error": "Twilio not configured"}
    
    try:
        account = twilio_client.api.accounts(TWILIO_ACCOUNT_SID).fetch()
        return {
            "success": True,
            "account_name": account.friendly_name,
            "account_status": account.status,
            "whatsapp_number": TWILIO_WHATSAPP_NUMBER
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/whatsapp/send")
async def send_whatsapp_notification(data: WhatsAppMessage, user_id: str):
    """Send WhatsApp notification"""
    if not twilio_client:
        raise HTTPException(status_code=503, detail="WhatsApp not configured. Add Twilio credentials.")
    
    try:
        message = twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
            body=data.message,
            to=f"whatsapp:{data.phone}"
        )
        
        # Log the message
        await db.whatsapp_messages.insert_one({
            "message_sid": message.sid,
            "to_phone": data.phone,
            "message": data.message,
            "sent_by": user_id,
            "status": "sent",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"status": "sent", "message_sid": message.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send: {str(e)}")

@router.post("/whatsapp/notify-rota")
async def notify_rota_assignment(data: RotaNotification, sender_id: str):
    """Send WhatsApp notifications for rota assignments"""
    results = {"sent": 0, "failed": 0, "no_phone": 0, "in_app_only": 0, "errors": []}
    
    for user_id in data.user_ids:
        member = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not member:
            results["errors"].append(f"User {user_id} not found")
            results["failed"] += 1
            continue
        
        phone = member.get("phone")
        
        # Create in-app notification
        from .notifications import create_notification
        await create_notification(
            user_id=user_id,
            title="New Rota Assignment",
            message=f"You've been assigned to {data.service_title} on {data.service_date} at {data.service_time}. Please confirm your availability.",
            notification_type="rota_assignment"
        )
        
        if not phone:
            results["no_phone"] += 1
            results["in_app_only"] += 1
            continue
        
        # Send WhatsApp if configured
        if twilio_client and TWILIO_WHATSAPP_NUMBER:
            try:
                message_text = f"📋 *TEN MediaHQ Rota Assignment*\n\nHi {member.get('name', 'Team Member')}!\n\nYou've been assigned to:\n📌 {data.service_title}\n📅 {data.service_date}\n🕐 {data.service_time}\n\nPlease log in to confirm your availability."
                
                message = twilio_client.messages.create(
                    from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
                    body=message_text,
                    to=f"whatsapp:{phone}"
                )
                
                await db.whatsapp_messages.insert_one({
                    "message_sid": message.sid,
                    "to_phone": phone,
                    "message": message_text,
                    "sent_by": sender_id,
                    "type": "rota_assignment",
                    "status": "sent",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
                
                results["sent"] += 1
            except Exception as e:
                results["errors"].append(f"WhatsApp to {phone}: {str(e)}")
                results["failed"] += 1
                results["in_app_only"] += 1
        else:
            results["in_app_only"] += 1
    
    return results
