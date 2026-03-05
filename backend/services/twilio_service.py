import logging
from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER

twilio_client = None

if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        from twilio.rest import Client
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        logging.info("Twilio client initialized successfully")
    except ImportError:
        logging.warning("Twilio package not installed. WhatsApp notifications disabled.")

def is_configured():
    return twilio_client is not None

def get_whatsapp_number():
    return TWILIO_WHATSAPP_NUMBER

def get_account_sid_prefix():
    return TWILIO_ACCOUNT_SID[:10] + "..." if TWILIO_ACCOUNT_SID else None

async def send_whatsapp_message(to_phone: str, message: str):
    """Send a WhatsApp message"""
    if not twilio_client:
        raise Exception("WhatsApp notifications not configured")
    
    return twilio_client.messages.create(
        from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
        body=message,
        to=f"whatsapp:{to_phone}"
    )
