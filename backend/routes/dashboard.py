from fastapi import APIRouter
from typing import Optional
import os

router = APIRouter()

from database import db
from fallback_data import TEAM_MEMBERS, SERVICES, EQUIPMENT, TEAMS, get_dashboard_kpis

@router.get("/dashboard/kpis")
async def get_dashboard_kpis_endpoint(team: str = None):
    """Get dashboard KPIs"""
    try:
        team_query = {"$or": [{"team": team}, {"team_id": team}]} if team else {}
        
        total_members = await db.users.count_documents({})
        total_services = await db.services.count_documents(team_query)
        total_equipment = await db.equipment.count_documents(team_query)
        available_equipment = await db.equipment.count_documents({**team_query, "status": "available"})
        
        upcoming_services = await db.services.find(
            team_query, {"_id": 0}
        ).sort("date", 1).limit(5).to_list(5)
        
        pending_rotas = await db.rotas.count_documents({"assignments.status": "pending"})
        
        return {
            "total_members": total_members,
            "total_services": total_services,
            "total_equipment": total_equipment,
            "available_equipment": available_equipment,
            "upcoming_services": upcoming_services,
            "pending_rotas": pending_rotas
        }
    except Exception as e:
        print(f"Database error, using fallback: {e}")
        return get_dashboard_kpis()

@router.get("/teams")
async def get_teams():
    """Get all teams"""
    try:
        # Try to get real counts
        envoy_count = await db.users.count_documents({"primary_team": "envoy_nation"})
        enation_count = await db.users.count_documents({"primary_team": "e_nation"})
        
        return [
            {"team_id": "envoy_nation", "name": "Envoy Nation", "description": "Main church media team", "member_count": envoy_count or 20},
            {"team_id": "e_nation", "name": "E-Nation (TCE)", "description": "The Commissioned Envoy team", "member_count": enation_count or 3}
        ]
    except Exception as e:
        print(f"Database error, using fallback: {e}")
        return TEAMS

@router.get("/teams/{team_id}/members")
async def get_team_members(team_id: str):
    """Get members of a specific team"""
    try:
        members = await db.users.find(
            {"$or": [{"teams": team_id}, {"primary_team": team_id}]},
            {"_id": 0, "password_hash": 0}
        ).to_list(100)
        if members:
            return members
    except Exception as e:
        print(f"Database error, using fallback: {e}")
    
    # Fallback
    return [m for m in TEAM_MEMBERS if team_id in m.get("teams", []) or m.get("primary_team") == team_id]

@router.get("/teams/{team_id}/services")
async def get_team_services(team_id: str):
    """Get services for a specific team"""
    try:
        services = await db.services.find(
            {"$or": [{"team": team_id}, {"team_id": team_id}]},
            {"_id": 0}
        ).sort("date", -1).to_list(100)
        if services:
            return services
    except Exception as e:
        print(f"Database error, using fallback: {e}")
    
    # Fallback
    return [s for s in SERVICES if s.get("team") == team_id or s.get("team_id") == team_id]
