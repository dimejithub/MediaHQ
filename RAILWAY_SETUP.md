# 🚂 Railway Deployment - Step by Step Guide

## Prerequisites
- GitHub account with your code pushed
- Railway account (free at [railway.app](https://railway.app))

---

## Step 1: Push Code to GitHub

First, make sure your code is on GitHub. If not already done:

```bash
# In your local project folder
git init
git add .
git commit -m "Initial commit - TEN MediaHQ"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ten-mediahq.git
git push -u origin main
```

---

## Step 2: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub

---

## Step 3: Create New Project

1. Click **"New Project"** button (top right)
2. Select **"Deploy from GitHub repo"**
3. Find and select your **ten-mediahq** repository
4. Railway will detect it's a monorepo

---

## Step 4: Configure Backend Service

After selecting repo, Railway shows deployment options:

1. Click **"Add Service"** → **"GitHub Repo"**
2. Select your repo again
3. Click on the new service card
4. Go to **"Settings"** tab
5. Set **Root Directory**: `backend`
6. Set **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

---

## Step 5: Add Environment Variables

1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"New Variable"** and add each one:

```
MONGO_URL = mongodb+srv://DimejitHub:Proj3ct%402026@mediahq-db.itsmjk9.mongodb.net/?appName=MediaHQ-DB
DB_NAME = mediahq
JWT_SECRET = [Click "Generate" for a random secure string]
CORS_ORIGINS = *
AUTH_BACKEND_URL = https://demobackend.emergentagent.com
TWILIO_ACCOUNT_SID = AC82a07bd9fad004ebc7cdf022f660ef60
TWILIO_AUTH_TOKEN = 82751fb302a23b34ac32601e25bef272
TWILIO_WHATSAPP_NUMBER = +18886016703
```

**Important:** For `JWT_SECRET`, click the "Generate" button or use:
```bash
openssl rand -hex 32
```

---

## Step 6: Deploy Backend

1. Railway will automatically start deploying
2. Watch the **"Deployments"** tab for progress
3. Wait for "Deploy Successful" message (2-5 minutes)

---

## Step 7: Get Your Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. You'll get a URL like: `https://ten-mediahq-backend-production.up.railway.app`

**📝 Copy this URL - you'll need it for the frontend!**

---

## Step 8: Test Backend

Open your browser and go to:
```
https://YOUR-RAILWAY-URL/docs
```

You should see the FastAPI Swagger documentation page!

Also test:
```
https://YOUR-RAILWAY-URL/health
```

Should return: `{"status": "healthy", "version": "2.0.0"}`

---

## Step 9: Deploy Frontend to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **"Workers & Pages"** → **"Pages"**
3. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
4. Select your GitHub repo
5. Configure build:
   - **Project name**: `ten-mediahq`
   - **Production branch**: `main`
   - **Framework preset**: `Create React App`
   - **Root directory**: `frontend`
   - **Build command**: `yarn build`
   - **Build output directory**: `build`

6. Add Environment Variable:
   - **Variable name**: `REACT_APP_BACKEND_URL`
   - **Value**: `https://YOUR-RAILWAY-URL` (from Step 7)

7. Click **"Save and Deploy"**

---

## Step 10: Verify Everything Works

1. Wait for Cloudflare deployment (2-3 minutes)
2. Open your Cloudflare Pages URL
3. You should see the TEN MediaHQ login page!
4. Click "Try Demo Mode" to test

---

## 🎉 Congratulations! Your App is Live!

### Your URLs:
- **Frontend**: `https://ten-mediahq.pages.dev` (or custom domain)
- **Backend**: `https://your-app.up.railway.app`
- **API Docs**: `https://your-app.up.railway.app/docs`

---

## Troubleshooting

### Backend not starting?
1. Check Railway logs in "Deployments" tab
2. Verify all environment variables are set
3. Check MONGO_URL is correct

### Frontend can't connect to backend?
1. Verify REACT_APP_BACKEND_URL is correct
2. Check CORS_ORIGINS includes your frontend URL
3. Redeploy frontend after changing env vars

### MongoDB connection failing?
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` to allow all IPs
3. Or add Railway's specific IP range

---

## Custom Domain (Optional)

### For Cloudflare Pages:
1. Go to your Pages project → Custom Domains
2. Add your domain (e.g., `mediahq.yourchurch.com`)
3. Cloudflare handles SSL automatically

### For Railway:
1. Go to Settings → Domains
2. Add custom domain (e.g., `api.mediahq.yourchurch.com`)
3. Add CNAME record in your DNS

---

## Costs

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Railway | $5/month credit | Usually covers light usage |
| Cloudflare Pages | Unlimited | Completely free |
| MongoDB Atlas | 512MB free | M0 cluster |

**Total: $0-5/month for light usage**
