from fastapi import APIRouter, HTTPException, Response, Request, Cookie
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import hashlib

router = APIRouter()

# Shared database connection
from database import db

# Simple password hashing
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# Default password for all team members
DEFAULT_PASSWORD = "Envoy@2026"
DEFAULT_PASSWORD_HASH = hash_password(DEFAULT_PASSWORD)

# Predefined team members
TEAM_MEMBERS = [
    {"name": "Adebowale Owoseni", "email": "adebowale@tenmediahq.com", "role": "director"},
    {"name": "Adeola Hilton", "email": "adeola@tenmediahq.com", "role": "team_lead"},
    {"name": "Oladimeji Tiamiyu", "email": "oladimeji@tenmediahq.com", "role": "assistant_lead"},
    {"name": "Michel Adimula", "email": "michel@tenmediahq.com", "role": "unit_head"},
    {"name": "Oluseye Ogunleye", "email": "oluseye@tenmediahq.com", "role": "unit_head"},
    {"name": "Oladipupo Hilton", "email": "oladipupo@tenmediahq.com", "role": "unit_head"},
    {"name": "Jasper Eromon", "email": "jasper@tenmediahq.com", "role": "member"},
    {"name": "Gabriel Oladipo", "email": "gabriel@tenmediahq.com", "role": "member"},
    {"name": "Joshua Awojide", "email": "joshua@tenmediahq.com", "role": "member"},
    {"name": "Boluwatife Akinola", "email": "boluwatife@tenmediahq.com", "role": "member"},
    {"name": "Damilola Oyeleke", "email": "damilola@tenmediahq.com", "role": "member"},
    {"name": "Emmanuel Adeyemi", "email": "emmanuel@tenmediahq.com", "role": "member"},
    {"name": "David Oluwaseun", "email": "david@tenmediahq.com", "role": "member"},
    {"name": "Samuel Okonkwo", "email": "samuel@tenmediahq.com", "role": "member"},
    {"name": "Peter Adeleke", "email": "peter@tenmediahq.com", "role": "member"},
    {"name": "John Okafor", "email": "john@tenmediahq.com", "role": "member"},
    {"name": "Michael Eze", "email": "michael@tenmediahq.com", "role": "member"},
    {"name": "Andrew Nnamdi", "email": "andrew@tenmediahq.com", "role": "member"},
    {"name": "Philip Chukwu", "email": "philip@tenmediahq.com", "role": "member"},
    {"name": "Stephen Obiora", "email": "stephen@tenmediahq.com", "role": "member"},
    {"name": "Daniel Amaechi", "email": "daniel@tenmediahq.com", "role": "member"},
    {"name": "Matthew Ikenna", "email": "matthew@tenmediahq.com", "role": "member"},
    {"name": "Mark Chibueze", "email": "mark@tenmediahq.com", "role": "member"},
]

class LoginRequest(BaseModel):
    email: str
    password: str

class SessionData(BaseModel):
    user_id: str
    email: str
    name: str
    role: str

async def seed_users():
    """Seed predefined users if they don't exist"""
    for member in TEAM_MEMBERS:
        existing = await db.users.find_one({"email": member["email"]})
        if not existing:
            user = {
                "user_id": str(uuid.uuid4()),
                "email": member["email"],
                "name": member["name"],
                "password_hash": DEFAULT_PASSWORD_HASH,
                "role": member["role"],
                "teams": ["envoy_nation"],
                "primary_team": "envoy_nation",
                "skills": [],
                "availability": "available",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user)

@router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    """Login with email and password"""
    # Seed users on first login attempt
    await seed_users()
    
    # Find user by email
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check password
    stored_hash = user.get("password_hash", DEFAULT_PASSWORD_HASH)
    if not verify_password(data.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.sessions.insert_one({
        "session_token": session_token,
        "user_id": user["user_id"],
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60
    )
    
    return {
        "message": "Login successful",
        "session_token": session_token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "member"),
            "teams": user.get("teams", ["envoy_nation"]),
            "primary_team": user.get("primary_team", "envoy_nation")
        }
    }

@router.get("/auth/me")
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current logged in user"""
    # Check header first
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
    
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "member"),
        "teams": user.get("teams", ["envoy_nation"]),
        "primary_team": user.get("primary_team", "envoy_nation"),
        "picture": user.get("picture")
    }

@router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout and clear session"""
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token")
    return {"message": "Logged out successfully"}

@router.get("/auth/users")
async def get_all_users():
    """Get list of all users (for admin)"""
    await seed_users()
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    return users
