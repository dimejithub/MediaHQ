import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# CORS
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')

# Auth
AUTH_BACKEND_URL = os.environ.get('AUTH_BACKEND_URL', 'https://demobackend.emergentagent.com')

# Twilio
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER')

# Team constants
TEAMS = ["envoy_nation", "e_nation"]
ROLES = ["member", "team_lead", "admin", "director"]
