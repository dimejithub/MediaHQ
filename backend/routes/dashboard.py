from fastapi import APIRouter
from typing import Optional
import asyncio

router = APIRouter()

from database import db, get_with_fallback
from fallback_data import TEAM_MEMBERS, SERVICES, EQUIPMENT, TEAMS, get_dashboard_kpis
from cache import cache, dashboard_cache_key, teams_cache_key

@router.get("/dashboard/kpis")
async def get_dashboard_kpis_endpoint(team: str = None):
    """Get dashboard KPIs - optimized with caching"""
    
    # Check cache first
    cache_key = dashboard_cache_key(team)
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    # Try database with timeout, fallback quickly
    try:
        team_query = {"$or": [{"team": team}, {"team_id": team}]} if team else {}
        
        # Run all queries in parallel with timeout
        results = await asyncio.wait_for(
            asyncio.gather(
                db.users.count_documents({}),
                db.services.count_documents(team_query),
                db.equipment.count_documents(team_query),
                db.equipment.count_documents({**team_query, "status": "available"}),
                db.services.find(team_query, {"_id": 0}).sort("date", 1).limit(5).to_list(5),
                db.rotas.count_documents({"assignments.status": "pending"}),
                return_exceptions=True
            ),
            timeout=3.0
        )
        
        # Check if any query failed
        if any(isinstance(r, Exception) for r in results):
            raise Exception("One or more DB queries failed")
        
        total_members, total_services, total_equipment, available_equipment, upcoming_services, pending_rotas = results
        
        data = {
            "total_members": total_members,
            "total_services": total_services,
            "total_equipment": total_equipment,
            "available_equipment": available_equipment,
            "upcoming_services": upcoming_services,
            "pending_rotas": pending_rotas
        }
        
        # Cache for 60 seconds
        cache.set(cache_key, data, ttl=60)
        return data
        
    except Exception as e:
        print(f"Dashboard KPIs: using fallback data ({e})")
        fallback = get_dashboard_kpis()
        cache.set(cache_key, fallback, ttl=30)  # Shorter TTL for fallback
        return fallback

@router.get("/teams")
async def get_teams():
    """Get all teams - optimized with caching"""
    
    # Check cache first
    cache_key = teams_cache_key()
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    try:
        # Run counts in parallel
        results = await asyncio.wait_for(
            asyncio.gather(
                db.users.count_documents({"primary_team": "envoy_nation"}),
                db.users.count_documents({"primary_team": "e_nation"}),
                return_exceptions=True
            ),
            timeout=2.0
        )
        
        if any(isinstance(r, Exception) for r in results):
            raise Exception("Count queries failed")
        
        envoy_count, enation_count = results
        
        data = [
            {"team_id": "envoy_nation", "name": "Envoy Nation", "description": "Main church media team", "member_count": envoy_count or 20},
            {"team_id": "e_nation", "name": "E-Nation (TCE)", "description": "The Commissioned Envoy team", "member_count": enation_count or 3}
        ]
        
        cache.set(cache_key, data, ttl=120)  # 2 min TTL
        return data
        
    except Exception as e:
        print(f"Teams: using fallback data ({e})")
        cache.set(cache_key, TEAMS, ttl=60)
        return TEAMS

@router.get("/teams/{team_id}/members")
async def get_team_members(team_id: str):
    """Get members of a specific team"""
    from cache import users_cache_key
    
    cache_key = users_cache_key(team_id)
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    fallback = [m for m in TEAM_MEMBERS if team_id in m.get("teams", []) or m.get("primary_team") == team_id]
    
    try:
        members = await asyncio.wait_for(
            db.users.find(
                {"$or": [{"teams": team_id}, {"primary_team": team_id}]},
                {"_id": 0, "password_hash": 0}
            ).to_list(100),
            timeout=2.0
        )
        
        if members:
            cache.set(cache_key, members, ttl=60)
            return members
    except Exception as e:
        print(f"Team members: using fallback ({e})")
    
    cache.set(cache_key, fallback, ttl=30)
    return fallback

@router.get("/teams/{team_id}/services")
async def get_team_services(team_id: str):
    """Get services for a specific team"""
    from cache import services_cache_key
    
    cache_key = services_cache_key(team_id)
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    fallback = [s for s in SERVICES if s.get("team") == team_id or s.get("team_id") == team_id]
    
    try:
        services = await asyncio.wait_for(
            db.services.find(
                {"$or": [{"team": team_id}, {"team_id": team_id}]},
                {"_id": 0}
            ).sort("date", -1).to_list(100),
            timeout=2.0
        )
        
        if services:
            cache.set(cache_key, services, ttl=60)
            return services
    except Exception as e:
        print(f"Team services: using fallback ({e})")
    
    cache.set(cache_key, fallback, ttl=30)
    return fallback
