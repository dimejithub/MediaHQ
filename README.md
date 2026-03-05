# TEN MediaHQ

A comprehensive platform for church media teams to manage personnel, equipment, schedules, and training.

## Features

- 🔐 **Secure Authentication** - JWT + Google OAuth
- 👥 **Team Directory** - Manage 23+ team members across multiple teams
- 📅 **Service Scheduling** - Calendar view with recurring service generation
- 🔄 **Lead Rotation** - 52-week leadership rotation planner
- 📦 **Equipment Management** - Inventory tracking with handover system
- ✅ **Checklists** - Interactive service checklists
- 📚 **Training Center** - Link external training materials
- 📱 **WhatsApp Notifications** - Twilio integration for alerts
- 📊 **Performance Metrics** - Track attendance and reliability

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Auth**: Google OAuth
- **Notifications**: Twilio WhatsApp

## Project Structure

```
├── backend/
│   ├── server.py          # FastAPI entry point
│   ├── database.py        # MongoDB connection
│   ├── routes/            # Modular API routes
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── services.py
│   │   ├── rotas.py
│   │   ├── equipment.py
│   │   └── ... (17 route files)
│   ├── requirements.txt
│   └── Procfile           # Railway deployment
│
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with routing
│   │   ├── pages/         # Page components
│   │   └── components/    # Shadcn/UI components
│   ├── package.json
│   └── .env.production
│
└── CLOUDFLARE_DEPLOYMENT.md  # Deployment guide
```

## Deployment

### Quick Start

1. **Backend** → Deploy to [Railway](https://railway.app)
2. **Frontend** → Deploy to [Cloudflare Pages](https://pages.cloudflare.com)

See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed instructions.

### Environment Variables

**Backend:**
```
MONGO_URL=your-mongodb-atlas-url
DB_NAME=mediahq
JWT_SECRET=your-secure-secret
CORS_ORIGINS=https://your-frontend-url.pages.dev
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_NUMBER=+1234567890
```

**Frontend:**
```
REACT_APP_BACKEND_URL=https://your-backend.up.railway.app
```

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start
```

## Teams

- **Envoy Nation** - Sunday morning service (11:00 AM)
- **The Commissioned Envoy** - Sunday afternoon service (2:00 PM)

## License

Private - TEN Media Commission
