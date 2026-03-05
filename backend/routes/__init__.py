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
from .training import router as training_router
from .notifications import router as notifications_router
from .reports import router as reports_router
from .availability import router as availability_router
from .performance import router as performance_router
from .lead_rotation import router as lead_rotation_router
from .dashboard import router as dashboard_router
from .director import router as director_router
from .calendar import router as calendar_router
from .data_import import router as data_import_router
from .whatsapp import router as whatsapp_router

# Include all routers with tags for API documentation
api_router.include_router(auth_router, tags=["Authentication"])
api_router.include_router(users_router, tags=["Users"])
api_router.include_router(services_router, tags=["Services"])
api_router.include_router(rotas_router, tags=["Rotas"])
api_router.include_router(equipment_router, tags=["Equipment"])
api_router.include_router(attendance_router, tags=["Attendance"])
api_router.include_router(training_router, tags=["Training"])
api_router.include_router(notifications_router, tags=["Notifications"])
api_router.include_router(reports_router, tags=["Reports"])
api_router.include_router(availability_router, tags=["Availability"])
api_router.include_router(performance_router, tags=["Performance"])
api_router.include_router(lead_rotation_router, tags=["Lead Rotation"])
api_router.include_router(dashboard_router, tags=["Dashboard"])
api_router.include_router(director_router, tags=["Director"])
api_router.include_router(calendar_router, tags=["Calendar"])
api_router.include_router(data_import_router, tags=["Data Import/Export"])
api_router.include_router(whatsapp_router, tags=["WhatsApp"])
