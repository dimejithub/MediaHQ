# TEN MediaHQ - Product Requirements Document

## Overview
Church media team management platform for Envoy Nation (and future E-Nation/TCE team).

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Supabase Client
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Auth:** Email Magic Link + Google OAuth (via Supabase Auth)
- **Hosting:** Cloudflare Pages (frontend), Supabase (backend)
- **Notifications:** Twilio WhatsApp (via Supabase Edge Function)

## Teams
- **Envoy Nation** — Leicester Blessing (Thursdays), Sunday Service, Connected with PMO (last Thursday/month)
- **E-Nation (TCE)** — The Commissioned Envoy (data pending)

## Units
- Production, Photography, Projection & Livestream, Post-Production

## Roles
- director, team_lead, assistant_lead, unit_head, member

## Database Tables
profiles, services, equipment, attendance, rotas, notifications, checklists

---

## Completed Features
- [x] Supabase migration (auth + data)
- [x] Cloudflare deployment (yarn build, Node 20.19.0)
- [x] Email Magic Link + Google OAuth
- [x] Demo mode
- [x] Onboarding with roster merge (Option C)
- [x] Dashboard with real service types
- [x] Team Directory with unit/role/search filters
- [x] Services page (Sunday, Midweek, Special types)
- [x] Equipment inventory with add/checkout
- [x] Attendance tracking
- [x] Calendar view
- [x] Rotas management (My Rotas view)
- [x] **Assign Rotas page** (fixed: migrated from deprecated BACKEND_URL to Supabase client) — Feb 2026
- [x] **Checklists** (fixed: updated to 29 items in 5 sections matching docx) — Feb 2026
- [x] Notifications with real-time updates
- [x] Admin Panel (role + unit management)
- [x] Settings with phone number + WhatsApp config
- [x] Real-time subscriptions (profiles, services, equipment, notifications)
- [x] RLS policies (SELECT, INSERT, UPDATE, DELETE)
- [x] Real seed data (23 Envoy Nation members, 16 services, rotas, checklists)
- [x] Twilio WhatsApp Edge Function created
- [x] Custom favicon (TEN logo)
- [x] Updated for tenmediahq.com domain

## Deployment
- Build: `cd frontend && yarn install && yarn build`
- Node: 20.19.0, Yarn: 1.22.22 (via packageManager field)
- Must use yarn (npm has ajv dependency conflict)

---

## User Action Items
- [ ] Run `supabase_update_checklists.sql` in SQL Editor (updates checklist to 29 items)
- [ ] Run `supabase_rls_policies.sql` in SQL Editor
- [ ] Run `supabase_schema_updates.sql` in SQL Editor (adds phone column + enables realtime)
- [ ] Deploy Twilio Edge Function: `supabase functions deploy send-whatsapp`
- [ ] Set Twilio secrets: `supabase secrets set TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=xxx TWILIO_WHATSAPP_NUMBER=xxx`
- [ ] Share TCE team data for E-Nation seed
- [ ] Save to GitHub and redeploy to Cloudflare

## Upcoming Tasks
- [ ] Twilio Edge Function deployment guidance
- [ ] Custom domain setup (tenmediahq.com) with Cloudflare Pages
- [ ] TCE team data seeding

## Future/Backlog
- [ ] Activity log
- [ ] Google Calendar sync
- [ ] CSV/Excel import/export
- [ ] Profile photo uploads
- [ ] User notification preferences
