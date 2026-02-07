from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os

router = APIRouter()

# Shared database connection
from database import db

class RotaAssignment(BaseModel):
    user_id: str
    role: str
    status: str = "pending"

class RotaCreate(BaseModel):
    service_id: str
    team_id: str
    assignments: List[dict]
    notes: Optional[str] = None

@router.get("/rotas")
async def get_rotas(team: Optional[str] = None, service_id: Optional[str] = None):
    """Get rotas, optionally filtered by team or service"""
    query = {}
    if team:
        query["team"] = team
    if service_id:
        query["service_id"] = service_id
    
    rotas = await db.rotas.find(query, {"_id": 0}).to_list(500)
    return rotas

@router.get("/rotas/{rota_id}")
async def get_rota(rota_id: str):
    """Get a specific rota"""
    rota = await db.rotas.find_one({"rota_id": rota_id}, {"_id": 0})
    if not rota:
        raise HTTPException(status_code=404, detail="Rota not found")
    return rota

@router.post("/rotas")
async def create_rota(rota_data: RotaCreate):
    """Create a new rota"""
    # Check if rota already exists for this service
    existing = await db.rotas.find_one({"service_id": rota_data.service_id})
    if existing:
        raise HTTPException(status_code=400, detail="Rota already exists for this service")
    
    assignments = []
    for a in rota_data.assignments:
        assignments.append({
            "assignment_id": str(uuid.uuid4()),
            "user_id": a.get('user_id'),
            "role": a.get('role'),
            "status": "pending"
        })
    
    rota = {
        "rota_id": str(uuid.uuid4()),
        "service_id": rota_data.service_id,
        "team": rota_data.team_id,
        "assignments": assignments,
        "notes": rota_data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.rotas.insert_one({**rota})
    return rota

@router.put("/rotas/{rota_id}/confirm/{assignment_id}")
async def confirm_rota_assignment(rota_id: str, assignment_id: str, status: str = "confirmed"):
    """Confirm or decline a rota assignment"""
    rota = await db.rotas.find_one({"rota_id": rota_id})
    if not rota:
        raise HTTPException(status_code=404, detail="Rota not found")
    
    for assignment in rota.get('assignments', []):
        if assignment.get('assignment_id') == assignment_id:
            assignment['status'] = status
            break
    
    await db.rotas.update_one(
        {"rota_id": rota_id},
        {"$set": {"assignments": rota['assignments']}}
    )
    
    return {"message": f"Assignment {status}"}

@router.get("/my-rotas/{user_id}")
async def get_user_rotas(user_id: str):
    """Get rotas for a specific user"""
    rotas = await db.rotas.find(
        {"assignments.user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with service details
    enriched = []
    for rota in rotas:
        service = await db.services.find_one({"service_id": rota['service_id']}, {"_id": 0})
        if service:
            rota['service'] = service
        enriched.append(rota)
    
    return enriched
