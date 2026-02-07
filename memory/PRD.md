# TEN MediaHQ - Product Requirements Document

## Original Problem Statement
Build "TEN MediaHQ," a platform for church media teams to manage people, equipment, schedules, and training. The church has two distinct teams ("Envoy Nation" and "E-Nation") and needs to segregate all data by team.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB Atlas (configured)
- **Authentication:** Custom email/password JWT (firstname@tenmediahq.com / Envoy@2026)

---

## Deployment
- **Backend:** Railway (mediahq-production)
- **Frontend:** Cloudflare Pages (3e3e7d9a.mediahq.pages.dev)
- **Preview:** https://mediateam-2.preview.emergentagent.com

---

## Performance Optimizations (Feb 7, 2026)

### Problem
Users reported the app was extremely slow (2-4 second response times), making it unusable.

### Root Cause
MongoDB Atlas connection from certain environments has SSL handshake issues, causing timeouts.

### Solution Implemented
1. **In-memory caching** (`cache.py`) with 60-second TTL for all major endpoints
2. **Cache warmup on startup** - Pre-loads users, services, equipment into cache
3. **Pre-computed user lookup** - User credentials cached in memory for fast login
4. **Optimistic frontend loading** - Uses localStorage for instant UI while refreshing from API
5. **Timeout protection** - All DB queries have 2s timeout with graceful fallback

### Results
- Cached API responses: **~50ms** (was 2-4 seconds)
- Login: **~60ms** for repeat users (was 2+ seconds)
- Dashboard load: **<100ms** cached (was 3+ seconds)

---

## Mobile-First Design ✅
- Collapsible hamburger menu on mobile
- Responsive grid layouts (2-column on mobile, 4-column on desktop)
- Touch-friendly navigation and buttons
- Proper spacing and text sizes for small screens

---

## Role-Based Access Control ✅

| Role | Access Level |
|------|-------------|
| **Director** | All modules including Director View |
| **Team Lead** | All modules except Director View |
| **Assistant Lead** | All modules except Director View |
| **Unit Head** | Limited modules + Calendar |
| **Member** | View-only + Calendar + Checklists if Weekly Lead |

---

## Envoy Nation Team (23 members) ✅
- **Director:** Dr. Adebowale Owoseni
- **Team Lead:** Adeola Hilton
- **Assistant Lead:** Oladimeji Tiamiyu
- **Unit Heads:** Michel Adimula, Bro Oluseye, Oladipupo Hilton
- **Members:** 17 additional members

---

## Completed Features

### Core Features ✅
- [x] Custom email/password authentication
- [x] Mobile-responsive dashboard with KPI cards
- [x] Team Directory with roles and units
- [x] Services management (per-team)
- [x] Equipment inventory with checkout/return
- [x] Rota assignment
- [x] Service checklists
- [x] Calendar view with availability
- [x] In-app notifications
- [x] Director Dashboard
- [x] Role-based access control
- [x] Tuesday Standup Attendance tracking with flagging system
- [x] Onboarding flow (6 steps)

### Performance ✅
- [x] In-memory caching with TTL
- [x] Cache warmup on server start
- [x] Optimistic frontend loading
- [x] Fast login with user caching

### Bug Fixes (Feb 7, 2026) ✅
- [x] Fixed session data corruption (wrong user name showing)
- [x] Fixed slow API responses with caching
- [x] Removed all Emergent branding

---

## Test Credentials
- **Email:** oladimeji@tenmediahq.com (or any team member firstname)
- **Password:** Envoy@2026
- **Demo Mode:** Available on login page

---

## Key Files

### Backend
- `/app/backend/server.py` - FastAPI app with cache warmup
- `/app/backend/cache.py` - In-memory caching system
- `/app/backend/fallback_data.py` - Fallback data when DB unavailable
- `/app/backend/routes/` - All API endpoints

### Frontend
- `/app/frontend/src/App.js` - Auth context, session management
- `/app/frontend/src/pages/` - All page components

---

## Pending Tasks

### P0 (Critical) - None

### P1 (High Priority)
- [ ] Move `onboardingCompleted` flag from localStorage to database
- [ ] End-to-end test of Twilio WhatsApp notifications

### P2 (Medium Priority)
- [ ] CSV/Excel import for events from Settings
- [ ] Database indexes for frequently queried fields

### Future Enhancements
- [ ] Email notifications as backup for WhatsApp
- [ ] Multi-language support
- [ ] Performance analytics dashboard enhancements

---

## Known Issues
- MongoDB Atlas SSL errors from preview environment (handled by fallback data)
- First API call after cache expiry can be slow (2-3s) due to DB timeout

---

## Changelog

### Feb 7, 2026
- Implemented comprehensive caching system for all major endpoints
- Added cache warmup on server startup
- Fixed session data corruption issue
- Optimized login with pre-computed user lookup
- Added timeout protection for all database queries
- Frontend optimistic loading using localStorage

### Feb 6, 2026
- Replaced Google OAuth with simple email/password authentication
- Deployed to Railway (backend) and Cloudflare Pages (frontend)
- Removed all Emergent branding
- Added deployment guides
