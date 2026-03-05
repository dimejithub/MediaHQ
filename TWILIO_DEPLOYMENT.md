# Twilio WhatsApp Edge Function - Deployment Guide

## Prerequisites
1. **Supabase CLI** installed: `npm install -g supabase`
2. **Twilio credentials** (already configured):
   - Account SID: `AC82a07bd9fad004ebc7cdf022f660ef60`
   - Auth Token: `827...272` (from your .env)
   - WhatsApp Number: `+18886016703`

---

## Step-by-Step Deployment

### Step 1: Login to Supabase
```bash
supabase login
```
This opens your browser to authenticate.

### Step 2: Link your project
```bash
cd /path/to/your/project
supabase link --project-ref uctjdklqxvjxnxmsrnav
```
(Your project ref is `uctjdklqxvjxnxmsrnav` from the Supabase URL)

### Step 3: Set Twilio secrets
```bash
supabase secrets set TWILIO_ACCOUNT_SID=AC82a07bd9fad004ebc7cdf022f660ef60
supabase secrets set TWILIO_AUTH_TOKEN=your_full_auth_token_here
supabase secrets set TWILIO_WHATSAPP_NUMBER=+18886016703
```

### Step 4: Deploy the function
```bash
supabase functions deploy send-whatsapp
```

### Step 5: Test it
```bash
curl -X POST \
  https://uctjdklqxvjxnxmsrnav.supabase.co/functions/v1/send-whatsapp \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+44XXXXXXXXXX", "message": "Test from TEN MediaHQ"}'
```

---

## How It Works
- The Edge Function lives at `/supabase/functions/send-whatsapp/index.ts`
- It receives a phone number and message via POST
- Calls the Twilio REST API to send a WhatsApp message
- Returns success/failure status

## Calling from the App
```javascript
const { data, error } = await supabase.functions.invoke('send-whatsapp', {
  body: {
    phone: '+44XXXXXXXXXX',
    message: 'You have been assigned Camera 1 for Sunday Service'
  }
});
```

---

## Troubleshooting
| Issue | Fix |
|-------|-----|
| "Twilio not configured" | Run `supabase secrets set` commands again |
| 401 Unauthorized | Check your Supabase anon key is correct |
| WhatsApp not delivered | Ensure recipient has opted in to your Twilio sandbox |
