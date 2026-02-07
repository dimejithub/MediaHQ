from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

# Shared database connection
from database import db

class LeadRotationCreate(BaseModel):
    week_number: int
    year: int
    lead_user_id: str
    backup_user_id: Optional[str] = None
    notes: Optional[str] = None

class BulkRotationCreate(BaseModel):
    year: int
    rotations: List[dict]

@router.post("/lead-rotation")
async def create_lead_rotation(rotation: LeadRotationCreate):
    """Create a new lead rotation"""
    rotation_id = f"rotation_{uuid.uuid4().hex[:12]}"
    new_rotation = {
        "rotation_id": rotation_id,
        **rotation.dict()
    }
    await db.lead_rotation.insert_one(new_rotation)
    
    doc = await db.lead_rotation.find_one({"rotation_id": rotation_id}, {"_id": 0})
    return doc

@router.get("/lead-rotation")
async def get_lead_rotations(year: Optional[int] = None):
    """Get lead rotations, optionally filtered by year"""
    query = {"year": year} if year else {}
    rotations = await db.lead_rotation.find(query, {"_id": 0}).sort("week_number", 1).to_list(1000)
    return rotations

@router.get("/lead-rotation/year/{year}")
async def get_year_rotation(year: int):
    """Get full year rotation plan"""
    rotations = await db.lead_rotation.find({"year": year}, {"_id": 0}).sort("week_number", 1).to_list(52)
    
    # Get all team members for reference (since all members can be leads)
    members = await db.users.find(
        {},
        {"_id": 0, "user_id": 1, "name": 1}
    ).to_list(100)
    
    # Create a map for easy lookup
    member_map = {m["user_id"]: m["name"] for m in members}
    
    # Enrich rotations with lead names
    for r in rotations:
        r["lead_name"] = member_map.get(r.get("lead_user_id"), "Unassigned")
        if r.get("backup_user_id"):
            r["backup_name"] = member_map.get(r["backup_user_id"], "None")
    
    return {
        "year": year,
        "rotations": rotations,
        "available_members": members,
        "total_weeks": 52,
        "assigned_weeks": len(rotations)
    }

@router.put("/lead-rotation/{rotation_id}")
async def update_lead_rotation(rotation_id: str, rotation: LeadRotationCreate):
    """Update an existing lead rotation"""
    await db.lead_rotation.update_one(
        {"rotation_id": rotation_id},
        {"$set": rotation.dict()}
    )
    
    doc = await db.lead_rotation.find_one({"rotation_id": rotation_id}, {"_id": 0})
    return doc

@router.post("/lead-rotation/bulk")
async def bulk_create_rotation(data: BulkRotationCreate):
    """Bulk create/update rotations for a year"""
    year = data.year
    rotations = data.rotations
    
    created = 0
    updated = 0
    
    for rotation in rotations:
        week_number = rotation.get("week_number")
        existing = await db.lead_rotation.find_one({"year": year, "week_number": week_number})
        
        if existing:
            await db.lead_rotation.update_one(
                {"year": year, "week_number": week_number},
                {"$set": {
                    "lead_user_id": rotation.get("lead_user_id"),
                    "backup_user_id": rotation.get("backup_user_id"),
                    "notes": rotation.get("notes")
                }}
            )
            updated += 1
        else:
            await db.lead_rotation.insert_one({
                "rotation_id": f"rotation_{uuid.uuid4().hex[:12]}",
                "week_number": week_number,
                "year": year,
                "lead_user_id": rotation.get("lead_user_id"),
                "backup_user_id": rotation.get("backup_user_id"),
                "notes": rotation.get("notes")
            })
            created += 1
    
    return {"created": created, "updated": updated}

@router.delete("/lead-rotation/{rotation_id}")
async def delete_rotation(rotation_id: str):
    """Delete a lead rotation"""
    result = await db.lead_rotation.delete_one({"rotation_id": rotation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rotation not found")
    return {"message": "Rotation deleted"}
