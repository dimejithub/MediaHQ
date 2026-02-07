"""
TEN MediaHQ API Server

A church media team management platform with modular route architecture.
All endpoint logic is organized in /app/backend/routes/
"""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create FastAPI app
app = FastAPI(
    title="TEN MediaHQ API",
    description="Church Media Team Management Platform",
    version="2.0.0"
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
