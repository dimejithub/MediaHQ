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

# Team constants
TEAMS = ["envoy_nation", "e_nation"]
ROLES = ["member", "team_lead", "admin", "director"]

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "member"
    teams: List[str] = []  # Can belong to multiple teams
    primary_team: Optional[str] = None  # Primary team assignment
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
    team: str = "envoy_nation"  # Which team this service belongs to
    is_combined: bool = False  # True for combined workforce events
    description: Optional[str] = None
    created_by: str
    created_at: datetime

class ServiceCreate(BaseModel):
    title: str
    date: str
    time: str
    type: str
    team: str = "envoy_nation"
    is_combined: bool = False
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
    team: str = "envoy_nation"
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

# ========== IMPORT TEMPLATES ==========

@api_router.get("/data/template/{collection}")
async def get_import_template(collection: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Get CSV template for data import"""
    await get_user_from_session(request, session_token)
    
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
            "notes": "date format: YYYY-MM-DD. time format: HH:MM. type options: sunday_service, worship_night, youth_service, special_event, conference"
        },
        "equipment": {
            "headers": ["name", "category", "status", "notes"],
            "sample": [
                {"name": "Sony PTZ Camera", "category": "camera", "status": "available", "notes": "Main pulpit camera"},
                {"name": "Shure SM58 Mic", "category": "audio", "status": "available", "notes": "Handheld microphone"},
            ],
            "notes": "category options: camera, audio, lighting, computer, cable, video_switcher, other. status options: available, checked_out, maintenance"
        }
    }
    
    if collection not in templates:
        raise HTTPException(status_code=400, detail="Invalid collection. Use: users, services, or equipment")
    
    template = templates[collection]
    
    # Generate CSV
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

@api_router.get("/data/template-info")
async def get_template_info(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get information about all available import templates"""
    await get_user_from_session(request, session_token)
    
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

@api_router.post("/data/import-csv")
async def import_csv_data(collection: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Import data from CSV format"""
    user = await get_user_from_session(request, session_token)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    body = await request.json()
    csv_data = body.get("data", [])
    
    if collection not in ["users", "services", "equipment"]:
        raise HTTPException(status_code=400, detail="Invalid collection")
    
    imported = 0
    errors = []
    
    for idx, row in enumerate(csv_data):
        try:
            if collection == "users":
                # Check if user already exists
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
                    "created_by": user.user_id,
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
        "total": len(csv_data),
        "errors": errors
    }

# ========== TRAINING MATERIALS (PDF/PPT/DOC) ==========

@api_router.post("/training/materials")
async def create_training_material(material: TrainingMaterialCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    material_id = f"material_{uuid.uuid4().hex[:12]}"
    new_material = {
        "material_id": material_id,
        **material.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.training_materials.insert_one(new_material)
    
    doc = await db.training_materials.find_one({"material_id": material_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.get("/training/materials")
async def get_training_materials(request: Request, session_token: Optional[str] = Cookie(None), category: Optional[str] = None):
    await get_user_from_session(request, session_token)
    query = {"category": category} if category else {}
    materials = await db.training_materials.find(query, {"_id": 0}).to_list(1000)
    for m in materials:
        if isinstance(m['created_at'], str):
            m['created_at'] = datetime.fromisoformat(m['created_at'])
    return materials

@api_router.delete("/training/materials/{material_id}")
async def delete_training_material(material_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.training_materials.delete_one({"material_id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted"}

# ========== SERVICE REPORTS ==========

@api_router.post("/reports")
async def create_service_report(report: ServiceReportCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    report_id = f"report_{uuid.uuid4().hex[:12]}"
    new_report = {
        "report_id": report_id,
        **report.model_dump(),
        "submitted_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.service_reports.insert_one(new_report)
    
    doc = await db.service_reports.find_one({"report_id": report_id}, {"_id": 0})
    doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

@api_router.get("/reports")
async def get_service_reports(request: Request, session_token: Optional[str] = Cookie(None), service_id: Optional[str] = None):
    await get_user_from_session(request, session_token)
    query = {"service_id": service_id} if service_id else {}
    reports = await db.service_reports.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for r in reports:
        if isinstance(r['created_at'], str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return reports

@api_router.get("/reports/{report_id}")
async def get_service_report(report_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    await get_user_from_session(request, session_token)
    report = await db.service_reports.find_one({"report_id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if isinstance(report['created_at'], str):
        report['created_at'] = datetime.fromisoformat(report['created_at'])
    return report

# ========== MEMBER AVAILABILITY ==========

@api_router.post("/availability")
async def set_availability(availability: MemberAvailabilityCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    # Upsert - update if exists for this date, create if not
    existing = await db.member_availability.find_one(
        {"user_id": user.user_id, "date": availability.date}
    )
    
    if existing:
        await db.member_availability.update_one(
            {"user_id": user.user_id, "date": availability.date},
            {"$set": {"status": availability.status, "notes": availability.notes}}
        )
        doc = await db.member_availability.find_one(
            {"user_id": user.user_id, "date": availability.date},
            {"_id": 0}
        )
    else:
        availability_id = f"avail_{uuid.uuid4().hex[:12]}"
        new_availability = {
            "availability_id": availability_id,
            "user_id": user.user_id,
            **availability.model_dump()
        }
        await db.member_availability.insert_one(new_availability)
        doc = await db.member_availability.find_one({"availability_id": availability_id}, {"_id": 0})
    
    return doc

@api_router.get("/availability")
async def get_availability(request: Request, session_token: Optional[str] = Cookie(None), user_id: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None):
    await get_user_from_session(request, session_token)
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    
    availability = await db.member_availability.find(query, {"_id": 0}).to_list(10000)
    return availability

@api_router.get("/availability/my")
async def get_my_availability(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    availability = await db.member_availability.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    return availability

# ========== IN-APP NOTIFICATIONS ==========

@api_router.get("/notifications")
async def get_notifications(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    notifications = await db.notifications.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    for n in notifications:
        if isinstance(n['created_at'], str):
            n['created_at'] = datetime.fromisoformat(n['created_at'])
    return notifications

@api_router.get("/notifications/unread-count")
async def get_unread_count(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    count = await db.notifications.count_documents({"user_id": user.user_id, "read": False})
    return {"unread_count": count}

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    
    await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": user.user_id},
        {"$set": {"read": True}}
    )
    return {"message": "Marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_read(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    await db.notifications.update_many(
        {"user_id": user.user_id, "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

# Helper function to create notifications
async def create_notification(user_id: str, title: str, message: str, notification_type: str):
    notification_id = f"notif_{uuid.uuid4().hex[:12]}"
    notification = {
        "notification_id": notification_id,
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    return notification

# ========== WHATSAPP NOTIFICATIONS (TWILIO) ==========

@api_router.post("/whatsapp/send")
async def send_whatsapp_notification(request: Request, session_token: Optional[str] = Cookie(None)):
    """Send WhatsApp notification to a team member"""
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    if not twilio_client:
        raise HTTPException(status_code=503, detail="WhatsApp notifications not configured. Please add Twilio credentials.")
    
    body = await request.json()
    to_phone = body.get("phone")
    message_text = body.get("message")
    
    if not to_phone or not message_text:
        raise HTTPException(status_code=400, detail="Phone and message required")
    
    try:
        message = twilio_client.messages.create(
            from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
            body=message_text,
            to=f"whatsapp:{to_phone}"
        )
        
        # Log the message
        await db.whatsapp_messages.insert_one({
            "message_sid": message.sid,
            "to_phone": to_phone,
            "message": message_text,
            "sent_by": user.user_id,
            "status": "sent",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"status": "sent", "message_sid": message.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send: {str(e)}")

@api_router.post("/whatsapp/notify-rota")
async def notify_rota_assignment(request: Request, session_token: Optional[str] = Cookie(None)):
    """Send WhatsApp notification for rota assignment"""
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    body = await request.json()
    user_ids = body.get("user_ids", [])
    service_title = body.get("service_title")
    service_date = body.get("service_date")
    service_time = body.get("service_time")
    
    if not user_ids or not service_title:
        raise HTTPException(status_code=400, detail="user_ids and service_title required")
    
    results = {"sent": 0, "failed": 0, "no_phone": 0, "errors": []}
    
    for user_id in user_ids:
        member = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not member:
            results["errors"].append(f"User {user_id} not found")
            results["failed"] += 1
            continue
        
        phone = member.get("phone")
        if not phone:
            results["no_phone"] += 1
            continue
        
        # Create in-app notification
        await create_notification(
            user_id=user_id,
            title="New Rota Assignment",
            message=f"You've been assigned to {service_title} on {service_date} at {service_time}. Please confirm your availability.",
            notification_type="rota_assignment"
        )
        
        # Send WhatsApp if configured
        if twilio_client and TWILIO_WHATSAPP_NUMBER:
            try:
                message_text = f"📋 *TEN MediaHQ Rota Assignment*\n\nHi {member.get('name', 'Team Member')}!\n\nYou've been assigned to:\n📌 {service_title}\n📅 {service_date}\n🕐 {service_time}\n\nPlease log in to confirm your availability."
                
                message = twilio_client.messages.create(
                    from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
                    body=message_text,
                    to=f"whatsapp:{phone}"
                )
                
                await db.whatsapp_messages.insert_one({
                    "message_sid": message.sid,
                    "to_phone": phone,
                    "message": message_text,
                    "sent_by": user.user_id,
                    "type": "rota_assignment",
                    "status": "sent",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
                
                results["sent"] += 1
            except Exception as e:
                results["errors"].append(f"WhatsApp to {phone}: {str(e)}")
                results["failed"] += 1
        else:
            results["sent"] += 1  # Count in-app notification as sent
    
    return results

@api_router.get("/whatsapp/status")
async def get_whatsapp_status(request: Request, session_token: Optional[str] = Cookie(None)):
    """Check if WhatsApp notifications are configured"""
    await get_user_from_session(request, session_token)
    return {
        "configured": twilio_client is not None,
        "whatsapp_number": TWILIO_WHATSAPP_NUMBER if twilio_client else None
    }

# ========== 52-WEEK LEAD ROTATION PLANNER ==========

@api_router.get("/lead-rotation/year/{year}")
async def get_year_rotation(year: int, request: Request, session_token: Optional[str] = Cookie(None)):
    """Get full year rotation plan"""
    await get_user_from_session(request, session_token)
    
    rotations = await db.lead_rotation.find({"year": year}, {"_id": 0}).sort("week_number", 1).to_list(52)
    
    # Get all team leads for reference
    leads = await db.users.find(
        {"role": {"$in": ["admin", "team_lead"]}},
        {"_id": 0, "user_id": 1, "name": 1}
    ).to_list(100)
    
    # Create a map for easy lookup
    lead_map = {l["user_id"]: l["name"] for l in leads}
    
    # Enrich rotations with lead names
    for r in rotations:
        r["lead_name"] = lead_map.get(r.get("lead_user_id"), "Unassigned")
        if r.get("backup_user_id"):
            r["backup_name"] = lead_map.get(r["backup_user_id"], "None")
    
    return {
        "year": year,
        "rotations": rotations,
        "available_leads": leads,
        "total_weeks": 52,
        "assigned_weeks": len(rotations)
    }

@api_router.post("/lead-rotation/bulk")
async def bulk_create_rotation(request: Request, session_token: Optional[str] = Cookie(None)):
    """Bulk create/update rotations for a year"""
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    body = await request.json()
    year = body.get("year")
    rotations = body.get("rotations", [])
    
    if not year or not rotations:
        raise HTTPException(status_code=400, detail="year and rotations required")
    
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

@api_router.delete("/lead-rotation/{rotation_id}")
async def delete_rotation(rotation_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    result = await db.lead_rotation.delete_one({"rotation_id": rotation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rotation not found")
    return {"message": "Rotation deleted"}

# ========== ENHANCED PERFORMANCE METRICS ==========

@api_router.get("/performance/detailed")
async def get_detailed_metrics(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get detailed performance metrics including reliability scores"""
    user = await get_user_from_session(request, session_token)
    
    members = await db.users.find({}, {"_id": 0}).to_list(1000)
    rotas = await db.rotas.find({}, {"_id": 0}).to_list(1000)
    reports = await db.service_reports.find({}, {"_id": 0}).to_list(1000)
    
    metrics = []
    for member in members:
        user_id = member["user_id"]
        
        # Assignment stats
        total_assignments = 0
        confirmed = 0
        declined = 0
        
        for rota in rotas:
            for assignment in rota["assignments"]:
                if assignment["user_id"] == user_id:
                    total_assignments += 1
                    if assignment["status"] == "confirmed":
                        confirmed += 1
                    elif assignment["status"] == "declined":
                        declined += 1
        
        # Attendance from reports
        attended_services = sum(1 for r in reports if user_id in r.get("attendees", []))
        
        # Calculate scores
        confirmation_rate = (confirmed / total_assignments * 100) if total_assignments > 0 else 0
        attendance_rate = (attended_services / len(reports) * 100) if len(reports) > 0 else 0
        reliability_score = (confirmation_rate * 0.6 + attendance_rate * 0.4) if total_assignments > 0 else 0
        
        metrics.append({
            "user_id": user_id,
            "name": member["name"],
            "role": member["role"],
            "total_assignments": total_assignments,
            "confirmed": confirmed,
            "declined": declined,
            "pending": total_assignments - confirmed - declined,
            "attended_services": attended_services,
            "confirmation_rate": round(confirmation_rate, 2),
            "attendance_rate": round(attendance_rate, 2),
            "reliability_score": round(reliability_score, 2)
        })
    
    return {
        "metrics": sorted(metrics, key=lambda x: x["reliability_score"], reverse=True),
        "summary": {
            "total_members": len(members),
            "total_rotas": len(rotas),
            "total_reports": len(reports),
            "avg_reliability": round(sum(m["reliability_score"] for m in metrics) / len(metrics), 2) if metrics else 0
        }
    }

@api_router.get("/performance/dashboard")
async def get_performance_dashboard(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get performance dashboard stats"""
    await get_user_from_session(request, session_token)
    
    # Get counts
    total_services = await db.services.count_documents({})
    total_rotas = await db.rotas.count_documents({})
    total_reports = await db.service_reports.count_documents({})
    
    # Get confirmation stats
    rotas = await db.rotas.find({}, {"_id": 0, "assignments": 1}).to_list(1000)
    total_assignments = 0
    confirmed = 0
    declined = 0
    pending = 0
    
    for rota in rotas:
        for a in rota.get("assignments", []):
            total_assignments += 1
            if a["status"] == "confirmed":
                confirmed += 1
            elif a["status"] == "declined":
                declined += 1
            else:
                pending += 1
    
    return {
        "services": total_services,
        "rotas": total_rotas,
        "reports": total_reports,
        "assignments": {
            "total": total_assignments,
            "confirmed": confirmed,
            "declined": declined,
            "pending": pending,
            "confirmation_rate": round((confirmed / total_assignments * 100), 2) if total_assignments > 0 else 0
        }
    }

# ========== SERVICE UPDATE ENDPOINT ==========

@api_router.put("/services/{service_id}")
async def update_service(service_id: str, service: ServiceCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_user_from_session(request, session_token)
    if user.role not in ["admin", "team_lead"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    existing = await db.services.find_one({"service_id": service_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    
    await db.services.update_one(
        {"service_id": service_id},
        {"$set": service.model_dump()}
    )
    
    doc = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if isinstance(doc['created_at'], str):
        doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return doc

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