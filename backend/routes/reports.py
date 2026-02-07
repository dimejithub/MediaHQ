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

class ServiceReportCreate(BaseModel):
    service_id: str
    attendees: List[str]
    issues: Optional[str] = None
    equipment_status: Optional[str] = None
    improvements: Optional[str] = None
    next_steps: Optional[str] = None

@router.post("/reports")
async def create_service_report(report: ServiceReportCreate, user_id: str):
    """Create a new service report"""
    report_id = f"report_{uuid.uuid4().hex[:12]}"
    new_report = {
        "report_id": report_id,
        **report.dict(),
        "submitted_by": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.service_reports.insert_one(new_report)
    
    doc = await db.service_reports.find_one({"report_id": report_id}, {"_id": 0})
    return doc

@router.get("/reports")
async def get_service_reports(service_id: Optional[str] = None):
    """Get all service reports, optionally filtered by service"""
    query = {"service_id": service_id} if service_id else {}
    reports = await db.service_reports.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return reports

@router.get("/reports/{report_id}")
async def get_service_report(report_id: str):
    """Get a specific service report"""
    report = await db.service_reports.find_one({"report_id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
