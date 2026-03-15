# TEN MediaHQ - Product Requirements Document

## Overview
Church media team management platform for Envoy Nation (and future E-Nation/TCE team).

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, Supabase Client, Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Auth:** Email Magic Link + Google OAuth (via Supabase Auth)
- **Hosting:** Cloudflare Pages (frontend), Supabase (backend)
- **Notifications:** Twilio WhatsApp (via Supabase Edge Function)
- **Email:** Resend SMTP (custom sender: noreply@tenmediahq.com)

## Database Tables
profiles, services, equipment, attendance, rotas, notifications, checklists, activity_logs

## Completed Features
- [x] Supabase full migration
- [x] Cloudflare Pages deployment with _redirects SPA routing
- [x] Email Magic Link + Google OAuth + Custom SMTP (Resend)
- [x] Demo mode
- [x] Onboarding with roster merge
- [x] Dashboard with activity log
- [x] Team Directory with CSV export + profile photos
- [x] Services page with type filters + Google Calendar links
- [x] Equipment inventory
- [x] Attendance tracking with CSV export
- [x] Calendar view
- [x] Rotas (My Rotas + Assign Rotas)
- [x] Checklists (29 items, 5 sections)
- [x] Notifications with real-time
- [x] Admin Panel
- [x] Settings with profile photo upload
- [x] CSV Export on all pages
- [x] Rota WhatsApp notifications (Edge Function ready)
- [x] 2026 Envoy Nation Program Calendar (58 events)
- [x] Profile caching for fast page reload
- [x] Auth callback fix (PKCE + hash flow)
- [x] Dead code cleanup (removed BACKEND_URL references)
- [x] Profile deduplication SQL

## User Action Items
- [ ] Run `supabase_2026_calendar.sql` in SQL Editor (58 calendar events)
- [ ] Run `supabase_dedup_profiles.sql` in SQL Editor (remove duplicates)
- [ ] Deploy Twilio Edge Function
- [ ] Add TCE team calendar data (when ready)

## Upcoming Tasks
- [ ] Twilio WhatsApp deployment
- [ ] Custom domain setup (app.tenmediahq.com)
- [ ] TCE team data seeding
- [ ] Onboarding improvements (per user feedback)
