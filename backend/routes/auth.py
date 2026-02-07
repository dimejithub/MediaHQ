from fastapi import APIRouter, HTTPException, Cookie, Response, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
import requests

router = APIRouter()

# Get database from parent
from motor.motor_asyncio import AsyncIOMotorClient
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

AUTH_BACKEND_URL = os.environ.get('AUTH_BACKEND_URL', 'https://demobackend.emergentagent.com')

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

@router.get("/auth/session")
async def exchange_session(session_id: str, response: Response):
    """Exchange session ID for user data and set cookie"""
    try:
        backend_response = requests.get(
            f"{AUTH_BACKEND_URL}/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if backend_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        session_data = backend_response.json()
        
        # Find or create user
        user = await db.users.find_one({"email": session_data['email']}, {"_id": 0})
        
        if not user:
            user = {
                "user_id": str(uuid.uuid4()),
                "email": session_data['email'],
                "name": session_data['name'],
                "picture": session_data.get('picture'),
                "role": "member",
                "teams": ["envoy_nation"],
                "primary_team": "envoy_nation",
                "skills": [],
                "availability": "available",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one({**user})
        else:
            if 'created_at' in user and isinstance(user['created_at'], str):
                user['created_at'] = datetime.fromisoformat(user['created_at'])
        
        # Create session
        session_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.sessions.insert_one({
            "session_token": session_token,
            "user_id": user['user_id'],
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7*24*60*60
        )
        
        return {
            "user_id": user['user_id'],
            "email": user['email'],
            "name": user['name'],
            "picture": user.get('picture'),
            "role": user.get('role', 'member'),
            "teams": user.get('teams', ['envoy_nation']),
            "primary_team": user.get('primary_team', 'envoy_nation')
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/me")
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current logged in user"""
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session.get('expires_at')
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"user_id": session['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if 'created_at' in user and isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return {
        "user_id": user['user_id'],
        "email": user['email'],
        "name": user['name'],
        "picture": user.get('picture'),
        "role": user.get('role', 'member'),
        "teams": user.get('teams', ['envoy_nation']),
        "primary_team": user.get('primary_team', 'envoy_nation')
    }

@router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user and clear session"""
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token")
    return {"message": "Logged out successfully"}
