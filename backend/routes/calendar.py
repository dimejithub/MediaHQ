from fastapi import APIRouter
from typing import Optional
from datetime import datetime, timezone
import calendar
import os

router = APIRouter()

# Shared database connection
from database import db

@router.get("/calendar")
async def get_calendar_data(team: Optional[str] = None, month: Optional[int] = None, year: Optional[int] = None):
    """Get calendar data including services and availability"""
    # Default to current month/year
    now = datetime.now(timezone.utc)
    year = year or now.year
    month = month or now.month
    
    # Build date range
    _, last_day = calendar.monthrange(year, month)
    start_date = f"{year}-{month:02d}-01"
    end_date = f"{year}-{month:02d}-{last_day}"
    
    # Query services
    service_query = {"date": {"$gte": start_date, "$lte": end_date}}
    if team:
        service_query["$or"] = [{"team": team}, {"team_id": team}, {"is_combined": True}]
    
    services = await db.services.find(service_query, {"_id": 0}).sort("date", 1).to_list(100)
    
    # Query availability
    avail_query = {"date": {"$gte": start_date, "$lte": end_date}}
    availability = await db.member_availability.find(avail_query, {"_id": 0}).to_list(10000)
    
    # Query rotas for this period
    service_ids = [s["service_id"] for s in services]
    rotas = await db.rotas.find(
        {"service_id": {"$in": service_ids}},
        {"_id": 0}
    ).to_list(100)
    
    # Build calendar events
    events = []
    for svc in services:
        rota = next((r for r in rotas if r["service_id"] == svc["service_id"]), None)
        events.append({
            "id": svc["service_id"],
            "title": svc["title"],
            "date": svc["date"],
            "time": svc.get("time"),
            "type": svc.get("type"),
            "has_rota": rota is not None,
            "assignment_count": len(rota.get("assignments", [])) if rota else 0
        })
    
    # Group availability by date
    avail_by_date = {}
    for a in availability:
        date = a["date"]
        if date not in avail_by_date:
            avail_by_date[date] = {"available": [], "unavailable": [], "tentative": []}
        status = a.get("status", "available")
        if status in avail_by_date[date]:
            avail_by_date[date][status].append(a["user_id"])
    
    return {
        "year": year,
        "month": month,
        "events": events,
        "availability": avail_by_date,
        "total_services": len(services)
    }

@router.get("/calendar/month/{year}/{month}")
async def get_month_calendar(year: int, month: int, team: Optional[str] = None):
    """Get calendar data for a specific month"""
    return await get_calendar_data(team=team, month=month, year=year)

@router.get("/calendar/user/{user_id}")
async def get_user_calendar(user_id: str, month: Optional[int] = None, year: Optional[int] = None):
    """Get calendar data for a specific user"""
    now = datetime.now(timezone.utc)
    year = year or now.year
    month = month or now.month
    
    _, last_day = calendar.monthrange(year, month)
    start_date = f"{year}-{month:02d}-01"
    end_date = f"{year}-{month:02d}-{last_day}"
    
    # Get user's rotas
    rotas = await db.rotas.find(
        {"assignments.user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    # Get services for those rotas
    service_ids = [r["service_id"] for r in rotas]
    services = await db.services.find(
        {
            "service_id": {"$in": service_ids},
            "date": {"$gte": start_date, "$lte": end_date}
        },
        {"_id": 0}
    ).to_list(100)
    
    # Get user's availability
    availability = await db.member_availability.find(
        {"user_id": user_id, "date": {"$gte": start_date, "$lte": end_date}},
        {"_id": 0}
    ).to_list(100)
    
    # Build response
    assignments = []
    for svc in services:
        rota = next((r for r in rotas if r["service_id"] == svc["service_id"]), None)
        if rota:
            user_assignment = next((a for a in rota["assignments"] if a["user_id"] == user_id), None)
            if user_assignment:
                assignments.append({
                    "service": svc,
                    "assignment": user_assignment
                })
    
    return {
        "year": year,
        "month": month,
        "assignments": assignments,
        "availability": availability,
        "total_assignments": len(assignments)
    }
