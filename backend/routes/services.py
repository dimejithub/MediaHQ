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

class ServiceCreate(BaseModel):
    title: str
    date: str
    time: str
    type: str
    team_id: str
    description: Optional[str] = None
    is_combined: bool = False

class BulkServiceCreate(BaseModel):
    team_id: str
    months: int
    services: List[dict]

@router.get("/services")
async def get_services(team: Optional[str] = None):
    """Get services, optionally filtered by team"""
    query = {}
    if team:
        query["$or"] = [{"team": team}, {"team_id": team}, {"is_combined": True}]
    
    services = await db.services.find(query, {"_id": 0}).sort("date", -1).to_list(500)
    return services

@router.get("/services/{service_id}")
async def get_service(service_id: str):
    """Get a specific service"""
    service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/services")
async def create_service(service_data: ServiceCreate):
    """Create a new service"""
    service = {
        "service_id": str(uuid.uuid4()),
        "title": service_data.title,
        "date": service_data.date,
        "time": service_data.time,
        "type": service_data.type,
        "team": service_data.team_id,
        "team_id": service_data.team_id,
        "description": service_data.description,
        "is_combined": service_data.is_combined,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.services.insert_one({**service})
    return service

@router.post("/services/generate-recurring")
async def generate_recurring_services(data: BulkServiceCreate):
    """Generate multiple recurring services"""
    created_services = []
    
    for svc in data.services:
        service = {
            "service_id": str(uuid.uuid4()),
            "title": svc.get('title'),
            "date": svc.get('date'),
            "time": svc.get('time'),
            "type": svc.get('type'),
            "team": data.team_id,
            "team_id": data.team_id,
            "description": svc.get('description', ''),
            "is_combined": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Check for duplicates
        existing = await db.services.find_one({
            "date": service['date'],
            "type": service['type'],
            "team": service['team']
        })
        
        if not existing:
            await db.services.insert_one({**service})
            created_services.append(service)
    
    return {"count": len(created_services), "services": created_services}

@router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    """Delete a service"""
    result = await db.services.delete_one({"service_id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}
