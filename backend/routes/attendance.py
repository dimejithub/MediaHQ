from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

# Shared database connection
from database import db

class AttendanceCreate(BaseModel):
    date: str
    attendees: List[str]
    team: str

@router.get("/attendance")
async def get_attendance(team: Optional[str] = None):
    """Get attendance records, optionally filtered by team"""
    query = {}
    if team:
        query["team"] = team
    
    records = await db.attendance.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    return records

@router.post("/attendance")
async def create_attendance(data: AttendanceCreate):
    """Create or update attendance for a date"""
    # Check if record exists for this date and team
    existing = await db.attendance.find_one({
        "date": data.date,
        "team": data.team
    })
    
    if existing:
        # Update existing record
        await db.attendance.update_one(
            {"date": data.date, "team": data.team},
            {"$set": {"attendees": data.attendees}}
        )
        return {"message": "Attendance updated", "date": data.date}
    
    # Create new record
    record = {
        "attendance_id": str(uuid.uuid4()),
        "date": data.date,
        "attendees": data.attendees,
        "team": data.team,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.attendance.insert_one({**record})
    return {"message": "Attendance saved", "date": data.date}

@router.get("/attendance/member/{user_id}")
async def get_member_attendance(user_id: str, team: Optional[str] = None):
    """Get attendance history for a specific member"""
    query = {"attendees": user_id}
    if team:
        query["team"] = team
    
    records = await db.attendance.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    
    # Calculate stats
    all_records = await db.attendance.find({"team": team} if team else {}, {"_id": 0}).to_list(100)
    total_meetings = len(all_records)
    attended = len(records)
    
    return {
        "records": records,
        "stats": {
            "total_meetings": total_meetings,
            "attended": attended,
            "percentage": round((attended / total_meetings) * 100) if total_meetings > 0 else 0
        }
    }

@router.get("/attendance/flagged")
async def get_flagged_members(team: Optional[str] = None, threshold: int = 2):
    """Get members with consecutive absences above threshold"""
    query = {"team": team} if team else {}
    records = await db.attendance.find(query, {"_id": 0}).sort("date", -1).to_list(100)
    
    if not records:
        return []
    
    # Get all team members
    user_query = {"$or": [{"teams": team}, {"primary_team": team}]} if team else {}
    users = await db.users.find(user_query, {"_id": 0, "user_id": 1, "name": 1}).to_list(1000)
    
    flagged = []
    for user in users:
        consecutive = 0
        for record in records:
            if user['user_id'] not in record.get('attendees', []):
                consecutive += 1
            else:
                break
        
        if consecutive >= threshold:
            flagged.append({
                "user_id": user['user_id'],
                "name": user['name'],
                "consecutive_absences": consecutive
            })
    
    return flagged
