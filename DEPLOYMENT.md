# TEN MediaHQ - Deployment Guide

## Overview
This guide covers deploying TEN MediaHQ to production using various hosting options.

---

## Prerequisites

### Required Services
1. **MongoDB Atlas** (Database) - Already configured
2. **Domain name** (optional but recommended)
3. **SSL Certificate** (provided by most hosting platforms)

### Environment Variables Required

#### Backend (.env)
```bash
MONGO_URL=your_mongodb_connection_string
DB_NAME=mediahq
CORS_ORIGINS=https://your-frontend-domain.com
AUTH_BACKEND_URL=https://demobackend.emergentagent.com

# Twilio (WhatsApp Notifications)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+your_whatsapp_number
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

---

## Deployment Options

### Option 1: Emergent Platform (Recommended)
The app is already configured for Emergent deployment.

1. Click "Deploy" in the Emergent dashboard
2. Your app will be available at `your-app-name.emergentagent.com`
3. Environment variables are automatically managed

### Option 2: Railway
1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in the Railway dashboard
4. Railway will auto-detect and deploy both services

### Option 3: Render
1. Create two services on [Render](https://render.com):
   - **Web Service** (Backend): Python, uses `/app/backend`
   - **Static Site** (Frontend): Node, uses `/app/frontend`
2. Set environment variables for each service
3. Configure build commands:
   - Backend: `pip install -r requirements.txt`
   - Frontend: `yarn install && yarn build`

### Option 4: DigitalOcean App Platform
1. Create a new App on DigitalOcean
2. Connect GitHub repository
3. Add two components:
   - Backend (Python)
   - Frontend (Static Site)
4. Configure environment variables

### Option 5: VPS (Ubuntu/Debian)
```bash
# Install dependencies
sudo apt update
sudo apt install python3.11 nodejs npm nginx certbot

# Clone repository
git clone your-repo-url /var/www/mediahq
cd /var/www/mediahq

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service for backend
sudo tee /etc/systemd/system/mediahq-backend.service << EOF
[Unit]
Description=MediaHQ Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/mediahq/backend
Environment="PATH=/var/www/mediahq/backend/venv/bin"
ExecStart=/var/www/mediahq/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Frontend setup
cd ../frontend
npm install -g yarn
yarn install
yarn build

# Configure Nginx
sudo tee /etc/nginx/sites-available/mediahq << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /var/www/mediahq/frontend/build;
        try_files \$uri /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/mediahq /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Start services
sudo systemctl enable mediahq-backend
sudo systemctl start mediahq-backend
```

---

## Post-Deployment Checklist

- [ ] Verify MongoDB connection
- [ ] Test WhatsApp notifications (send test message)
- [ ] Test Google OAuth login flow
- [ ] Verify all API endpoints respond correctly
- [ ] Check mobile responsiveness
- [ ] Set up monitoring/alerts (optional)

---

## Updating the Application

### Via Git
```bash
cd /var/www/mediahq
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart mediahq-backend

# Frontend
cd ../frontend
yarn install
yarn build
```

### Via Emergent Platform
Simply push to your connected repository - auto-deploy is enabled.

---

## Troubleshooting

### Backend not starting
```bash
# Check logs
journalctl -u mediahq-backend -f

# Common issues:
# - Missing environment variables
# - MongoDB connection timeout
# - Port already in use
```

### Frontend build fails
```bash
# Clear cache and rebuild
rm -rf node_modules .cache
yarn install
yarn build
```

### WhatsApp notifications not sending
1. Verify Twilio credentials in .env
2. Check WhatsApp number is approved in Twilio console
3. Ensure recipient has opted-in to WhatsApp messages

---

## Security Recommendations

1. **Use HTTPS** - Always serve over SSL
2. **Environment Variables** - Never commit .env files
3. **MongoDB** - Enable authentication, whitelist IPs
4. **Rate Limiting** - Consider adding rate limits to API
5. **Backups** - Enable MongoDB Atlas automated backups

---

## Support

For deployment issues, contact:
- Emergent Platform support
- Check `/app/test_reports/` for debugging info
