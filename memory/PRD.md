# TEN MediaHQ - Product Requirements Document

## Original Problem Statement
Build "TEN MediaHQ," a platform for church media teams to manage people, equipment, schedules, and training. The church has two distinct teams ("Envoy Nation" and "E-Nation") and needs to segregate all data by team.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB Atlas (configured)
- **Authentication:** JWT with Google OAuth option, Demo Mode

---

## Configuration (Updated Feb 5, 2026)

### MongoDB Atlas ✅
- **Database:** `mediahq`
- **Status:** Configured in `/app/backend/.env`

### Twilio WhatsApp (Pending)
- **Account SID:** AC82a07bd9fad004ebc7cdf022f660ef60
- **Auth Token:** Provided
- **WhatsApp Number:** Not yet available

---

## Role-Based Access Control ✅

| Role | Access Level |
|------|-------------|
| **Director** | All modules including Director View |
| **Team Lead** | All modules except Director View |
| **Assistant Lead** | All modules except Director View |
| **Unit Head** | Dashboard, Team, Services, Assign Rotas, My Rotas, Equipment, Checklists, Reports, Training |
| **Weekly Lead** | Dashboard, My Rotas, Checklists, Training |
| **Member** | Dashboard, Team, My Rotas, Training, Performance, Reports |

---

## Envoy Nation Team (23 members) ✅
- **Director:** Dr. Adebowale Owoseni
- **Team Lead:** Adeola Hilton
- **Assistant Lead:** Oladimeji Tiamiyu
- **Unit Heads:** Michel Adimula (Production), Bro Oluseye (Projection & Livestream), Oladipupo Hilton (Photography)
- **Members:** Peter Ndiparya, Jemima Eromon, Jasper Eromon, Seun Morenikeji, Chase Hadley, Olukunle Ogunniran, Wade Osunmakinde, Bro Tobi, Onose Thompson, Precious Achudume, Oladeinde Omidiji, Abiodun Durojaiye, Temidayo Peters, Favour Olusanya, Favour Anwo, Damilare Akeredolu, Adeleke Matanmi

---

## Equipment Inventory ✅
| Equipment | Status |
|-----------|--------|
| PTZ Camera | Available |
| Panasonic Lumix DC-G9 #1 | Available |
| Panasonic Lumix DC-G9 #2 | Maintenance (needs repair) |
| Canon EOS 850D | Maintenance (FAULTY) |
| BlackMagic Camera | Available |
| Mac Mini Pro | Available |

---

## Completed Features

### Core Features ✅
- [x] Authentication with Demo Mode + Role Switching
- [x] Dashboard with team-filtered KPIs + animations
- [x] Team Directory with Add/Edit/Delete members
- [x] Filter by Unit functionality
- [x] Services management (per-team)
- [x] Equipment inventory (per-team)
- [x] Rota assignment
- [x] Service checklists
- [x] Service reports
- [x] 52-week lead rotation planner
- [x] Performance metrics page
- [x] Training center
- [x] Calendar view
- [x] In-app notifications
- [x] Director Dashboard
- [x] Role-based access control

### UI/UX ✅
- [x] Animations (fadeIn, hover effects, glass morphism)
- [x] Role selector in demo mode
- [x] Scrollable sidebar navigation

---

## Pending Tasks

### P1 - High Priority
- [ ] Twilio WhatsApp setup (need WhatsApp-enabled number)
- [ ] Google OAuth end-to-end testing

### P2 - Medium Priority
- [ ] Equipment Handover UI
- [ ] Real data import via CSV
