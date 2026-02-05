# TEN MediaHQ - Product Requirements Document

## Overview
TEN MediaHQ is a lightweight, production-ready platform to help church media teams manage people, equipment, schedules, and training in one centralized system.

## Core Modules (10 Total)
1. **Dashboard** - KPI overview with team members, services, equipment stats
2. **Team Directory** - Member profiles with skills tagging
3. **Services** - Schedule and manage church services
4. **Assign Rotas** - Create service rotas and assign weekly leads
5. **My Rotas** - Member portal for viewing and confirming assignments
6. **Equipment** - Inventory tracking with check-in/check-out
7. **Checklists** - 29-item service checklists for weekly leads
8. **Reports** - Service performance documentation
9. **Training** - YouTube-embedded training videos
10. **Settings** - Data import/export functionality

## Key Features Implemented

### Authentication
- Google OAuth login (via Emergent Auth)
- Demo Mode for testing without authentication
- Session persistence via localStorage

### Assign Rotas Flow
- Select service from list
- Select weekly lead (admins/team leads only)
- Add team members with specific roles
- Auto-populate 29 checklist items when rota is created

### 29 Checklist Items (Auto-populated)
Pre-Service Setup, Camera Setup, Audio Setup, Technical Run-Through, Live Production, and Post-Service items automatically assigned to weekly lead.

### Equipment Management
- View equipment with status badges (available, checked_out, maintenance)
- Admin can add/delete equipment
- Check-in/check-out functionality

## Technical Stack
- **Frontend**: React.js, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Emergent-managed Google OAuth + Demo Mode

## UI Theme
Sophisticated monochrome black gradient - dark slate (slate-950/slate-900) with white accents

## API Endpoints
- `/api/auth/session` - Create session from Google OAuth
- `/api/auth/me` - Get current user
- `/api/auth/logout` - Logout user
- `/api/dashboard/kpis` - Dashboard metrics
- `/api/team/members` - Team CRUD
- `/api/services` - Services CRUD
- `/api/rotas` - Rotas CRUD
- `/api/equipment` - Equipment CRUD
- `/api/checklists` - Checklists CRUD
- `/api/training/videos` - Training videos
- `/api/data/export` - CSV export

## What's Working
- ✅ All 10 navigation modules accessible
- ✅ Demo mode with mock data
- ✅ Dashboard with KPIs
- ✅ Assign Rotas with 29 auto-populated checklist items
- ✅ Service checklists with progress tracking
- ✅ Equipment management (add/delete/checkout)
- ✅ Team directory with skills
- ✅ Consistent dark theme across all pages
- ✅ Responsive sidebar navigation

## Demo Mode
Click "Try Demo Mode" on login page to access all features without authentication. Demo data includes:
- 12 team members
- 8 services
- 25 equipment items
- Sample rotas and assignments

## Known Limitations
- Real-time data requires Google authentication (demo mode uses mock data)
- Excel import not yet implemented
- 52-week lead rotation planner pending

## Future Enhancements
- Excel/CSV data import
- 52-week lead rotation planner
- Performance metrics and reliability tracking
- Service report persistence to database
