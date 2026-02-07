from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter()

from database import db
from fallback_data import SERVICES

class ServiceCreate(BaseModel):
    title: str
    date: str
    time: str
    type: str
    team: Optional[str] = "envoy_nation"
    description: Optional[str] = None

@router.get("/services")
async def get_services(team: Optional[str] = None):
    """Get all services"""
    try:
        query = {}
        if team:
            query = {"$or": [{"team": team}, {"team_id": team}]}
        
        services = await db.services.find(query, {"_id": 0}).sort("date", -1).to_list(500)
        if services:
            return services
    except Exception as e:
        print(f"Database error, using fallback: {e}")
    
    # Fallback
    if team:
        return [s for s in SERVICES if s.get("team") == team or s.get("team_id") == team]
    return SERVICES

@router.get("/services/{service_id}")
async def get_service(service_id: str):
    """Get a specific service"""
    try:
        service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
        if service:
            return service
    except Exception as e:
        print(f"Database error, using fallback: {e}")
    
    # Fallback
    for s in SERVICES:
        if s["service_id"] == service_id:
            return s
    
    raise HTTPException(status_code=404, detail="Service not found")

@router.post("/services")
async def create_service(service: ServiceCreate):
    """Create a new service"""
    service_id = f"svc_{uuid.uuid4().hex[:12]}"
    new_service = {
        "service_id": service_id,
        **service.dict(),
        "team_id": service.team,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        await db.services.insert_one(new_service)
        return await db.services.find_one({"service_id": service_id}, {"_id": 0})
    except Exception as e:
        print(f"Database error: {e}")
        # Return the new service even if DB fails
        return new_service

@router.post("/services/generate-recurring")
async def generate_recurring_services(weeks: int = 4):
    """Generate recurring services for the next N weeks"""
    from datetime import timedelta
    
    base_services = [
        {"title": "Sunday Morning Service", "time": "11:00", "type": "sunday_service", "team": "envoy_nation", "day": 6},
        {"title": "The Commissioned Envoy Service", "time": "14:00", "type": "sunday_service", "team": "e_nation", "day": 6},
        {"title": "Midweek Leicester Blessings", "time": "18:30", "type": "midweek", "team": "envoy_nation", "day": 2},
        {"title": "Tuesday Standup Meeting", "time": "20:00", "type": "standup", "team": "envoy_nation", "day": 1},
    ]
    
    created = []
    today = datetime.now(timezone.utc).date()
    
    for week in range(weeks):
        for svc in base_services:
            days_ahead = svc["day"] - today.weekday() + (week * 7)
            if days_ahead < 0:
                days_ahead += 7
            
            service_date = today + timedelta(days=days_ahead)
            
            new_service = {
                "service_id": f"svc_{uuid.uuid4().hex[:12]}",
                "title": svc["title"],
                "date": service_date.isoformat(),
                "time": svc["time"],
                "type": svc["type"],
                "team": svc["team"],
                "team_id": svc["team"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            try:
                await db.services.insert_one(new_service)
            except:
                pass
            
            created.append(new_service)
    
    return {"created": len(created), "services": created}
