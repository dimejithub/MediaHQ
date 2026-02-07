# Routes package initialization
from fastapi import APIRouter

# Create main API router
api_router = APIRouter(prefix="/api")

# Import and include all route modules
from .auth import router as auth_router
from .users import router as users_router
from .services import router as services_router
from .rotas import router as rotas_router
from .equipment import router as equipment_router
from .attendance import router as attendance_router

api_router.include_router(auth_router, tags=["Authentication"])
api_router.include_router(users_router, tags=["Users"])
api_router.include_router(services_router, tags=["Services"])
api_router.include_router(rotas_router, tags=["Rotas"])
api_router.include_router(equipment_router, tags=["Equipment"])
api_router.include_router(attendance_router, tags=["Attendance"])
