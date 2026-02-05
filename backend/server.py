from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import requests
import io
import json
import csv
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Twilio settings (optional - only loaded if configured)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER')

twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        from twilio.rest import Client
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        logging.info("Twilio client initialized")
    except ImportError:
        logging.warning("Twilio package not installed. WhatsApp notifications disabled.")

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ========== MODELS ==========

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "member"
    skills: List[str] = []
    availability: str = "available"
    phone: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    service_id: str
    title: str
    date: str
    time: str
    type: str
    description: Optional[str] = None
    created_by: str
    created_at: datetime

class ServiceCreate(BaseModel):
    title: str
    date: str
    time: str
    type: str
    description: Optional[str] = None

class RotaAssignment(BaseModel):
    assignment_id: str
    user_id: str
    role: str
    status: str = "pending"

class Rota(BaseModel):
    model_config = ConfigDict(extra="ignore")
    rota_id: str
    service_id: str
    assignments: List[RotaAssignment]
    notes: Optional[str] = None
    created_at: datetime

class RotaCreate(BaseModel):
    service_id: str
    assignments: List[Dict[str, str]]
    notes: Optional[str] = None

class RotaConfirm(BaseModel):
    status: str

class Equipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    equipment_id: str
    name: str
    category: str
    status: str = "available"
    checked_out_by: Optional[str] = None
    checked_out_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

class EquipmentCreate(BaseModel):
    name: str
    category: str
    notes: Optional[str] = None

class ChecklistItem(BaseModel):
    item_id: str
    text: str
    completed: bool = False

class Checklist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    checklist_id: str
    service_id: str
    title: str
    items: List[ChecklistItem]
    created_at: datetime

class ChecklistCreate(BaseModel):
    service_id: str
    title: str
    items: List[Dict[str, str]]

class TrainingVideo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    video_id: str
    title: str
    youtube_url: str
    category: str
    duration: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

class TrainingVideoCreate(BaseModel):
    title: str
    youtube_url: str
    category: str
    duration: Optional[str] = None
    description: Optional[str] = None

# New: Training Material for PDF/PPT/DOC
class TrainingMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    material_id: str
    title: str
    url: str  # External URL (Google Drive, etc.)
    type: str  # pdf, ppt, doc, other
    category: str
    description: Optional[str] = None
    created_at: datetime

class TrainingMaterialCreate(BaseModel):
    title: str
    url: str
    type: str
    category: str
    description: Optional[str] = None

# New: Service Report
class ServiceReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    report_id: str
    service_id: str
    attendees: List[str]  # user_ids
    issues: Optional[str] = None
    equipment_status: Optional[str] = None
    improvements: Optional[str] = None
    next_steps: Optional[str] = None
    submitted_by: str
    created_at: datetime

class ServiceReportCreate(BaseModel):
    service_id: str
    attendees: List[str]
    issues: Optional[str] = None
    equipment_status: Optional[str] = None
    improvements: Optional[str] = None
    next_steps: Optional[str] = None

# New: Member Availability
class MemberAvailability(BaseModel):
    model_config = ConfigDict(extra="ignore")
    availability_id: str
    user_id: str
    date: str
    status: str  # available, unavailable, tentative
    notes: Optional[str] = None

class MemberAvailabilityCreate(BaseModel):
    date: str
    status: str
    notes: Optional[str] = None

# New: In-App Notification
class InAppNotification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    notification_id: str
    user_id: str
    title: str
    message: str
    type: str  # rota_assignment, service_reminder, general
    read: bool = False
    created_at: datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str

class TrainingProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    video_id: str
    completed: bool = False
    completed_at: Optional[datetime] = None

class LeadRotation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    rotation_id: str
    week_number: int
    year: int
    lead_user_id: str
    backup_user_id: Optional[str] = None
    notes: Optional[str] = None

class LeadRotationCreate(BaseModel):
    week_number: int
    year: int
    lead_user_id: str
    backup_user_id: Optional[str] = None
    notes: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[List[str]] = None
    availability: Optional[str] = None
    phone: Optional[str] = None

# ========== HELPER FUNCTIONS ==========

