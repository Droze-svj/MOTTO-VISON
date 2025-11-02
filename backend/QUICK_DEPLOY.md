# Quick Deployment Guide - 5 Minute Setup

## 🚀 Fastest Way: Railway (Recommended)

### Step 1: Install Railway CLI (2 min)
```bash
npm i -g @railway/cli
railway login
```

### Step 2: Initialize Project (1 min)
```bash
cd backend
railway init
railway link  # Link to existing project if you have one
```

### Step 3: Add PostgreSQL Database (1 min)
- In Railway dashboard: Click "+ New" → "Database" → "PostgreSQL"
- Copy the DATABASE_URL from database service

### Step 4: Set Environment Variables (1 min)
```bash
# Generate secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Set in Railway
railway variables set SECRET_KEY=your-generated-key-here
railway variables set DATABASE_URL=postgresql://...  # From step 3
railway variables set ENVIRONMENT=production
railway variables set API_VERSION=v1
```

### Step 5: Deploy (30 seconds)
```bash
railway up
```

### Step 6: Get Your URL
Railway automatically provides URL like: `motto-backend.railway.app`

**That's it! Your backend is live! 🎉**

---

## 🔍 Verify Deployment

```bash
# Test health check
curl https://your-railway-url.railway.app/health

# Should return:
# {
#   "status": "healthy",
#   "database": { "status": "healthy" },
#   ...
# }
```

---

## 📱 Update Frontend

In your frontend config:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: 'https://your-railway-url.railway.app',
  // ...
};
```

---

## ⚡ Alternative: Render (Just as Easy)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repo
5. Configure:
   - **Build**: `cd backend && pip install -r requirements.txt`
   - **Start**: `cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT`
6. Add PostgreSQL database
7. Set environment variables
8. Deploy!

---

## 🐛 Troubleshooting

**Deployment fails?**
```bash
railway logs  # Check logs
```

**Database connection error?**
- Verify DATABASE_URL is set correctly
- Check database is running in Railway dashboard

**Can't access API?**
- Check Railway URL is correct
- Verify service is running (green status in dashboard)

---

**Time to deploy**: ~5 minutes  
**Cost**: Free tier available  
**Next**: Test with mobile apps!

