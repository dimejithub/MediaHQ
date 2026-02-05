# TEN MediaHQ - Product Requirements Document

## Original Problem Statement
Build "TEN MediaHQ," a platform for church media teams to manage people, equipment, schedules, and training. The church has two distinct teams ("Envoy Nation" and "E-Nation") and needs to segregate all data by team.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB Atlas (configured)
- **Authentication:** JWT with Google OAuth option, Demo Mode

---

## Mobile-First Design ✅
The app is fully responsive and optimized for mobile devices:
- Collapsible hamburger menu on mobile
- Responsive grid layouts (2-column on mobile, 4-column on desktop)
- Touch-friendly navigation and buttons
- Proper spacing and text sizes for small screens

---

## Role-Based Access Control ✅

| Role | Access Level | Notes |
|------|-------------|-------|
| **Director** | All modules including Director View | Full admin access |
| **Team Lead** | All modules except Director View | Can manage team |
| **Assistant Lead** | All modules except Director View | Can manage team |
| **Unit Head** | Limited modules + Calendar | Can input rotas, reports |
| **Member** | View-only + Calendar + Checklists if Weekly Lead | Gets checklist access when assigned as lead |

### Weekly Lead System
- Members automatically get **Checklists** access when assigned as the weekly lead
- This is dynamic based on rota assignment, not a permanent role

### Availability Calendar ✅
- **All team members** can access the calendar to plan availability
- Q1 (Jan-Mar) and Q2 (Apr-Jun) 2026 are available for planning
- Click once = Available (green), Click twice = Unavailable (red), Click three times = Clear
- "Mark All Sundays" button to quickly mark all Sundays as available
- Sundays are highlighted with blue rings
- Events (services) shown as blue dots on dates

---

## Envoy Nation Team (23 members) ✅
- **Director:** Dr. Adebowale Owoseni
- **Team Lead:** Adeola Hilton
- **Assistant Lead:** Oladimeji Tiamiyu
- **Unit Heads:** Michel Adimula, Bro Oluseye, Oladipupo Hilton
- **Members:** Peter Ndiparya, Jemima Eromon, Jasper Eromon, and 14 others

---

## Equipment Inventory ✅
| Equipment | Status |
|-----------|--------|
| PTZ Camera | Available |
| Panasonic Lumix DC-G9 #1 | Available |
| Panasonic Lumix DC-G9 #2 | Maintenance |
| Canon EOS 850D | FAULTY |
| BlackMagic Camera | Available |
| Mac Mini Pro | Available |

---

## Completed Features

### Core Features ✅
- [x] Authentication with Demo Mode + Role Switching
- [x] Mobile-responsive dashboard with KPI cards
- [x] Team Directory with Add/Edit/Delete + Unit filter
- [x] Services management (per-team)
- [x] Equipment inventory (per-team)
- [x] Rota assignment
- [x] Service checklists
- [x] Calendar view
- [x] In-app notifications
- [x] Director Dashboard
- [x] Role-based access control
- [x] Weekly lead dynamic permissions

### Mobile UI ✅
- [x] Hamburger menu navigation
- [x] Touch-friendly buttons and inputs
- [x] Responsive grids and layouts
- [x] Proper font sizes for readability

---

## Pending Tasks

### P1 - High Priority
- [ ] Twilio WhatsApp notifications (need WhatsApp-enabled number, Account SID, Auth Token)
- [ ] Google OAuth end-to-end testing with real credentials

### P2 - Medium Priority
- [ ] Backend refactoring - split server.py into separate modules (routes, models, business logic)

---

## Recently Completed (Feb 5, 2026)

### Team Directory Card Redesign ✅
- Fixed profile picture avatars being cut off/covered
- Removed overflow-hidden clipping issue
- 3-dot menu properly positioned in top-right corner
- Add/Edit modals include profile picture upload with camera icon
- Mobile-responsive layout with single column on small screens

### Equipment Handover System ✅
- Added **Inventory** and **Handovers** tabs to Equipment page
- **Inventory Tab**: Equipment grid with check out/check in functionality
- **Handovers Tab**: Shows transfer history with From→To flow, team badges, condition status
- **New Handover Modal**:
  - Equipment dropdown (filters to available items only)
  - Destination team selector
  - Receiving member dropdown (updates based on team)
  - Condition toggle buttons (Good/Fair/Needs Repair)
  - Condition notes textarea
- Backend endpoint: `POST /api/equipment/handover`, `GET /api/equipment/handovers`
- Demo mode uses hardcoded DEMO_HANDOVERS data for testing

---

## Key Files Reference
- `/app/frontend/src/pages/TeamDirectory.js` - Member cards with avatar fix
- `/app/frontend/src/pages/Equipment.js` - Equipment inventory + handovers tabs
- `/app/frontend/src/App.js` - Core routing, RBAC, mobile responsiveness
- `/app/backend/server.py` - FastAPI backend with all endpoints
