# TEN MediaHQ - Cloudflare Pages Deployment Guide

## Architecture (Supabase)

```
┌─────────────────────────────────────┐
│         CLOUDFLARE PAGES            │
│  React Frontend (Static Site)       │
│  mediahq.pages.dev                  │
└──────────────┬──────────────────────┘
               │ Direct API calls
               ▼
┌─────────────────────────────────────┐
│           SUPABASE                  │
│  ┌────────────┐  ┌──────────────┐  │
│  │ PostgreSQL  │  │  Auth        │  │
│  │ Database    │  │  (Magic Link │  │
│  │             │  │  + Google)   │  │
│  └────────────┘  └──────────────┘  │
│  ┌────────────┐  ┌──────────────┐  │
│  │ Storage    │  │  Edge Funcs  │  │
│  └────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

> **No separate backend server needed.** The React app talks directly to Supabase.

---

## Cloudflare Pages Build Settings

| Setting | Value |
|---------|-------|
| **Framework preset** | None (or Create React App) |
| **Build command** | `cd frontend && yarn install && yarn build` |
| **Build output directory** | `frontend/build` |
| **Root directory** | `/` (default) |
| **Node.js version** | 18.17.1 (auto-detected from `.nvmrc`) |

### Environment Variables (Cloudflare Pages)

Set these in **Settings → Environment Variables**:

```
REACT_APP_SUPABASE_URL=https://uctjdklqxvjxnxmsrnav.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## IMPORTANT: Use `yarn`, not `npm`

The build command **must** use `yarn`:
```
cd frontend && yarn install && yarn build
```

**Why?** `react-scripts 5.0.1` has a known `ajv` dependency conflict that npm cannot resolve correctly. Yarn handles it fine. The `yarn.lock` file is committed to ensure consistent builds.

---

## Deployment Steps

1. **Save to GitHub** from the Emergent chat
2. Go to **Cloudflare Pages** → your project → **Settings** → **Builds & deployments**
3. Set build command to: `cd frontend && yarn install && yarn build`
4. Set build output to: `frontend/build`
5. Add the environment variables listed above
6. Trigger a new deployment

---

## Seed Data (After First Deploy)

After deploying, the database will be empty. Run the seed script:

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Paste the contents of `supabase_seed.sql`
4. Click **Run**

This populates: 23 team members, 5 services, 6 equipment items, sample rotas, attendance records, checklists, and notifications.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails with `ajv` error | Ensure build command uses `yarn`, not `npm` |
| Blank page after deploy | Check environment variables are set in Cloudflare |
| Auth redirect fails | Verify Supabase redirect URLs include your Cloudflare domain |
| "No rows" in app | Run `supabase_seed.sql` in Supabase SQL Editor |
