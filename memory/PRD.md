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
- **Database:** MongoDB Atlas (configured)
- **Authentication:** JWT with Google OAuth option, Demo Mode

---

## Configuration (Updated Feb 5, 2026)

### MongoDB Atlas
- **URL:** `mongodb+srv://DimejitHub:***@mediahq-db.itsmjk9.mongodb.net/`
- **Database:** `mediahq`
- **Status:** ✅ Configured in `/app/backend/.env`

### Twilio WhatsApp (Pending)
- **Account SID:** AC82a07bd9fad004ebc7cdf022f660ef60
- **Auth Token:** Provided
- **WhatsApp Number:** Not yet available

---

## Completed Features (as of Feb 5, 2026)

### Core Features ✅
- [x] Authentication system with Demo Mode
- [x] Dashboard with team-filtered KPIs + animations
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
- [x] Director Dashboard with aggregated stats

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
- [x] Animations (fadeIn, fadeInUp, hover effects, glass morphism)
- [x] Floating icons, staggered animations, hover lift effects

---

## Pending / Future Tasks

### P1 - High Priority
- [ ] Equipment Handover frontend UI
- [ ] Google OAuth end-to-end testing
- [ ] Twilio WhatsApp setup (need WhatsApp-enabled number)

### P2 - Medium Priority
- [ ] Real data population via CSV import
- [ ] Production deployment configuration

### P3 - Backlog
- [ ] Mobile responsiveness improvements
- [ ] Advanced reporting/analytics

---

## Key API Endpoints
- `/api/teams` - CRUD for teams
- `/api/users/team/{team_id}` - Get users by team
- `/api/services?team={team_id}` - Services filtered by team
- `/api/equipment?team={team_id}` - Equipment filtered by team
- `/api/dashboard/kpis?team={team_id}` - Dashboard KPIs by team
- `/api/calendar/month/{year}/{month}` - Calendar events
- `/api/director/dashboard` - Aggregated director view
