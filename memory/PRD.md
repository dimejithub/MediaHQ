# TEN MediaHQ - Product Requirements Document

## Overview
Church media team management platform for Envoy Nation and E-Nation teams.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Supabase Client
- **Backend:** Supabase (Database + Auth + Storage)
- **Database:** Supabase PostgreSQL
- **Auth:** Email Magic Link + Google OAuth (via Supabase Auth)
- **Hosting:** Cloudflare Pages (frontend)

## Supabase Project
- **Project:** mediaHQ
- **URL:** https://uctjdklqxvjxnxmsrnav.supabase.co
- **Region:** eu-central-2

---

## Authentication
1. **Email Magic Link** - Any email
2. **Google OAuth** - Sign in with Google
3. **Demo Mode** - Try without account

---

## Database Tables
- `profiles` - User profiles (linked to Supabase Auth)
- `teams` - Team definitions
- `services` - Service schedules
- `equipment` - Equipment inventory
- `attendance` - Attendance records
- `rotas` - Duty assignments
- `notifications` - User notifications
- `checklists` - Service checklists

---

## Completed Features
- [x] Supabase migration (auth + data)
- [x] Email + Google authentication
- [x] Mobile-responsive dashboard
- [x] Team directory
- [x] Services management
- [x] Equipment inventory
- [x] Attendance tracking
- [x] Calendar view
- [x] Rotas management
- [x] Notifications
- [x] Onboarding flow
- [x] Demo mode
- [x] Cloudflare build fix (ajv dependency resolved via yarn)
- [x] Seed data script (supabase_seed.sql)
- [x] Deployment guide updated for Supabase architecture

---

## Deployment
- **Build command:** `cd frontend && yarn install && yarn build`
- **Output:** `frontend/build`
- **Node version:** 18.17.1 (via `.nvmrc`)
- **CRITICAL:** Must use `yarn`, not `npm` (ajv dependency conflict)

See `/app/CLOUDFLARE_DEPLOYMENT.md` for full guide.

---

## Pending Tasks

### P0 - User Action Required
- [ ] Update Cloudflare build command to use yarn
- [ ] Run `supabase_seed.sql` in Supabase SQL Editor

### P1 - Backend Logic & Security
- [ ] Enhance RLS policies for team-based data segregation
- [ ] Test all write operations with RLS enabled

### P2 - Testing & Polish
- [ ] End-to-end testing after deploy + seed
- [ ] Twilio WhatsApp notification testing

### Future
- [ ] Real-time updates via Supabase subscriptions
- [ ] Activity log
- [ ] User notification preferences
- [ ] Google Calendar sync
