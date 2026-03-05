from fastapi import APIRouter
from typing import Optional
import os

router = APIRouter()

# Shared database connection
from database import db

@router.get("/performance/metrics")
async def get_performance_metrics():
    """Get basic performance metrics for all members"""
    members = await db.users.find({}, {"_id": 0}).to_list(1000)
    rotas = await db.rotas.find({}, {"_id": 0}).to_list(1000)
    
    metrics = []
    for member in members:
        user_id = member["user_id"]
        total = 0
        confirmed = 0
        declined = 0
        
        for rota in rotas:
            for assignment in rota.get("assignments", []):
                if assignment.get("user_id") == user_id:
                    total += 1
                    if assignment.get("status") == "confirmed":
                        confirmed += 1
                    elif assignment.get("status") == "declined":
                        declined += 1
        
        attendance_rate = (confirmed / total * 100) if total > 0 else 0
        
        metrics.append({
            "user_id": user_id,
            "name": member.get("name"),
            "role": member.get("role"),
            "total_assignments": total,
            "confirmed": confirmed,
            "declined": declined,
            "pending": total - confirmed - declined,
            "attendance_rate": round(attendance_rate, 2)
        })
    
    return sorted(metrics, key=lambda x: x["attendance_rate"], reverse=True)

@router.get("/performance/detailed")
async def get_detailed_metrics():
    """Get detailed performance metrics including reliability scores"""
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
            for assignment in rota.get("assignments", []):
                if assignment.get("user_id") == user_id:
                    total_assignments += 1
                    if assignment.get("status") == "confirmed":
                        confirmed += 1
                    elif assignment.get("status") == "declined":
                        declined += 1
        
        # Attendance from reports
        attended_services = sum(1 for r in reports if user_id in r.get("attendees", []))
        
        # Calculate scores
        confirmation_rate = (confirmed / total_assignments * 100) if total_assignments > 0 else 0
        attendance_rate = (attended_services / len(reports) * 100) if len(reports) > 0 else 0
        reliability_score = (confirmation_rate * 0.6 + attendance_rate * 0.4) if total_assignments > 0 else 0
        
        metrics.append({
            "user_id": user_id,
            "name": member.get("name"),
            "role": member.get("role"),
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

@router.get("/performance/dashboard")
async def get_performance_dashboard():
    """Get performance dashboard stats"""
    total_services = await db.services.count_documents({})
    total_rotas = await db.rotas.count_documents({})
    total_reports = await db.service_reports.count_documents({})
    
    rotas = await db.rotas.find({}, {"_id": 0, "assignments": 1}).to_list(1000)
    total_assignments = 0
    confirmed = 0
    declined = 0
    pending = 0
    
    for rota in rotas:
        for a in rota.get("assignments", []):
            total_assignments += 1
            if a.get("status") == "confirmed":
                confirmed += 1
            elif a.get("status") == "declined":
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
            "confirmation_rate": round((confirmed / total_assignments * 100) if total_assignments > 0 else 0, 2)
        }
    }
