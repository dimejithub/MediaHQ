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

class EquipmentCreate(BaseModel):
    name: str
    category: str
    team_id: str
    notes: Optional[str] = None

class HandoverCreate(BaseModel):
    equipment_id: str
    to_team: str
    to_user_id: str
    condition_before: str
    condition_notes: Optional[str] = None

@router.get("/equipment")
async def get_equipment(team: Optional[str] = None):
    """Get equipment, optionally filtered by team"""
    query = {}
    if team:
        query["$or"] = [{"team": team}, {"team_id": team}]
    
    equipment = await db.equipment.find(query, {"_id": 0}).to_list(500)
    return equipment

@router.get("/equipment/{equipment_id}")
async def get_equipment_item(equipment_id: str):
    """Get a specific equipment item"""
    item = await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return item

@router.post("/equipment")
async def create_equipment(data: EquipmentCreate):
    """Create a new equipment item"""
    equipment = {
        "equipment_id": str(uuid.uuid4()),
        "name": data.name,
        "category": data.category,
        "team": data.team_id,
        "team_id": data.team_id,
        "status": "available",
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.equipment.insert_one({**equipment})
    return equipment

@router.put("/equipment/{equipment_id}/checkout")
async def checkout_equipment(equipment_id: str):
    """Check out equipment"""
    result = await db.equipment.update_one(
        {"equipment_id": equipment_id},
        {"$set": {"status": "checked_out", "checked_out_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    return {"message": "Equipment checked out"}

@router.put("/equipment/{equipment_id}/checkin")
async def checkin_equipment(equipment_id: str):
    """Check in equipment"""
    result = await db.equipment.update_one(
        {"equipment_id": equipment_id},
        {"$set": {"status": "available", "checked_out_at": None}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    return {"message": "Equipment checked in"}

@router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str):
    """Delete equipment"""
    result = await db.equipment.delete_one({"equipment_id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted"}

@router.get("/equipment/handovers")
async def get_handovers(team: Optional[str] = None):
    """Get equipment handover history"""
    query = {}
    if team:
        query["$or"] = [{"from_team": team}, {"to_team": team}]
    
    handovers = await db.equipment_handovers.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return handovers

@router.post("/equipment/handover")
async def create_handover(data: HandoverCreate):
    """Create an equipment handover record"""
    equipment = await db.equipment.find_one({"equipment_id": data.equipment_id}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    handover = {
        "handover_id": str(uuid.uuid4()),
        "equipment_id": data.equipment_id,
        "equipment_name": equipment.get('name', 'Unknown'),
        "from_team": equipment.get('team', equipment.get('team_id')),
        "to_team": data.to_team,
        "to_user_id": data.to_user_id,
        "condition_before": data.condition_before,
        "condition_notes": data.condition_notes,
        "handover_date": datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update equipment team
    await db.equipment.update_one(
        {"equipment_id": data.equipment_id},
        {"$set": {"team": data.to_team, "team_id": data.to_team}}
    )
    
    await db.equipment_handovers.insert_one({**handover})
    return handover
