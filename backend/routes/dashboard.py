from fastapi import APIRouter
from datetime import datetime, timezone
import os

router = APIRouter()

from motor.motor_asyncio import AsyncIOMotorClient
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("/dashboard/kpis")
async def get_dashboard_kpis(team: str = None):
    """Get dashboard KPIs"""
    # Build team query
    team_query = {"$or": [{"team": team}, {"team_id": team}]} if team else {}
    
    total_members = await db.users.count_documents({})
    total_services = await db.services.count_documents(team_query)
    total_equipment = await db.equipment.count_documents(team_query)
    available_equipment = await db.equipment.count_documents({**team_query, "status": "available"})
    
    # Get upcoming services
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    upcoming_query = {"date": {"$gte": today}}
    if team:
        upcoming_query["$or"] = [{"team": team}, {"team_id": team}]
    
    upcoming_services = await db.services.find(
        upcoming_query,
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

@router.get("/teams")
async def get_teams():
    """Get all teams"""
    teams = [
        {"team_id": "envoy_nation", "name": "Envoy Nation", "description": "Main church media team"},
        {"team_id": "e_nation", "name": "E-Nation", "description": "The Commissioned Envoy team"}
    ]
    
    # Get member counts
    for team in teams:
        count = await db.users.count_documents({
            "$or": [{"teams": team["team_id"]}, {"primary_team": team["team_id"]}]
        })
        team["member_count"] = count
    
    return teams

@router.get("/teams/{team_id}/members")
async def get_team_members(team_id: str):
    """Get members of a specific team"""
    members = await db.users.find(
        {"$or": [{"teams": team_id}, {"primary_team": team_id}]},
        {"_id": 0}
    ).to_list(1000)
    return members

@router.get("/teams/{team_id}/services")
async def get_team_services(team_id: str):
    """Get services for a specific team"""
    services = await db.services.find(
        {"$or": [{"team": team_id}, {"team_id": team_id}, {"is_combined": True}]},
        {"_id": 0}
    ).sort("date", -1).to_list(500)
    return services
