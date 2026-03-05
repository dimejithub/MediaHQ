# TEN MediaHQ - Supabase Migration Guide

## Overview
The app has been migrated to use Supabase for authentication and database.

## What's Changed
- **Authentication**: Email Magic Link + Google OAuth (via Supabase Auth)
- **Database**: Supabase PostgreSQL (instead of MongoDB)
- **Frontend**: Updated to use @supabase/supabase-js client

## Setup Steps (You Need to Complete)

### Step 1: Run Database Schema
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/uctjdklqxvjxnxmsrnav
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `/app/supabase_schema.sql` and paste it
5. Click **Run** to create all tables

### Step 2: Enable Email Auth
1. Go to **Authentication** → **Providers** 
2. **Email** should be enabled by default
3. Under **Email Templates**, customize the magic link email if desired

### Step 3: Enable Google OAuth
1. Go to **Authentication** → **Providers** → **Google**
2. Toggle it ON
3. You'll need:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console
4. Add these redirect URLs to your Google OAuth consent screen:
   - `https://uctjdklqxvjxnxmsrnav.supabase.co/auth/v1/callback`

### Step 4: Set Up Google OAuth (if not done)
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `https://uctjdklqxvjxnxmsrnav.supabase.co/auth/v1/callback`
7. Copy Client ID and Secret to Supabase

## Environment Variables

### Frontend (.env)
```
REACT_APP_SUPABASE_URL=https://uctjdklqxvjxnxmsrnav.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## File Structure
```
/app/frontend/
├── src/
│   ├── lib/
│   │   └── supabase.js      # Supabase client & helper functions
│   ├── pages/
│   │   ├── Login.js         # Email + Google login
│   │   ├── AuthCallback.js  # OAuth callback handler
│   │   └── ...
│   └── App.js               # Auth context with Supabase
└── .env                     # Supabase credentials
```

## Testing
1. Demo Mode: Works without database (uses mock data)
2. Email Login: Requires running the database schema
3. Google Login: Requires completing Step 3 & 4

## Next Steps After Setup
1. Run the database schema
2. Enable Google OAuth in Supabase
3. Add your team members to the database (or they can sign up)
4. Deploy to Cloudflare Pages

## Cloudflare Deployment
For frontend deployment to Cloudflare Pages:
1. Build command: `yarn build`
2. Output directory: `build`
3. Environment variables:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY
