from fastapi import APIRouter, HTTPException, Response, Request, Cookie
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import asyncio
import uuid
import hashlib

router = APIRouter()

from database import db
from fallback_data import TEAM_MEMBERS, get_user_by_email, get_user_by_id

# Simple password hashing
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# Default password for all team members
DEFAULT_PASSWORD = "Envoy@2026"
DEFAULT_PASSWORD_HASH = hash_password(DEFAULT_PASSWORD)

# In-memory session store for fast lookups (backup for DB sessions)
_sessions = {}

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    """Login with email and password"""
    
    # Try database first with timeout, fallback to hardcoded if DB fails
    user = None
    
    try:
        user = await asyncio.wait_for(
            db.users.find_one({"email": data.email.lower()}, {"_id": 0}),
            timeout=2.0
        )
    except Exception as e:
        print(f"Database error during login, using fallback: {e}")
    
    # Fallback: check hardcoded members
    if not user:
        fallback_user = get_user_by_email(data.email)
        if fallback_user:
            user = {**fallback_user, "password_hash": DEFAULT_PASSWORD_HASH}
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check password
    stored_hash = user.get("password_hash", DEFAULT_PASSWORD_HASH)
    if not verify_password(data.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session token
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    # Store session in memory for fast access
    _sessions[session_token] = {
        "user_id": user["user_id"],
        "expires_at": expires_at
    }
    
    # Try to store session in DB (non-blocking)
    try:
        asyncio.create_task(
            db.sessions.insert_one({
                "session_token": session_token,
                "user_id": user["user_id"],
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        )
    except:
        pass
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60
    )
    
    # Build user response data
    user_data = {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "member"),
        "teams": user.get("teams", ["envoy_nation"]),
        "primary_team": user.get("primary_team", "envoy_nation"),
        "picture": user.get("picture")
    }
    
    return {
        "message": "Login successful",
        "session_token": session_token,
        "user": user_data
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
    
    user = None
    user_id = None
    
    # Check in-memory session first (fast path)
    if session_token in _sessions:
        session = _sessions[session_token]
        if session["expires_at"] > datetime.now(timezone.utc):
            user_id = session["user_id"]
        else:
            # Expired, remove it
            del _sessions[session_token]
    
    # If not in memory, try database
    if not user_id:
        try:
            session = await asyncio.wait_for(
                db.sessions.find_one({"session_token": session_token}, {"_id": 0}),
                timeout=2.0
            )
            if session:
                expires_at = session.get("expires_at")
                if isinstance(expires_at, str):
                    expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                
                if expires_at and expires_at < datetime.now(timezone.utc):
                    raise HTTPException(status_code=401, detail="Session expired")
                
                user_id = session["user_id"]
                
                # Cache in memory
                _sessions[session_token] = {
                    "user_id": user_id,
                    "expires_at": expires_at
                }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Database error in /auth/me: {e}")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Session not found")
    
    # Get user data
    try:
        user = await asyncio.wait_for(
            db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0}),
            timeout=2.0
        )
    except Exception as e:
        print(f"User lookup failed: {e}")
    
    # Fallback to hardcoded data
    if not user:
        user = get_user_by_id(user_id)
    
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
        # Remove from memory
        if session_token in _sessions:
            del _sessions[session_token]
        
        # Try to remove from DB
        try:
            await db.sessions.delete_one({"session_token": session_token})
        except:
            pass
    
    response.delete_cookie(key="session_token")
    return {"message": "Logged out successfully"}

@router.get("/auth/users")
async def get_all_users():
    """Get list of all users"""
    try:
        users = await asyncio.wait_for(
            db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100),
            timeout=2.0
        )
        if users:
            return users
    except Exception as e:
        print(f"Database error, using fallback: {e}")
    
    # Fallback to hardcoded data
    return [{k: v for k, v in m.items() if k != "password_hash"} for m in TEAM_MEMBERS]
