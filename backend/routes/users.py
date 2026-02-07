from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter()

from database import db
from fallback_data import TEAM_MEMBERS

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    availability: Optional[str] = None
    phone: Optional[str] = None

@router.get("/users")
async def get_users(team: Optional[str] = None):
    """Get all users, optionally filtered by team"""
    try:
        query = {}
        if team:
            query = {"$or": [{"teams": team}, {"primary_team": team}]}
        
        users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(100)
        if users:
            return users
    except Exception as e:
        print(f"Database error, using fallback: {e}")
    
    # Fallback
    if team:
        return [m for m in TEAM_MEMBERS if team in m.get("teams", []) or m.get("primary_team") == team]
    return TEAM_MEMBERS

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get a specific user"""
    try:
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        if user:
            return user
    except Exception as e:
        print(f"Database error, using fallback: {e}")
    
    # Fallback
    for m in TEAM_MEMBERS:
        if m["user_id"] == user_id:
            return m
    
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/users/{user_id}")
async def update_user(user_id: str, data: UserUpdate):
    """Update a user"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    try:
        result = await db.users.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        if user:
            return user
    except Exception as e:
        print(f"Database error: {e}")
    
    # Fallback - return the user with updates applied locally
    for m in TEAM_MEMBERS:
        if m["user_id"] == user_id:
            return {**m, **update_data}
    
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/members")
async def get_members(team: Optional[str] = None):
    """Get all team members (alias for /users)"""
    return await get_users(team)
