from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

from motor.motor_asyncio import AsyncIOMotorClient
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class UserCreate(BaseModel):
    email: str
    name: str
    role: str = "member"
    teams: List[str] = ["envoy_nation"]
    skills: List[str] = []
    unit: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    unit: Optional[str] = None
    phone: Optional[str] = None
    availability: Optional[str] = None

@router.get("/users")
async def get_all_users():
    """Get all users"""
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

@router.get("/users/team/{team_id}")
async def get_team_users(team_id: str):
    """Get users for a specific team"""
    users = await db.users.find(
        {"$or": [{"teams": team_id}, {"primary_team": team_id}]},
        {"_id": 0}
    ).to_list(1000)
    return users

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get a specific user"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/users")
async def create_user(user_data: UserCreate):
    """Create a new user"""
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user = {
        "user_id": str(uuid.uuid4()),
        **user_data.dict(),
        "primary_team": user_data.teams[0] if user_data.teams else "envoy_nation",
        "availability": "available",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one({**user})
    return user

@router.put("/users/{user_id}")
async def update_user(user_id: str, user_update: UserUpdate):
    """Update a user"""
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user"""
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.get("/team/members")
async def get_all_team_members():
    """Get all team members (for handover dropdowns, etc.)"""
    users = await db.users.find({}, {"_id": 0, "user_id": 1, "name": 1, "team": 1, "primary_team": 1}).to_list(1000)
    return users
