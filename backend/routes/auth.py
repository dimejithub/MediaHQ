from fastapi import APIRouter, HTTPException, Cookie, Response, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
import httpx

router = APIRouter()

# Shared database connection
from database import db

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'https://mediahq-production.up.railway.app/api/auth/google/callback')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://3e3e7d9a.mediahq.pages.dev')

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

@router.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
        "&access_type=offline"
        "&prompt=consent"
    )
    return RedirectResponse(url=google_auth_url)

@router.get("/auth/google/callback")
async def google_callback(code: str, response: Response):
    """Handle Google OAuth callback"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )
            
            if token_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to exchange code for token")
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            # Get user info from Google
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get user info")
            
            google_user = user_response.json()
        
        # Find or create user in database
        user = await db.users.find_one({"email": google_user['email']}, {"_id": 0})
        
        if not user:
            # Create new user
            user = {
                "user_id": str(uuid.uuid4()),
                "email": google_user['email'],
                "name": google_user.get('name', google_user['email'].split('@')[0]),
                "picture": google_user.get('picture'),
                "role": "member",
                "teams": ["envoy_nation"],
                "primary_team": "envoy_nation",
                "skills": [],
                "availability": "available",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one({**user})
        else:
            # Update picture if changed
            if google_user.get('picture') and user.get('picture') != google_user.get('picture'):
                await db.users.update_one(
                    {"email": google_user['email']},
                    {"$set": {"picture": google_user.get('picture')}}
                )
                user['picture'] = google_user.get('picture')
        
        # Create session
        session_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.sessions.insert_one({
            "session_token": session_token,
            "user_id": user['user_id'],
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Redirect to frontend with session token
        redirect_url = f"{FRONTEND_URL}/login?session_token={session_token}"
        redirect_response = RedirectResponse(url=redirect_url, status_code=302)
        
        # Also set cookie
        redirect_response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7*24*60*60
        )
        
        return redirect_response
        
    except Exception as e:
        # Redirect to frontend with error
        error_url = f"{FRONTEND_URL}/login?error={str(e)}"
        return RedirectResponse(url=error_url, status_code=302)

@router.get("/auth/me")
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current logged in user"""
    # Also check for session token in header (for API calls)
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
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

@router.post("/auth/session")
async def create_session_from_token(session_token: str, response: Response):
    """Validate session token and set cookie"""
    session = await db.sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60
    )
    
    return {"message": "Session created"}