async def get_user_from_session(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")
    
    auth_backend_url = os.environ.get('AUTH_BACKEND_URL', 'https://demobackend.emergentagent.com')
    ext_response = requests.get(
        f"{auth_backend_url}/auth/v1/env/oauth/session-data",
        headers={"X-Session-ID": session_id}
    )
    
    if ext_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session ID")
    
    session_data = SessionData(**ext_response.json())
    
    user_doc = await db.users.find_one({"email": session_data.email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": session_data.name,
                "picture": session_data.picture
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": session_data.email,
            "name": session_data.name,
            "picture": session_data.picture,
            "role": "member",
            "skills": [],
            "availability": "available",
            "phone": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_data.session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_data.session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

@api_router.get("/auth/me")
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out successfully"}

# ========== DASHBOARD ENDPOINTS ==========

@api_router.get("/dashboard/kpis")
async def get_dashboard_kpis(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    total_members = await db.users.count_documents({})
    total_services = await db.services.count_documents({})
    total_equipment = await db.equipment.count_documents({})
    available_equipment = await db.equipment.count_documents({"status": "available"})
    
    upcoming_services = await db.services.find(
        {"date": {"$gte": datetime.now(timezone.utc).strftime("%Y-%m-%d")}},
        {"_id": 0}
    ).sort("date", 1).limit(5).to_list(5)
    
    pending_rotas = await db.rotas.count_documents({
        "assignments.status": "pending"
    })
    
    return {
        "total_members": total_members,
        "total_services": total_services,
        "total_equipment": total_equipment,
        "available_equipment": available_equipment,
        "upcoming_services": upcoming_services,
        "pending_rotas": pending_rotas
    }

# ========== TEAM ENDPOINTS ==========

@api_router.get("/team/members")
async def get_team_members(request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    members = await db.users.find(
        {},
        {"_id": 0, "user_id": 1, "email": 1, "name": 1, "picture": 1, "role": 1, "skills": 1, "availability": 1, "phone": 1, "created_at": 1}
    ).to_list(1000)
    for m in members:
        if isinstance(m['created_at'], str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return members

@api_router.get("/team/members/{user_id}")
async def get_team_member(user_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    member = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if isinstance(member['created_at'], str):
        member['created_at'] = datetime.fromisoformat(member['created_at'])
    return member

@api_router.put("/team/members/{user_id}")
async def update_team_member(user_id: str, update: UserUpdate, request: Request, session_token: Optional[str] = Cookie(None)):
    current_user = await get_user_from_session(request, session_token)
    if current_user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"user_id": user_id}, {"$set": update_data})
    
    member = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if isinstance(member['created_at'], str):
        member['created_at'] = datetime.fromisoformat(member['created_at'])
    return member

@api_router.get("/team/skills")
async def get_all_skills(request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    members = await db.users.find({}, {"_id": 0, "skills": 1}).to_list(1000)
    all_skills = set()
    for m in members:
        all_skills.update(m.get("skills", []))
    return {"skills": sorted(list(all_skills))}

# ========== SERVICE ENDPOINTS ==========

@api_router.post("/services")
async def create_service(service: ServiceCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    service_id = f"service_{uuid.uuid4().hex[:12]}"
    new_service = {
        "service_id": service_id,
        **service.model_dump(),
        "created_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.services.insert_one(new_service)
    
    doc = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.get("/services")
async def get_services(request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    services = await db.services.find(
        {},
        {"_id": 0, "service_id": 1, "title": 1, "date": 1, "time": 1, "type": 1, "description": 1, "created_by": 1, "created_at": 1}
    ).sort("date", -1).to_list(1000)
    for s in services:
        if isinstance(s['created_at'], str):
            s['created_at'] = datetime.fromisoformat(s['created_at'])
    return services

@api_router.get("/services/{service_id}")
async def get_service(service_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    if isinstance(service['created_at'], str):
        service['created_at'] = datetime.fromisoformat(service['created_at'])
    return service

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.services.delete_one({"service_id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# ========== ROTA ENDPOINTS ==========

@api_router.post("/rotas")
async def create_rota(rota: RotaCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    rota_id = f"rota_{uuid.uuid4().hex[:12]}"
    assignments = []
    for a in rota.assignments:
        assignments.append({
            "assignment_id": f"assign_{uuid.uuid4().hex[:8]}",
            "user_id": a["user_id"],
            "role": a["role"],
            "status": "pending"
        })
    
    new_rota = {
        "rota_id": rota_id,
        "service_id": rota.service_id,
        "assignments": assignments,
        "notes": rota.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.rotas.insert_one(new_rota)
    
    doc = await db.rotas.find_one({"rota_id": rota_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.get("/rotas")
async def get_rotas(request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    rotas = await db.rotas.find({}, {"_id": 0}).to_list(1000)
    for r in rotas:
        if isinstance(r['created_at'], str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return rotas

@api_router.get("/rotas/my-rotas")
async def get_my_rotas(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    rotas = await db.rotas.find(
        {"assignments.user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Batch fetch services to avoid N+1 query problem
    service_ids = list(set([r["service_id"] for r in rotas]))
    services = await db.services.find(
        {"service_id": {"$in": service_ids}},
        {"_id": 0}
    ).to_list(1000)
    
    # Create service lookup dict
    service_dict = {s["service_id"]: s for s in services}
    
    enriched_rotas = []
    for r in rotas:
        if isinstance(r['created_at'], str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
        service = service_dict.get(r["service_id"])
        user_assignment = next((a for a in r["assignments"] if a["user_id"] == user.user_id), None)
        enriched_rotas.append({
            **r,
            "service": service,
            "my_assignment": user_assignment
        })
    
    return enriched_rotas

@api_router.put("/rotas/{rota_id}/assignments/{assignment_id}/confirm")
async def confirm_rota_assignment(rota_id: str, assignment_id: str, confirm: RotaConfirm, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    rota = await db.rotas.find_one({"rota_id": rota_id}, {"_id": 0})
    if not rota:
        raise HTTPException(status_code=404, detail="Rota not found")
    
    assignment = next((a for a in rota["assignments"] if a["assignment_id"] == assignment_id), None)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if assignment["user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot confirm other user's assignment")
    
    await db.rotas.update_one(
        {"rota_id": rota_id, "assignments.assignment_id": assignment_id},
        {"$set": {"assignments.$.status": confirm.status}}
    )
    
    updated_rota = await db.rotas.find_one({"rota_id": rota_id}, {"_id": 0})
    if isinstance(updated_rota['created_at'], str):
        updated_rota['created_at'] = datetime.fromisoformat(updated_rota['created_at'])
    return updated_rota

# ========== EQUIPMENT ENDPOINTS ==========

@api_router.post("/equipment")
async def create_equipment(equipment: EquipmentCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    equipment_id = f"equip_{uuid.uuid4().hex[:12]}"
    new_equipment = {
        "equipment_id": equipment_id,
        **equipment.model_dump(),
        "status": "available",
        "checked_out_by": None,
        "checked_out_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.equipment.insert_one(new_equipment)
    
    doc = await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.get("/equipment")
async def get_equipment(request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    equipment = await db.equipment.find({}, {"_id": 0}).to_list(1000)
    for e in equipment:
        if isinstance(e['created_at'], str):
            e['created_at'] = datetime.fromisoformat(e['created_at'])
        if e.get('checked_out_at') and isinstance(e['checked_out_at'], str):
            e['checked_out_at'] = datetime.fromisoformat(e['checked_out_at'])
    return equipment

@api_router.put("/equipment/{equipment_id}/checkout")
async def checkout_equipment(equipment_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    equipment = await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if equipment["status"] != "available":
        raise HTTPException(status_code=400, detail="Equipment not available")
    
    await db.equipment.update_one(
        {"equipment_id": equipment_id},
        {"$set": {
            "status": "checked_out",
            "checked_out_by": user.user_id,
            "checked_out_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    doc = await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    if isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    if doc.get('checked_out_at'):
        doc['checked_out_at'] = datetime.fromisoformat(doc['checked_out_at'])
    return doc

@api_router.put("/equipment/{equipment_id}/checkin")
async def checkin_equipment(equipment_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    
    await db.equipment.update_one(
        {"equipment_id": equipment_id},
        {"$set": {
            "status": "available",
            "checked_out_by": None,
            "checked_out_at": None
        }}
    )
    
    doc = await db.equipment.find_one({"equipment_id": equipment_id}, {"_id": 0})
    if isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.equipment.delete_one({"equipment_id": equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted"}

# ========== CHECKLIST ENDPOINTS ==========

@api_router.post("/checklists")
async def create_checklist(checklist: ChecklistCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    checklist_id = f"checklist_{uuid.uuid4().hex[:12]}"
    items = []
    for item in checklist.items:
        items.append({
            "item_id": f"item_{uuid.uuid4().hex[:8]}",
            "text": item["text"],
            "completed": False
        })
    
    new_checklist = {
        "checklist_id": checklist_id,
        "service_id": checklist.service_id,
        "title": checklist.title,
        "items": items,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.checklists.insert_one(new_checklist)
    
    doc = await db.checklists.find_one({"checklist_id": checklist_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.get("/checklists")
async def get_checklists(request: Request, session_token: Optional[str] = Cookie(None), service_id: Optional[str] = None):
    await get_user_from_session(request, session_token)
    query = {"service_id": service_id} if service_id else {}
    checklists = await db.checklists.find(query, {"_id": 0}).to_list(1000)
    for c in checklists:
        if isinstance(c['created_at'], str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return checklists

@api_router.put("/checklists/{checklist_id}/items/{item_id}/toggle")
async def toggle_checklist_item(checklist_id: str, item_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    
    checklist = await db.checklists.find_one({"checklist_id": checklist_id}, {"_id": 0})
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    item = next((i for i in checklist["items"] if i["item_id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    new_status = not item["completed"]
    await db.checklists.update_one(
        {"checklist_id": checklist_id, "items.item_id": item_id},
        {"$set": {"items.$.completed": new_status}}
    )
    
    doc = await db.checklists.find_one({"checklist_id": checklist_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

# ========== TRAINING ENDPOINTS ==========

@api_router.post("/training/videos")
async def create_training_video(video: TrainingVideoCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    video_id = f"video_{uuid.uuid4().hex[:12]}"
    new_video = {
        "video_id": video_id,
        **video.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.training_videos.insert_one(new_video)
    
    doc = await db.training_videos.find_one({"video_id": video_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.get("/training/videos")
async def get_training_videos(request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    videos = await db.training_videos.find({}, {"_id": 0}).to_list(1000)
    for v in videos:
        if isinstance(v['created_at'], str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return videos

@api_router.post("/training/videos/{video_id}/complete")
async def complete_training_video(video_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    existing = await db.training_progress.find_one(
        {"user_id": user.user_id, "video_id": video_id},
        {"_id": 0}
    )
    
    if existing:
        await db.training_progress.update_one(
            {"user_id": user.user_id, "video_id": video_id},
            {"$set": {
                "completed": True,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        await db.training_progress.insert_one({
            "user_id": user.user_id,
            "video_id": video_id,
            "completed": True,
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Progress updated"}

@api_router.get("/training/progress")
async def get_training_progress(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    progress = await db.training_progress.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    return progress

# ========== LEAD ROTATION ENDPOINTS ==========

@api_router.post("/lead-rotation")
async def create_lead_rotation(rotation: LeadRotationCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    rotation_id = f"rotation_{uuid.uuid4().hex[:12]}"
    new_rotation = {
        "rotation_id": rotation_id,
        **rotation.model_dump()
    }
    await db.lead_rotation.insert_one(new_rotation)
    
    doc = await db.lead_rotation.find_one({"rotation_id": rotation_id}, {"_id": 0})
    return doc

@api_router.get("/lead-rotation")
async def get_lead_rotations(year: Optional[int] = None, request: Request = None, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    query = {"year": year} if year else {}
    rotations = await db.lead_rotation.find(query, {"_id": 0}).sort("week_number", 1).to_list(1000)
    return rotations

@api_router.put("/lead-rotation/{rotation_id}")
async def update_lead_rotation(rotation_id: str, rotation: LeadRotationCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    await db.lead_rotation.update_one(
        {"rotation_id": rotation_id},
        {"$set": rotation.model_dump()}
    )
    
    doc = await db.lead_rotation.find_one({"rotation_id": rotation_id}, {"_id": 0})
    return doc

# ========== PERFORMANCE ENDPOINTS ==========

@api_router.get("/performance/metrics")
async def get_performance_metrics(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    members = await db.users.find({}, {"_id": 0}).to_list(1000)
    rotas = await db.rotas.find({}, {"_id": 0}).to_list(1000)
    
    metrics = []
    for member in members:
        user_id = member["user_id"]
        total = 0
        confirmed = 0
        declined = 0
        
        for rota in rotas:
            for assignment in rota["assignments"]:
                if assignment["user_id"] == user_id:
                    total += 1
                    if assignment["status"] == "confirmed":
                        confirmed += 1
                    elif assignment["status"] == "declined":
                        declined += 1
        
        attendance_rate = (confirmed / total * 100) if total > 0 else 0
        
        metrics.append({
            "user_id": user_id,
            "name": member["name"],
            "role": member["role"],
            "total_assignments": total,
            "confirmed": confirmed,
            "declined": declined,
            "pending": total - confirmed - declined,
            "attendance_rate": round(attendance_rate, 2)
        })
    
    return sorted(metrics, key=lambda x: x["attendance_rate"], reverse=True)

# ========== DATA IMPORT/EXPORT ==========

@api_router.post("/data/import")
async def import_data(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    body = await request.json()
    collection_name = body.get("collection")
    data = body.get("data", [])
    
    if collection_name not in ["users", "services", "equipment", "training_videos"]:
        raise HTTPException(status_code=400, detail="Invalid collection")
    
    if data:
        await db[collection_name].insert_many(data)
    
    return {"message": f"Imported {len(data)} records to {collection_name}"}

@api_router.get("/data/export")
async def export_data(collection: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    if collection not in ["users", "services", "equipment", "rotas", "training_videos"]:
        raise HTTPException(status_code=400, detail="Invalid collection")
    
    data = await db[collection].find({}, {"_id": 0}).to_list(10000)
    
    output = io.StringIO()
    if data:
        import csv
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

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()