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

## Why Split Deployment?

Cloudflare Pages is optimized for static sites (React, Vue, etc.). Your FastAPI backend needs a server that supports Python. The recommended approach:

| Component | Platform | Why |
|-----------|----------|-----|
| Frontend (React) | Cloudflare Pages | Free, fast CDN, automatic deployments |
| Backend (FastAPI) | Railway / Render / Fly.io | Python support, easy scaling |
| Database | MongoDB Atlas | Already configured, managed service |
| Auth | Emergent Google OAuth | Already integrated |
| Notifications | Twilio | Already configured |

---

## Part 1: Backend Deployment (Do This First)

### Option A: Railway (Recommended - Easiest)

1. **Sign up at [railway.app](https://railway.app)**

2. **Connect your GitHub repo** or use Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

3. **Create a new project** and select "Deploy from GitHub"

4. **Configure the backend service:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables** in Railway Dashboard:
   ```
   MONGO_URL=mongodb+srv://DimejitHub:Proj3ct%402026@mediahq-db.itsmjk9.mongodb.net/?appName=MediaHQ-DB
   DB_NAME=mediahq
   JWT_SECRET=your-super-secure-random-string-here
   TWILIO_ACCOUNT_SID=AC82a07bd9...
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_WHATSAPP_NUMBER=+18886016703
   EMERGENT_AUTH_URL=https://auth.emergentagent.com
   ```

6. **Get your backend URL** (e.g., `https://ten-mediahq-backend.up.railway.app`)

### Option B: Render

1. **Sign up at [render.com](https://render.com)**

2. **Create a New Web Service:**
   - Connect GitHub repo
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables** (same as Railway)

4. **Get your backend URL** (e.g., `https://ten-mediahq-api.onrender.com`)

### Option C: Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```

2. **Create `fly.toml` in `/backend`:**
   ```toml
   app = "ten-mediahq-api"
   primary_region = "lhr"  # London

   [build]
     builder = "paketobuildpacks/builder:base"

   [env]
     PORT = "8080"

   [http_service]
     internal_port = 8080
     force_https = true

   [[services]]
     internal_port = 8080
     protocol = "tcp"

     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

3. **Deploy:**
   ```bash
   cd backend
   fly launch
   fly secrets set MONGO_URL="your-mongo-url" DB_NAME="mediahq" JWT_SECRET="your-secret"
   fly deploy
   ```

---

## Part 2: Frontend Deployment (Cloudflare Pages)

### Step 1: Prepare Frontend for Production

1. **Update the API URL in your frontend:**

   Create/update `/frontend/.env.production`:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.up.railway.app
   ```

2. **Build Configuration:**
   - Framework: Create React App
   - Build Command: `yarn build`
   - Build Output Directory: `build`
   - Root Directory: `frontend`

### Step 2: Deploy to Cloudflare Pages

1. **Go to [dash.cloudflare.com](https://dash.cloudflare.com)**

2. **Navigate to Pages → Create a project**

3. **Connect to Git:**
   - Select your GitHub/GitLab repository
   - Select the branch to deploy (usually `main`)

4. **Configure Build Settings:**
   ```
   Framework preset: Create React App
   Build command: yarn build
   Build output directory: build
   Root directory: frontend
   ```

5. **Add Environment Variables:**
   ```
   REACT_APP_BACKEND_URL = https://your-backend-url.up.railway.app
   ```

6. **Deploy!**

### Step 3: Custom Domain (Optional)

1. In Cloudflare Pages, go to **Custom Domains**
2. Add your domain (e.g., `mediahq.yourdomain.com`)
3. Cloudflare will automatically configure DNS and SSL

---

## Part 3: MongoDB Atlas Configuration

### Whitelist Backend Server IP

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. For Railway/Render/Fly.io, add `0.0.0.0/0` (Allow from anywhere)
   - Or get the specific IP range from your backend provider

### Verify Connection String

Ensure your `MONGO_URL` includes:
- Username and password (URL encoded)
- Cluster address
- `retryWrites=true&w=majority` options

```
mongodb+srv://username:password@cluster.mongodb.net/mediahq?retryWrites=true&w=majority
```

---

## Part 4: Post-Deployment Configuration

### Update Emergent Google OAuth

If using Emergent-managed Google OAuth, contact Emergent support to:
1. Add your production domain to allowed redirect URIs
2. Update callback URLs

### Update Twilio WhatsApp

1. Go to Twilio Console → Messaging → Settings
2. Add your production domain to allowed URLs
3. Test the WhatsApp sandbox with your new backend URL

---

## Part 5: Infrastructure Checklist

### Required Services (Already Set Up)
- [x] MongoDB Atlas - Database
- [x] Twilio - WhatsApp notifications
- [x] Emergent Auth - Google OAuth

### Recommended Additional Services

| Service | Purpose | Cost |
|---------|---------|------|
| **Cloudflare** | CDN, SSL, DDoS protection | Free tier available |
| **Railway/Render** | Backend hosting | Free tier: 500 hrs/month |
| **UptimeRobot** | Uptime monitoring | Free tier: 50 monitors |
| **Sentry** | Error tracking | Free tier: 5K errors/month |
| **LogDNA/Papertrail** | Log management | Free tier available |

### Security Checklist
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Enable Cloudflare SSL/TLS (Full Strict mode)
- [ ] Set up rate limiting on backend
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Review CORS settings in backend

---

## Part 6: Environment Variables Summary

### Backend (.env)
```bash
# Database
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=mediahq

# Security
JWT_SECRET=generate-a-32-character-random-string

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=+18886016703

# Auth
EMERGENT_AUTH_URL=https://auth.emergentagent.com
```

### Frontend (.env.production)
```bash
REACT_APP_BACKEND_URL=https://your-backend-url.up.railway.app
```

---

## Part 7: Deployment Commands Quick Reference

### Railway
```bash
# Install CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Cloudflare Pages (via Wrangler CLI)
```bash
# Install CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
cd frontend
yarn build
wrangler pages deploy build --project-name=ten-mediahq
```

---

## Troubleshooting

### Backend not connecting to MongoDB
1. Check IP whitelist in MongoDB Atlas
2. Verify MONGO_URL is correctly URL-encoded
3. Check backend logs for connection errors

### Frontend API calls failing
1. Verify REACT_APP_BACKEND_URL is correct
2. Check CORS settings in backend
3. Ensure backend is running and accessible

### Google OAuth not working
1. Verify redirect URIs in Emergent Auth
2. Check browser console for errors
3. Ensure cookies are enabled

---

## Cost Estimation (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Cloudflare Pages | Unlimited sites | - |
| Railway | 500 hrs ($5 credit) | ~$5-20/month |
| Render | 750 hrs | ~$7/month |
| MongoDB Atlas | 512MB storage | ~$9/month (M2) |
| Twilio WhatsApp | - | Pay per message |

**Estimated Total: $0-20/month** (depending on usage)

---

## Support

- Railway Docs: https://docs.railway.app
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp

