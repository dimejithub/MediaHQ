# TEN MediaHQ - Product Requirements Document

## Overview
Church media team management platform for Envoy Nation and E-Nation teams.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB Atlas
- **Auth:** Simple email/password (firstname@tenmediahq.com / Envoy@2026)

## Deployment
- **Preview:** https://mediateam-2.preview.emergentagent.com
- **Production Backend:** Railway
- **Production Frontend:** Cloudflare Pages

---

## Core Features ✅

### Authentication
- Simple email/password login
- 23 team members pre-configured
- Session stored in localStorage

### Onboarding
- 6-step welcome flow for first-time users
- Team selection
- Stored in localStorage - shows only once per browser
- Skip option available

### Dashboard
- Personalized greeting with user's name
- KPI cards: Members, Services, Equipment, Pending
- Upcoming services list
- Quick action buttons

### Team Management
- Team directory with roles
- Profile pictures
- Contact information

### Services
- Service scheduling
- Multiple service types (Sunday, Midweek, Standup)
- Per-team filtering

### Equipment
- Inventory tracking
- Check-out/return system
- Status tracking

### Attendance
- Tuesday standup attendance tracking
- Member attendance rates
- Flagging system for absences

### Calendar
- Service calendar view
- Availability management

### Rotas
- Assignment management
- Lead rotation

---

## Test Credentials
- **Email:** oladimeji@tenmediahq.com (or any team member's first name)
- **Password:** Envoy@2026

---

## Performance
- In-memory caching (60s TTL)
- Cache warmup on server start
- Fast API responses (~50ms cached)

---

## WhatsApp Integration
- Twilio configured and working
- Account: TEN MediaHQ
- Ready for notifications

---

## Pending Tasks

### P1 (High Priority)
- E-Nation team member data (need names from client)
- End-to-end WhatsApp notification test

### P2 (Medium Priority)
- CSV/Excel import for events
- Database-backed onboarding status (currently localStorage)

---

## Changelog

### March 5, 2026
- Simplified onboarding flow - removed complex server checks
- Fixed: Returning users now skip onboarding and go directly to dashboard
- Fixed: First-time users see onboarding correctly

### Feb 7, 2026
- Performance optimizations with caching
- Fixed session data corruption
- Simplified auth system

### Feb 6, 2026
- Deployed to Railway + Cloudflare
- Replaced Google OAuth with email/password
- Removed Emergent branding
