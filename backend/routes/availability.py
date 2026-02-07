from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

from motor.motor_asyncio import AsyncIOMotorClient
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class AvailabilityCreate(BaseModel):
    date: str
    status: str  # available, unavailable, tentative
    notes: Optional[str] = None

@router.post("/availability/{user_id}")
async def set_availability(user_id: str, availability: AvailabilityCreate):
    """Set or update availability for a user on a specific date"""
    existing = await db.member_availability.find_one(
        {"user_id": user_id, "date": availability.date}
    )
    
    if existing:
        await db.member_availability.update_one(
            {"user_id": user_id, "date": availability.date},
            {"$set": {"status": availability.status, "notes": availability.notes}}
        )
        doc = await db.member_availability.find_one(
            {"user_id": user_id, "date": availability.date},
            {"_id": 0}
        )
    else:
        availability_id = f"avail_{uuid.uuid4().hex[:12]}"
        new_availability = {
            "availability_id": availability_id,
            "user_id": user_id,
            **availability.dict()
        }
        await db.member_availability.insert_one(new_availability)
        doc = await db.member_availability.find_one({"availability_id": availability_id}, {"_id": 0})
    
    return doc

@router.get("/availability")
async def get_all_availability(user_id: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Get availability records"""
    query = {}
    if user_id:
        query["user_id"] = user_id
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    
    availability = await db.member_availability.find(query, {"_id": 0}).to_list(10000)
    return availability

@router.get("/availability/{user_id}")
async def get_user_availability(user_id: str):
    """Get all availability for a specific user"""
    availability = await db.member_availability.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(1000)
    return availability
