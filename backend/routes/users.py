from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import asyncio
import uuid

router = APIRouter()

from database import db
from fallback_data import TEAM_MEMBERS
from cache import cache, users_cache_key

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    availability: Optional[str] = None
    phone: Optional[str] = None

@router.get("/users")
async def get_users(team: Optional[str] = None):
    """Get all users, optionally filtered by team - optimized with caching"""
    
    # Check cache first
    cache_key = users_cache_key(team)
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    # Prepare fallback
    if team:
        fallback = [m for m in TEAM_MEMBERS if team in m.get("teams", []) or m.get("primary_team") == team]
    else:
        fallback = TEAM_MEMBERS
    
    try:
        query = {}
        if team:
            query = {"$or": [{"teams": team}, {"primary_team": team}]}
        
        users = await asyncio.wait_for(
            db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(100),
            timeout=2.0
        )
        
        if users:
            cache.set(cache_key, users, ttl=60)
            return users
    except Exception as e:
        print(f"Users query failed, using fallback: {e}")
    
    cache.set(cache_key, fallback, ttl=30)
    return fallback

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get a specific user"""
    try:
        user = await asyncio.wait_for(
            db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0}),
            timeout=2.0
        )
        if user:
            return user
    except Exception as e:
        print(f"User query failed, using fallback: {e}")
    
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
            # Invalidate cache
            cache.invalidate_pattern("users:")
            return user
    except Exception as e:
        print(f"User update failed: {e}")
    
    # Fallback - return the user with updates applied locally
    for m in TEAM_MEMBERS:
        if m["user_id"] == user_id:
            return {**m, **update_data}
    
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/members")
async def get_members(team: Optional[str] = None):
    """Get all team members (alias for /users)"""
    return await get_users(team)

@router.get("/users/team/{team_id}")
async def get_users_by_team(team_id: str):
    """Get users by team ID"""
    return await get_users(team_id)
