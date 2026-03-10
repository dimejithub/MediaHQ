# TEN MediaHQ - Product Requirements Document

## Overview
Church media team management platform for Envoy Nation (and future E-Nation/TCE team).

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Supabase Client, Framer Motion
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
profiles, services, equipment, attendance, rotas, notifications, checklists, activity_logs

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
- [x] Assign Rotas page (Supabase client) — Feb 2026
- [x] Checklists (29 items, 5 sections from docx) — Feb 2026
- [x] Notifications with real-time updates
- [x] Admin Panel (role + unit management)
- [x] Settings with phone number + WhatsApp config
- [x] Real-time subscriptions (profiles, services, equipment, notifications)
- [x] RLS policies (SELECT, INSERT, UPDATE, DELETE)
- [x] Real seed data (23 Envoy Nation members, 16 services, rotas, checklists)
- [x] Twilio WhatsApp Edge Function created
- [x] Custom favicon (TEN logo)
- [x] **Rota WhatsApp Notifications** — Auto-creates in-app notifications + calls Twilio Edge Function — Feb 2026
- [x] **Activity Log** — Dashboard shows recent activity (rota created, checklist completed, attendance, etc.) — Feb 2026
- [x] **Google Calendar Integration** — "Add to Calendar" button on each service — Feb 2026
- [x] **CSV Export** — Export buttons on Team Directory, Services, Attendance, Rotas pages — Feb 2026
- [x] **Profile Photo Uploads** — Upload via Supabase Storage on Settings page, display in Team Directory — Feb 2026

## Deployment
- Build: `cd frontend && yarn install && yarn build`
- Node: 20.19.0, Yarn: 1.22.22 (via packageManager field)
- Must use yarn (npm has ajv dependency conflict)

---

## User Action Items
- [ ] Run `supabase_update_checklists.sql` in SQL Editor (updates checklist to 29 items)
- [ ] Run `supabase_activity_logs.sql` in SQL Editor (creates activity_logs table)
- [ ] Set up Supabase Storage bucket (see STORAGE_SETUP.md)
- [ ] Run `supabase_rls_policies.sql` in SQL Editor
- [ ] Deploy Twilio Edge Function: `supabase functions deploy send-whatsapp`
- [ ] Set Twilio secrets: `supabase secrets set TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=xxx TWILIO_WHATSAPP_NUMBER=xxx`
- [ ] Share TCE team data for E-Nation seed
- [ ] Save to GitHub and redeploy to Cloudflare

## Upcoming Tasks
- [ ] Deploy to Cloudflare (Save to GitHub → redeploy)
- [ ] Twilio Edge Function deployment
- [ ] Custom domain setup (tenmediahq.com) with Cloudflare Pages
- [ ] TCE team data seeding

## Future/Backlog
- [ ] CSV Import (upload team members via CSV)
- [ ] Google Calendar full API sync
- [ ] Notification user preferences persistence
