from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import csv
import io
import os

router = APIRouter()

# Shared database connection
from database import db

@router.get("/data/export/{collection}")
async def export_data(collection: str):
    """Export collection data as CSV"""
    if collection not in ["users", "services", "equipment", "rotas", "training_videos"]:
        raise HTTPException(status_code=400, detail="Invalid collection")
    
    data = await db[collection].find({}, {"_id": 0}).to_list(10000)
    
    output = io.StringIO()
    if data:
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        for row in data:
            for k, v in row.items():
                if isinstance(v, (datetime, list, dict)):
                    row[k] = str(v)
        writer.writerows(data)
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={collection}.csv"}
    )

@router.get("/data/template/{collection}")
async def get_import_template(collection: str):
    """Get CSV template for data import"""
    templates = {
        "users": {
            "headers": ["name", "email", "role", "phone", "skills"],
            "sample": [
                {"name": "John Smith", "email": "john@church.org", "role": "member", "phone": "+1234567890", "skills": "Camera,Sound"},
                {"name": "Sarah Johnson", "email": "sarah@church.org", "role": "team_lead", "phone": "+1234567891", "skills": "ProPresenter,Livestream,Graphics"},
            ],
            "notes": "role must be: admin, team_lead, or member. skills are comma-separated."
        },
        "services": {
            "headers": ["title", "date", "time", "type", "description"],
            "sample": [
                {"title": "Sunday Morning Service", "date": "2026-02-15", "time": "10:00", "type": "sunday_service", "description": "Main worship service"},
                {"title": "Youth Night", "date": "2026-02-18", "time": "19:00", "type": "youth_service", "description": "Youth ministry event"},
            ],
            "notes": "date format: YYYY-MM-DD. time format: HH:MM."
        },
        "equipment": {
            "headers": ["name", "category", "status", "notes"],
            "sample": [
                {"name": "Sony PTZ Camera", "category": "camera", "status": "available", "notes": "Main pulpit camera"},
                {"name": "Shure SM58 Mic", "category": "audio", "status": "available", "notes": "Handheld microphone"},
            ],
            "notes": "category options: camera, audio, lighting, computer, cable, video_switcher, other"
        }
    }
    
    if collection not in templates:
        raise HTTPException(status_code=400, detail="Invalid collection. Use: users, services, or equipment")
    
    template = templates[collection]
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=template["headers"])
    writer.writeheader()
    writer.writerows(template["sample"])
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={collection}_template.csv"}
    )

@router.get("/data/template-info")
async def get_template_info():
    """Get information about all available import templates"""
    return {
        "templates": [
            {
                "collection": "users",
                "description": "Import team members",
                "required_fields": ["name", "email"],
                "optional_fields": ["role", "phone", "skills"],
                "notes": "role must be: admin, team_lead, or member. skills are comma-separated."
            },
            {
                "collection": "services",
                "description": "Import church services",
                "required_fields": ["title", "date", "time", "type"],
                "optional_fields": ["description"],
                "notes": "date format: YYYY-MM-DD. time format: HH:MM."
            },
            {
                "collection": "equipment",
                "description": "Import equipment inventory",
                "required_fields": ["name", "category"],
                "optional_fields": ["status", "notes"],
                "notes": "category options: camera, audio, lighting, computer, cable, video_switcher, other"
            }
        ]
    }

@router.post("/data/import-csv/{collection}")
async def import_csv_data(collection: str, data: List[dict]):
    """Import data from CSV format"""
    if collection not in ["users", "services", "equipment"]:
        raise HTTPException(status_code=400, detail="Invalid collection")
    
    imported = 0
    errors = []
    
    for idx, row in enumerate(data):
        try:
            if collection == "users":
                existing = await db.users.find_one({"email": row.get("email")})
                if existing:
                    errors.append(f"Row {idx+1}: User with email {row.get('email')} already exists")
                    continue
                
                new_user = {
                    "user_id": f"user_{uuid.uuid4().hex[:12]}",
                    "email": row.get("email"),
                    "name": row.get("name"),
                    "role": row.get("role", "member"),
                    "phone": row.get("phone"),
                    "skills": row.get("skills", "").split(",") if row.get("skills") else [],
                    "teams": ["envoy_nation"],
                    "primary_team": "envoy_nation",
                    "availability": "available",
                    "picture": None,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(new_user)
                imported += 1
                
            elif collection == "services":
                new_service = {
                    "service_id": f"service_{uuid.uuid4().hex[:12]}",
                    "title": row.get("title"),
                    "date": row.get("date"),
                    "time": row.get("time"),
                    "type": row.get("type"),
                    "description": row.get("description"),
                    "team": "envoy_nation",
                    "team_id": "envoy_nation",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.services.insert_one(new_service)
                imported += 1
                
            elif collection == "equipment":
                new_equipment = {
                    "equipment_id": f"equip_{uuid.uuid4().hex[:12]}",
                    "name": row.get("name"),
                    "category": row.get("category"),
                    "status": row.get("status", "available"),
                    "notes": row.get("notes"),
                    "team": "envoy_nation",
                    "team_id": "envoy_nation",
                    "checked_out_by": None,
                    "checked_out_at": None,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.equipment.insert_one(new_equipment)
                imported += 1
                
        except Exception as e:
            errors.append(f"Row {idx+1}: {str(e)}")
    
    return {
        "imported": imported,
        "total": len(data),
        "errors": errors
    }
