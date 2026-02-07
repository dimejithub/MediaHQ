from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
import os

router = APIRouter()

from motor.motor_asyncio import AsyncIOMotorClient
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("/director/dashboard")
async def get_director_dashboard():
    """Get director's overview dashboard data"""
    teams = ["envoy_nation", "e_nation"]
    summaries = []
    
    for team_id in teams:
        team_query = {"$or": [{"team": team_id}, {"team_id": team_id}, {"primary_team": team_id}]}
        
        member_count = await db.users.count_documents({"$or": [{"teams": team_id}, {"primary_team": team_id}]})
        service_count = await db.services.count_documents(team_query)
        rota_count = await db.rotas.count_documents({"team": team_id})
        report_count = await db.service_reports.count_documents({})
        
        # Calculate average reliability
        members = await db.users.find({"$or": [{"teams": team_id}, {"primary_team": team_id}]}, {"_id": 0, "user_id": 1}).to_list(100)
        rotas = await db.rotas.find({"team": team_id}, {"_id": 0, "assignments": 1}).to_list(1000)
        
        total_reliability = 0
        member_with_stats = 0
        
        for member in members:
            user_id = member["user_id"]
            total = 0
            confirmed = 0
            
            for rota in rotas:
                for a in rota.get("assignments", []):
                    if a.get("user_id") == user_id:
                        total += 1
                        if a.get("status") == "confirmed":
                            confirmed += 1
            
            if total > 0:
                total_reliability += (confirmed / total * 100)
                member_with_stats += 1
        
        avg_reliability = total_reliability / member_with_stats if member_with_stats > 0 else 0
        
        # Count upcoming services (next 30 days)
        today = datetime.now(timezone.utc)
        future_date = (today + timedelta(days=30)).strftime("%Y-%m-%d")
        today_str = today.strftime("%Y-%m-%d")
        
        upcoming = await db.services.count_documents({
            **team_query,
            "date": {"$gte": today_str, "$lte": future_date}
        })
        
        summaries.append({
            "team": team_id,
            "team_name": "Envoy Nation" if team_id == "envoy_nation" else "E-Nation",
            "total_members": member_count,
            "total_services": service_count,
            "total_rotas": rota_count,
            "total_reports": report_count,
            "avg_reliability": round(avg_reliability, 2),
            "upcoming_services": upcoming
        })
    
    # Get top performers across all teams
    all_members = await db.users.find({}, {"_id": 0, "user_id": 1, "name": 1, "role": 1}).to_list(100)
    all_rotas = await db.rotas.find({}, {"_id": 0, "assignments": 1}).to_list(1000)
    
    performers = []
    for member in all_members:
        user_id = member["user_id"]
        total = 0
        confirmed = 0
        
        for rota in all_rotas:
            for a in rota.get("assignments", []):
                if a.get("user_id") == user_id:
                    total += 1
                    if a.get("status") == "confirmed":
                        confirmed += 1
        
        if total >= 3:  # Only include members with at least 3 assignments
            reliability = (confirmed / total * 100)
            performers.append({
                "user_id": user_id,
                "name": member.get("name"),
                "role": member.get("role"),
                "total_assignments": total,
                "confirmed": confirmed,
                "reliability_score": round(reliability, 2)
            })
    
    # Sort by reliability and take top 10
    top_performers = sorted(performers, key=lambda x: x["reliability_score"], reverse=True)[:10]
    
    # Get flagged members (low reliability)
    flagged = [p for p in performers if p["reliability_score"] < 60][:5]
    
    # Recent activity
    recent_services = await db.services.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_reports = await db.service_reports.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "team_summaries": summaries,
        "top_performers": top_performers,
        "flagged_members": flagged,
        "recent_services": recent_services,
        "recent_reports": recent_reports,
        "total_members": sum(s["total_members"] for s in summaries),
        "total_services": sum(s["total_services"] for s in summaries)
    }
