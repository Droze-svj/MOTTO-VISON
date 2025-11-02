# ✅ Render Deployment - Complete Configuration

## 🗄️ Your Database URL

```
postgresql://motto_user:ywGjhDrpBONdThwr8aAlZLAySP4VAd3t@dpg-d42q98odl3ps73cm045g-a/motto
```

**Note**: This is your Render database. Use the Internal Database URL for your web service.

---

## 🚀 Complete Render Setup

### Step 1: Create Web Service in Render

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Step 2: Configure Service

**Basic Settings:**
```
Name: motto-backend
Region: Oregon (or same as database)
Branch: main
Root Directory: backend
Runtime: Python 3
Python Version: 3.11
```

**Build Command:**
```bash
cd backend && pip install -r requirements.txt && python setup_db.py init
```

**Start Command:**
```bash
cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
```

### Step 3: Set Environment Variables

Add these in Render dashboard (Web Service → Environment):

**Required:**
```
SECRET_KEY=DkGe3zMlJ5PgCADFCRE_gWPr6znPD73JA0554DWVq_4
JWT_SECRET_KEY=HoC2v46Y_zYJ9CuDkUpi5fUrNxkfVknUe5SVLBHzqKQ
DATABASE_URL=postgresql://motto_user:ywGjhDrpBONdThwr8aAlZLAySP4VAd3t@dpg-d42q98odl3ps73cm045g-a/motto
ENVIRONMENT=production
API_VERSION=v1
PYTHON_VERSION=3.11
```

**For Mobile Apps:**
```
ALLOWED_ORIGINS=*
CORS_ORIGINS=*
```

**Optional (for monitoring):**
```
SENTRY_DSN=your-sentry-dsn-if-using
```

### Step 4: Health Check

Set in Render:
```
Health Check Path: /health
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your service URL will be something like:
   `https://motto-backend.onrender.com`

---

## 📱 Update Mobile Apps

Once you get your Render service URL (e.g., `https://motto-backend.onrender.com`), run:

```bash
# Replace with your actual Render service URL
./scripts/update-mobile-api-url.sh https://motto-backend.onrender.com
```

Or manually update `.env`:
```env
API_BASE_URL=https://motto-backend.onrender.com
REACT_NATIVE_API_URL=https://motto-backend.onrender.com
RENDER_API_URL=https://motto-backend.onrender.com
```

---

## ✅ Verification Steps

### 1. Test Backend Health

Once deployed, test:
```bash
curl https://your-service.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": {"status": "healthy"},
  "timestamp": "...",
  ...
}
```

### 2. Test API Documentation

Open in browser:
```
https://your-service.onrender.com/docs
```

### 3. Test from Mobile Apps

After updating mobile apps:
1. Rebuild iOS: `npm run ios`
2. Rebuild Android: `npm run android`
3. Test chat functionality
4. Check logs for API calls

---

## 🔍 Troubleshooting

### Database Connection Error

**If you see database errors:**
- Verify DATABASE_URL is exactly: `postgresql://motto_user:ywGjhDrpBONdThwr8aAlZLAySP4VAd3t@dpg-d42q98odl3ps73cm045g-a/motto`
- Check database is running in Render dashboard
- Verify database and web service are in same region

### Build Fails

**If build fails:**
- Check logs in Render dashboard
- Verify Python 3.11 is selected
- Ensure requirements.txt has all dependencies

### Service Won't Start

**If service won't start:**
- Check start command is correct
- Verify PORT variable (Render sets automatically)
- Check logs for specific errors

### CORS Errors

**If CORS errors:**
- Verify `ALLOWED_ORIGINS=*` is set
- Check CORS middleware in backend code
- Redeploy if needed

---

## 📋 Deployment Checklist

- [ ] Render account created
- [ ] PostgreSQL database exists (you have the URL!)
- [ ] Web service created
- [ ] All environment variables set (including DATABASE_URL)
- [ ] Service deployed and running
- [ ] Health check returns "healthy"
- [ ] Service URL copied
- [ ] Mobile apps updated with service URL
- [ ] iOS app rebuilt and tested
- [ ] Android app rebuilt and tested

---

## 🎯 Quick Commands

**After deployment, test:**
```bash
# Health check
curl https://your-service.onrender.com/health

# Update mobile apps (replace with your URL)
./scripts/update-mobile-api-url.sh https://your-service.onrender.com

# Rebuild apps
npm run ios
npm run android
```

---

**Your Database URL**: ✅ Ready  
**Secret Keys**: ✅ Generated  
**Next Step**: Deploy web service with the configuration above!

Once your service is deployed, share the URL and I'll help finalize the mobile app updates.

