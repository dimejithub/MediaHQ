from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter()

from database import db
from fallback_data import TEAM_MEMBERS

class RotaCreate(BaseModel):
    service_id: str
    assignments: List[dict]

@router.get("/rotas")
async def get_rotas(service_id: Optional[str] = None):
    """Get all rotas"""
    try:
        query = {"service_id": service_id} if service_id else {}
        rotas = await db.rotas.find(query, {"_id": 0}).to_list(500)
        if rotas:
            return rotas
    except Exception as e:
        print(f"Database error: {e}")
    return []

@router.get("/rotas/{rota_id}")
async def get_rota(rota_id: str):
    """Get a specific rota"""
    try:
        rota = await db.rotas.find_one({"rota_id": rota_id}, {"_id": 0})
        if rota:
            return rota
    except Exception as e:
        print(f"Database error: {e}")
    raise HTTPException(status_code=404, detail="Rota not found")

@router.post("/rotas")
async def create_rota(rota: RotaCreate):
    """Create a new rota"""
    rota_id = f"rota_{uuid.uuid4().hex[:12]}"
    new_rota = {
        "rota_id": rota_id,
        "service_id": rota.service_id,
        "assignments": rota.assignments,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    try:
        await db.rotas.insert_one(new_rota)
        return await db.rotas.find_one({"rota_id": rota_id}, {"_id": 0})
    except Exception as e:
        print(f"Database error: {e}")
        return new_rota

@router.put("/rotas/{rota_id}/assignments/{user_id}")
async def update_assignment(rota_id: str, user_id: str, status: str):
    """Update assignment status"""
    try:
        await db.rotas.update_one(
            {"rota_id": rota_id, "assignments.user_id": user_id},
            {"$set": {"assignments.$.status": status}}
        )
        return await db.rotas.find_one({"rota_id": rota_id}, {"_id": 0})
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update")
