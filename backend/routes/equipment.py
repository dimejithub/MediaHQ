from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import asyncio
import uuid

router = APIRouter()

from database import db
from fallback_data import EQUIPMENT
from cache import cache, equipment_cache_key

class EquipmentCreate(BaseModel):
    name: str
    category: str
    status: Optional[str] = "available"
    notes: Optional[str] = None
    team: Optional[str] = "envoy_nation"

class HandoverCreate(BaseModel):
    equipment_id: str
    from_user_id: Optional[str] = None
    to_user_id: str
    notes: Optional[str] = None

@router.get("/equipment")
async def get_equipment(team: Optional[str] = None, status: Optional[str] = None):
    """Get all equipment - optimized with caching"""
    
    # Check cache (only for simple queries without status filter)
    if not status:
        cache_key = equipment_cache_key(team)
        cached = cache.get(cache_key)
        if cached:
            return cached
    
    # Prepare fallback
    result = EQUIPMENT
    if team:
        result = [e for e in result if e.get("team") == team]
    if status:
        result = [e for e in result if e.get("status") == status]
    
    try:
        query = {}
        if team:
            query["$or"] = [{"team": team}, {"team_id": team}]
        if status:
            query["status"] = status
        
        equipment = await asyncio.wait_for(
            db.equipment.find(query, {"_id": 0}).to_list(500),
            timeout=2.0
        )
        
        if equipment:
            if not status:
                cache.set(equipment_cache_key(team), equipment, ttl=60)
            return equipment
    except Exception as e:
        print(f"Equipment query failed, using fallback: {e}")
    
    if not status:
        cache.set(equipment_cache_key(team), result, ttl=30)
    return result

@router.get("/equipment/{equipment_id}")
async def get_equipment_item(equipment_id: str):
    """Get a specific equipment item"""
    try:
        item = await asyncio.wait_for(
            db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0}),
            timeout=2.0
        )
        if item:
            return item
    except Exception as e:
        print(f"Equipment query failed: {e}")
    
    # Fallback
    for e in EQUIPMENT:
        if e["equipment_id"] == equipment_id:
            return e
    
    raise HTTPException(status_code=404, detail="Equipment not found")

@router.post("/equipment")
async def create_equipment(equipment: EquipmentCreate):
    """Create new equipment"""
    equipment_id = f"equip_{uuid.uuid4().hex[:12]}"
    new_equipment = {
        "equipment_id": equipment_id,
        **equipment.dict(),
        "team_id": equipment.team,
        "checked_out_by": None,
        "checked_out_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        await db.equipment.insert_one(new_equipment)
        cache.invalidate_pattern("equipment:")
        cache.invalidate_pattern("dashboard:")
        return await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    except Exception as e:
        print(f"Equipment create failed: {e}")
        return new_equipment

@router.put("/equipment/{equipment_id}/checkout")
async def checkout_equipment(equipment_id: str, user_id: str):
    """Check out equipment to a user"""
    try:
        await db.equipment.update_one(
            {"equipment_id": equipment_id},
            {"$set": {
                "status": "checked_out",
                "checked_out_by": user_id,
                "checked_out_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        cache.invalidate_pattern("equipment:")
        cache.invalidate_pattern("dashboard:")
        return await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    except Exception as e:
        print(f"Equipment checkout failed: {e}")
        for eq in EQUIPMENT:
            if eq["equipment_id"] == equipment_id:
                return {**eq, "status": "checked_out", "checked_out_by": user_id}
        raise HTTPException(status_code=404, detail="Equipment not found")

@router.put("/equipment/{equipment_id}/return")
async def return_equipment(equipment_id: str):
    """Return checked out equipment"""
    try:
        await db.equipment.update_one(
            {"equipment_id": equipment_id},
            {"$set": {
                "status": "available",
                "checked_out_by": None,
                "checked_out_at": None
            }}
        )
        cache.invalidate_pattern("equipment:")
        cache.invalidate_pattern("dashboard:")
        return await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    except Exception as e:
        print(f"Equipment return failed: {e}")
        for eq in EQUIPMENT:
            if eq["equipment_id"] == equipment_id:
                return {**eq, "status": "available", "checked_out_by": None}
        raise HTTPException(status_code=404, detail="Equipment not found")

@router.get("/handovers")
async def get_handovers():
    """Get all equipment handovers"""
    try:
        handovers = await asyncio.wait_for(
            db.handovers.find({}, {"_id": 0}).sort("created_at", -1).to_list(100),
            timeout=2.0
        )
        return handovers
    except Exception as e:
        print(f"Handovers query failed: {e}")
        return []

@router.post("/handovers")
async def create_handover(handover: HandoverCreate):
    """Create an equipment handover"""
    handover_id = f"handover_{uuid.uuid4().hex[:12]}"
    new_handover = {
        "handover_id": handover_id,
        **handover.dict(),
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        await db.handovers.insert_one(new_handover)
        
        # Update equipment status
        await db.equipment.update_one(
            {"equipment_id": handover.equipment_id},
            {"$set": {
                "status": "checked_out",
                "checked_out_by": handover.to_user_id,
                "checked_out_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        cache.invalidate_pattern("equipment:")
        return new_handover
    except Exception as e:
        print(f"Handover create failed: {e}")
        return new_handover
