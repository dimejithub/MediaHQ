# TEN MediaHQ - Product Requirements Document

## Overview
TEN MediaHQ is a comprehensive church media team management platform to help manage people, equipment, schedules, training, and performance in one centralized system.

## Core Modules (12 Total)
1. **Dashboard** - KPI overview with team members, services, equipment stats
2. **Team Directory** - Member profiles with skills tagging
3. **Services** - Schedule and manage church services
4. **Assign Rotas** - Create service rotas and assign weekly leads (auto-populates 29 checklist items)
5. **My Rotas** - Member portal for viewing and confirming assignments
6. **Lead Rotation** - 52-week lead rotation planner with Q1-Q4 quarters
7. **Equipment** - Inventory tracking with check-in/check-out
8. **Checklists** - 29-item service checklists for weekly leads
9. **Reports** - Service performance documentation (persisted to database)
10. **Performance** - Team reliability metrics and leaderboard
11. **Training** - Videos AND Materials (PDF/PPT/DOC) with external URL links
12. **Settings** - Data import/export with downloadable CSV templates

## Key Features Implemented

### Authentication
- Google OAuth login (via Emergent Auth)
- Demo Mode for testing without authentication (persists in localStorage)

### Assign Rotas Flow
- Select service from list
- Select weekly lead (admins/team leads only)
- Add team members with specific roles
- **29 checklist items auto-populate** when rota is created
- **In-app + WhatsApp notifications** sent to assigned members

### 52-Week Lead Rotation Planner
- Visual calendar organized by quarters (Q1-Q4)
- Assign/edit leads for each week
- Backup lead support
- Stats: Total weeks, assigned, unassigned, available leads

### Performance Metrics
- Team reliability leaderboard
- Confirmation rate tracking
- Attendance rate tracking
- Reliability score calculation (60% confirmation + 40% attendance)
- Summary dashboard: services, rotas, reports, assignments

### Training Center
- **Videos tab**: YouTube embedded training videos
- **Materials tab**: PDF, PPT, DOC support via external URLs (Google Drive, etc.)
- Add/delete materials (admin only)
- Category filtering

### CSV Import/Export
- **Downloadable templates** showing required columns:
  - Team Members: name, email, role, phone, skills
  - Services: title, date, time, type, description
  - Equipment: name, category, status, notes
- CSV preview before import
- Export all data types

### Notifications
- **In-app notifications**: Bell icon with unread count, notification dropdown
- **WhatsApp notifications**: Via Twilio WhatsApp Business API (requires credentials)
- Notifications triggered on rota assignment

## Technical Stack
- **Frontend**: React.js, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: Emergent-managed Google OAuth + Demo Mode
- **Notifications**: Twilio WhatsApp API (optional)

## UI Theme
Sophisticated monochrome black gradient - dark slate (slate-950/slate-900) with white accents

## API Endpoints

### Authentication
- `POST /api/auth/session` - Create session from Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Core Data
- `/api/dashboard/kpis` - Dashboard metrics
- `/api/team/members` - Team CRUD
- `/api/services` - Services CRUD
- `/api/rotas` - Rotas CRUD
- `/api/equipment` - Equipment CRUD
- `/api/checklists` - Checklists CRUD

### New Endpoints
- `/api/reports` - Service reports CRUD (persisted)
- `/api/training/materials` - Training materials CRUD
- `/api/lead-rotation/year/{year}` - Get 52-week rotation
- `/api/lead-rotation/bulk` - Bulk assign rotations
- `/api/performance/detailed` - Detailed reliability metrics
- `/api/performance/dashboard` - Performance dashboard stats
- `/api/availability` - Member availability calendar
- `/api/notifications` - In-app notifications
- `/api/notifications/unread-count` - Unread count
- `/api/whatsapp/notify-rota` - Send WhatsApp notifications
- `/api/data/template/{collection}` - Download CSV templates
- `/api/data/import-csv` - Import CSV data

## What's Working ✅
- All 12 navigation modules accessible
- Demo mode with mock data (persists across pages)
- Dashboard with KPIs
- Assign Rotas with 29 auto-populated checklist items
- Service checklists with progress tracking
- Equipment management (add/delete/checkout)
- Team directory with skills
- 52-week lead rotation planner (Q1-Q4)
- Performance metrics with reliability leaderboard
- Training center with Videos and Materials tabs
- CSV import with downloadable templates
- In-app notifications with bell icon
- WhatsApp notification backend (requires Twilio credentials)
- Consistent dark theme across all pages
- Responsive sidebar navigation

## Demo Mode Features
- Click "Try Demo Mode" on login page
- Mock data includes:
  - 12 team members, 8 services, 25 equipment items
  - Sample rotas and assignments
  - Sample notifications
  - 12-week rotation schedule

## Production Requirements
To use real data and WhatsApp notifications:
1. Google OAuth - Already configured via Emergent Auth
2. Twilio WhatsApp - Add to backend/.env:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`

## Future Enhancements
- Email notifications (SendGrid integration)
- Member availability calendar UI
- Bulk member phone number collection
- Report analytics and trends
