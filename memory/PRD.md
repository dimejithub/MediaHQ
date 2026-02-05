# TEN MediaHQ - Product Requirements Document

## Original Problem Statement
Build "TEN MediaHQ," a platform for church media teams to manage people, equipment, schedules, and training. The church has two distinct teams ("Envoy Nation" and "E-Nation") and needs to segregate all data by team.

## Core Modules
1. Secure authentication + role-based access (JWT with Google OAuth option)
2. Admin dashboard with team-filtered KPIs
3. Team directory (per-team members)
4. Service scheduling (per-team)
5. Member portal ("My Rotas")
6. Equipment inventory (per-team)
7. Interactive service checklists (29 items auto-populate for weekly lead)
8. Training center (videos + external documents)
9. 52-week lead rotation planner
10. Performance metrics

## Multi-Team System
- Two teams: "Envoy Nation" and "E-Nation"
- Team selector in sidebar for switching context
- All data filtered by selected team
- Director role can see aggregated data from all teams

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Authentication:** JWT with Google OAuth option, Demo Mode

---

## Completed Features (as of Feb 5, 2026)

### Core Features ✅
- [x] Authentication system with Demo Mode
- [x] Dashboard with team-filtered KPIs
- [x] Team Directory (per-team members)
- [x] Services management (per-team)
- [x] Equipment inventory (per-team)
- [x] Rota assignment with 29 auto-populated checklist items
- [x] Service checklists
- [x] Service reports
- [x] 52-week lead rotation planner
- [x] Performance metrics page
- [x] Training center (videos + external documents)
- [x] Calendar view for historical data
- [x] In-app notifications system
- [x] Settings page with CSV import/export templates

### Multi-Team System ✅
- [x] Team selector dropdown in sidebar
- [x] Dashboard filters by selected team
- [x] Team Directory filters by selected team
- [x] Services page filters by selected team
- [x] Equipment page filters by selected team
- [x] Assign Rotas page filters by selected team
- [x] Calendar view with team filtering

### UI/UX ✅
- [x] Monochrome black gradient theme
- [x] Scrollable sidebar navigation
- [x] Responsive layout

---

## Pending / Future Tasks

### P1 - High Priority
- [ ] Equipment Handover frontend (backend ready at `/api/equipment/handover`)
- [ ] Director Dashboard aggregation (page exists, needs real data integration)
- [ ] End-to-end Google OAuth testing with real credentials

### P2 - Medium Priority
- [ ] Twilio WhatsApp notifications testing (backend code present, needs credentials)
- [ ] MongoDB configuration for user's own database on deployment

### P3 - Backlog
- [ ] Full end-to-end testing with real authentication
- [ ] Performance optimization
- [ ] Mobile responsiveness improvements

---

## Key API Endpoints
- `/api/teams` - CRUD for teams
- `/api/users/team/{team_id}` - Get users by team
- `/api/services?team={team_id}` - Services filtered by team
- `/api/equipment?team={team_id}` - Equipment filtered by team
- `/api/dashboard/kpis?team={team_id}` - Dashboard KPIs by team
- `/api/calendar/month/{year}/{month}` - Calendar events
- `/api/director/dashboard` - Aggregated director view

---

## Database Schema
- `users`: {email, password, name, roles, skills, team_id}
- `teams`: {name, description}
- `services`: {name, date, team_id}
- `rotas`: {service_id, user_id, role, team_id}
- `equipment`: {name, status, team_id}
- `notifications`: {user_id, message, read, team_id}
