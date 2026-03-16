# TEN MediaHQ - Product Requirements Document

## Overview
TEN MediaHQ is a comprehensive platform for church media teams to manage personnel, equipment, schedules, and training. Built for The Envoy Nation (Leicester, UK) with multi-team support for The Commissioned Envoy (TCE/E-Nation).

## Live URL
- **App:** https://app.tenmediahq.com
- **Repo:** github.com/dimejithub/MediaHQ

---

## Full Stack Architecture

| Layer | Technology | Provider |
|-------|-----------|----------|
| Frontend | React.js, Tailwind CSS, Framer Motion | Cloudflare Pages (CDN) |
| Database | PostgreSQL | Supabase Cloud |
| Auth | Email Magic Link + Google OAuth | Supabase Auth |
| Email | Custom SMTP (noreply@tenmediahq.com) | Resend |
| Storage | Profile photos, file uploads | Supabase Storage |
| Real-time | WebSocket subscriptions | Supabase Realtime |
| Notifications | WhatsApp messages | Twilio via Supabase Edge Functions |
| DNS/Domain | app.tenmediahq.com | Cloudflare |
| Code | Git repository | GitHub |

**Zero external server dependency. Fully serverless.**

---

## Teams
- **Envoy Nation** — Sunday Services (11:00), Leicester Blessing (Thursdays 18:30), Connected with PMO (last Thursday/month)
- **The Commissioned Envoy (E-Nation/TCE)** — Sunday afternoon (14:00) — *data pending*

## Units
- Production, Photography, Projection & Livestream, Post-Production

## Roles (RBAC)
- `director` — Full access, admin panel, director dashboard
- `team_lead` — Assign rotas, manage team, admin panel
- `assistant_lead` — Assign rotas, admin panel
- `unit_head` — Unit management
- `member` — View rotas, checklists, attendance

---

## Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | Team members (id, user_id, name, email, role, unit, skills, teams, profile_picture_url, onboarding_completed) |
| `services` | Events & services (title, date, time, type, venue, responsible_lead, unit, frequency, status, notes) |
| `equipment` | Inventory tracking (name, category, status, checked_out_by) |
| `attendance` | Tuesday standup attendance records |
| `rotas` | Service duty assignments (service_id, team_id, assignments JSONB) |
| `notifications` | In-app alerts (user_id, title, message, type, read) |
| `checklists` | Service checklists (service_id, items JSONB — 29 items, 5 sections) |
| `activity_logs` | Action tracking (action, details, user_id, created_at) |

---

## Completed Features

### Core
- [x] Supabase full migration (from FastAPI/MongoDB)
- [x] Cloudflare Pages deployment with `_redirects` SPA routing
- [x] Email Magic Link + Google OAuth authentication
- [x] Custom SMTP via Resend (branded emails from noreply@tenmediahq.com)
- [x] Demo mode (full app preview without login)
- [x] Animated 7-step onboarding with roster merge
- [x] Role-based access control (RBAC)
- [x] Real-time subscriptions (profiles, services, equipment, notifications)
- [x] Row Level Security (RLS) policies
- [x] Profile caching for instant page reload

### Pages & Features
- [x] **Dashboard** — Stats, upcoming services, recent activity log (mobile-friendly)
- [x] **Team Directory** — Search, filter by unit/role, CSV export, profile photos
- [x] **Services** — 58 events for 2026, type filters (Program/Training/Retreat/Outreach/etc), Google Calendar links, CSV export
- [x] **Equipment** — Inventory with add/checkout tracking
- [x] **My Rotas** — View personal duty assignments, CSV export
- [x] **Assign Rotas** — Create rotas, assign weekly lead + team members, auto-generate 29-item checklist
- [x] **Checklists** — 29 items across 5 sections (Pre-Service, Technical, Live Production, Equipment Handover, Debrief)
- [x] **Calendar** — Visual calendar view of all services
- [x] **Attendance** — Tuesday standup tracking, CSV export
- [x] **Notifications** — In-app alerts with real-time updates
- [x] **Director Dashboard** — Performance overview (director role only)
- [x] **Admin Panel** — Role/unit management
- [x] **Settings** — Profile editing, photo upload, phone number, WhatsApp config
- [x] **Rota Notifications** — Auto-creates in-app notifications + calls Twilio Edge Function on rota creation

### Data
- [x] 2026 Envoy Nation Program Calendar (58 events from CSV)
- [x] Real team data seeded (23 Envoy Nation members)
- [x] Service checklist from official Media Team Service Checklist doc
- [x] Profile deduplication SQL script

### Infrastructure
- [x] Auth callback with PKCE code exchange
- [x] Cloudflare `_redirects` for SPA routing
- [x] Dead code cleanup (removed all Emergent/BACKEND_URL references)
- [x] Custom favicon (TEN logo)
- [x] Supabase Storage bucket for profile photos

---

## SQL Scripts (run in Supabase SQL Editor)

| Script | Purpose | Status |
|--------|---------|--------|
| `supabase_schema.sql` | Database schema | ✅ Done |
| `supabase_seed.sql` | Initial team data | ✅ Done |
| `supabase_rls_policies.sql` | Row Level Security | ✅ Done |
| `supabase_update_checklists.sql` | 29-item checklist | ✅ Done |
| `supabase_activity_logs.sql` | Activity logs table | ✅ Done |
| Storage bucket SQL | Profile photos bucket | ✅ Done |
| `supabase_2026_calendar.sql` | 58 calendar events | ⬜ Pending |
| `supabase_dedup_profiles.sql` | Remove duplicate profiles | ⬜ Pending |

---

## Pending User Actions
- [ ] Run `supabase_2026_calendar.sql` in SQL Editor
- [ ] Run `supabase_dedup_profiles.sql` in SQL Editor
- [ ] Save to GitHub & redeploy to Cloudflare
- [ ] Deploy Twilio Edge Function (`supabase functions deploy send-whatsapp`)
- [ ] Set Twilio secrets in Supabase
- [ ] Verify Resend domain DNS records
- [ ] Provide TCE team calendar data

---

## Upcoming Tasks
- [ ] Twilio WhatsApp Edge Function deployment
- [ ] TCE team calendar & data seeding
- [ ] Onboarding improvements (per user feedback)
- [ ] CSV Import for bulk team member upload

## Future/Backlog
- [ ] Google Calendar full API sync
- [ ] Notification preferences (opt-in/out)
- [ ] Equipment maintenance scheduling
- [ ] Performance analytics dashboard

---

## Build & Deploy
```bash
cd frontend && yarn install && yarn build
```
- **Node:** 20.19.0
- **Package Manager:** Yarn 1.22.22
- **Output:** `frontend/build`
- **Must use yarn** (npm has ajv dependency conflict)
