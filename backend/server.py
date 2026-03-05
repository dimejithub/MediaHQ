"""
TEN MediaHQ API Server

A church media team management platform with modular route architecture.
All endpoint logic is organized in /app/backend/routes/
"""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pathlib import Path
import logging
import asyncio
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def warmup_cache():
    """Pre-load frequently accessed data into cache on startup"""
    from cache import cache, dashboard_cache_key, users_cache_key, services_cache_key, equipment_cache_key, teams_cache_key
    from fallback_data import TEAM_MEMBERS, SERVICES, EQUIPMENT, TEAMS, get_dashboard_kpis
    from database import db
    
    logger.info("Warming up cache...")
    
    teams = ["envoy_nation", "e_nation"]
    
    for team in teams:
        try:
            # Try to load from DB with timeout
            users = await asyncio.wait_for(
                db.users.find(
                    {"$or": [{"teams": team}, {"primary_team": team}]},
                    {"_id": 0, "password_hash": 0}
                ).to_list(100),
                timeout=3.0
            )
            if users:
                cache.set(users_cache_key(team), users, ttl=120)
                logger.info(f"Cached {len(users)} users for {team} from DB")
            else:
                raise Exception("No users in DB")
        except Exception as e:
            # Use fallback data
            fallback = [m for m in TEAM_MEMBERS if team in m.get("teams", []) or m.get("primary_team") == team]
            cache.set(users_cache_key(team), fallback, ttl=120)
            logger.info(f"Cached {len(fallback)} users for {team} from fallback ({e})")
        
        try:
            services = await asyncio.wait_for(
                db.services.find(
                    {"$or": [{"team": team}, {"team_id": team}]},
                    {"_id": 0}
                ).sort("date", -1).to_list(100),
                timeout=3.0
            )
            if services:
                cache.set(services_cache_key(team), services, ttl=120)
                logger.info(f"Cached {len(services)} services for {team} from DB")
            else:
                raise Exception("No services in DB")
        except Exception as e:
            fallback = [s for s in SERVICES if s.get("team") == team or s.get("team_id") == team]
            cache.set(services_cache_key(team), fallback, ttl=120)
            logger.info(f"Cached {len(fallback)} services for {team} from fallback ({e})")
        
        try:
            equipment = await asyncio.wait_for(
                db.equipment.find(
                    {"$or": [{"team": team}, {"team_id": team}]},
                    {"_id": 0}
                ).to_list(100),
                timeout=3.0
            )
            if equipment:
                cache.set(equipment_cache_key(team), equipment, ttl=120)
                logger.info(f"Cached {len(equipment)} equipment for {team} from DB")
            else:
                raise Exception("No equipment in DB")
        except Exception as e:
            fallback = [e for e in EQUIPMENT if e.get("team") == team]
            cache.set(equipment_cache_key(team), fallback, ttl=120)
            logger.info(f"Cached {len(fallback)} equipment for {team} from fallback ({e})")
    
    # Cache teams
    cache.set(teams_cache_key(), TEAMS, ttl=300)
    
    # Cache dashboard KPIs
    cache.set(dashboard_cache_key("envoy_nation"), get_dashboard_kpis(), ttl=120)
    cache.set(dashboard_cache_key("e_nation"), get_dashboard_kpis(), ttl=120)
    
    logger.info("Cache warmup complete!")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup/shutdown events"""
    # Startup: warm up cache
    asyncio.create_task(warmup_cache())
    yield
    # Shutdown: cleanup if needed
    logger.info("Shutting down TEN MediaHQ API")

# Create FastAPI app with lifespan
app = FastAPI(
    title="TEN MediaHQ API",
    description="Church Media Team Management Platform",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS - support both development and production
cors_origins_env = os.environ.get("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    cors_origins = ["*"]
else:
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]

logger.info(f"CORS Origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include the modular API router
from routes import api_router
app.include_router(api_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TEN MediaHQ API",
        "docs": "/docs",
        "version": "2.0.0"
    }

logger.info("TEN MediaHQ API Server started with modular routes")
