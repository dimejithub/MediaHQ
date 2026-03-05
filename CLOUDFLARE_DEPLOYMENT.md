# TEN MediaHQ - Cloudflare Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                               │
│  ┌─────────────────┐              ┌─────────────────────────┐   │
│  │ Cloudflare Pages│              │   Cloudflare DNS        │   │
│  │ (React Frontend)│              │   + SSL/TLS             │   │
│  │ mediahq.com     │              │   + DDoS Protection     │   │
│  └────────┬────────┘              └───────────┬─────────────┘   │
└───────────┼───────────────────────────────────┼─────────────────┘
            │                                   │
            │ API Calls                         │ Proxy
            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Railway / Render / Fly.io / DigitalOcean                   ││
│  │  ┌─────────────────┐    ┌─────────────────────────────────┐ ││
│  │  │ FastAPI Backend │───▶│ MongoDB Atlas                   │ ││
│  │  │ api.mediahq.com │    │ (Database)                      │ ││
│  │  └─────────────────┘    └─────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Services

| Component | Platform | Status |
|-----------|----------|--------|
| Frontend (React) | Cloudflare Pages | ✅ Deployed |
| Backend (FastAPI) | Railway | ✅ Deployed |
| Database | MongoDB Atlas | ✅ Connected |
| Auth | Google OAuth | ✅ Configured |
| Notifications | Twilio WhatsApp | ✅ Configured |

## Environment Variables

### Backend (Railway)
```
MONGO_URL=your-mongodb-atlas-url
DB_NAME=mediahq
JWT_SECRET=your-secure-secret
CORS_ORIGINS=https://your-frontend-url.pages.dev
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.up.railway.app/api/auth/google/callback
FRONTEND_URL=https://your-frontend-url.pages.dev
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### Frontend (Cloudflare Pages)
```
REACT_APP_BACKEND_URL=https://your-backend.up.railway.app
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select a project
3. Go to **APIs & Services** → **Credentials**
4. Create **OAuth 2.0 Client ID**
5. Add authorized redirect URI: `https://your-backend.up.railway.app/api/auth/google/callback`
6. Copy Client ID and Client Secret to Railway environment variables

## Custom Domain Setup

### Cloudflare Pages (Frontend)
1. Go to your Pages project → **Custom domains**
2. Add your domain
3. Cloudflare handles SSL automatically

### Railway (Backend API)
1. Go to your service → **Settings** → **Domains**
2. Add custom domain
3. Configure DNS CNAME record
