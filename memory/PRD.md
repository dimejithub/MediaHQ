# TEN MediaHQ - Product Requirements Document

## Overview
Church media team management platform for Envoy Nation and E-Nation teams.

## Tech Stack (Updated March 2026)
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

## Authentication Options
1. **Email Magic Link** - Any email (Gmail, Outlook, work email)
2. **Google OAuth** - Sign in with Google
3. **Demo Mode** - Try without account

---

## Database Schema
Tables created:
- `profiles` - User profiles (linked to Supabase Auth)
- `teams` - Team definitions
- `services` - Service schedules
- `equipment` - Equipment inventory
- `attendance` - Attendance records
- `rotas` - Duty assignments
- `notifications` - User notifications
- `checklists` - Service checklists

---

## Core Features ✅
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

---

## Setup Required
1. Run `/app/supabase_schema.sql` in Supabase SQL Editor
2. Enable Google OAuth in Supabase Authentication settings
3. Deploy frontend to Cloudflare Pages

See `/app/SUPABASE_SETUP.md` for detailed instructions.

---

## Changelog

### March 5, 2026 - Supabase Migration
- Migrated from MongoDB + FastAPI to Supabase
- Implemented Email Magic Link authentication
- Added Google OAuth support
- Created new database schema with RLS policies
- Updated frontend to use Supabase client
- Simplified architecture (no separate backend needed for most operations)

### Previous Updates
- Performance optimizations with caching
- Fixed session data issues
- Onboarding flow improvements
