# Production Deployment Guide - Testing Phase

## Overview

This guide walks you through deploying MOTTO backend to production for testing before app store launch.

## 🎯 Deployment Platforms

Choose one of these platforms (all have free tiers for testing):

### Option 1: Railway (Recommended - Easiest)

**Why Railway:**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ PostgreSQL included
- ✅ Easy GitHub integration
- ✅ Auto-deploys on push

**Steps:**

1. **Sign up** at https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize in backend directory
   cd backend
   railway init
   ```

3. **Add PostgreSQL Database**
   - In Railway dashboard: New → Database → PostgreSQL
   - Copy connection string

4. **Set Environment Variables**
   ```bash
   railway variables set SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
   railway variables set DATABASE_URL=$DATABASE_URL  # From PostgreSQL service
   railway variables set ENVIRONMENT=production
   railway variables set API_VERSION=v1
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get Your URL**
   - Railway provides URL automatically (e.g., `motto-backend.up.railway.app`)
   - Update frontend API config with this URL

---

### Option 2: Render (Good Alternative)

**Why Render:**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy setup
- ✅ PostgreSQL available

**Steps:**

1. **Sign up** at https://render.com
   - Sign in with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repo
   - Select `backend` directory

3. **Configure Service**
   ```
   Build Command: cd backend && pip install -r requirements.txt
   Start Command: cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
   Environment: Python 3
   ```

4. **Add PostgreSQL Database**
   - New → PostgreSQL
   - Copy internal database URL

5. **Set Environment Variables**
   ```
   SECRET_KEY=your-generated-secret-key
   DATABASE_URL=postgresql://... (from database)
   ENVIRONMENT=production
   ```

6. **Deploy**
   - Render auto-deploys on push to main branch

---

### Option 3: Fly.io (Alternative)

**Why Fly.io:**
- ✅ Free tier available
- ✅ Global edge deployment
- ✅ PostgreSQL available

**Steps:**

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and Login**
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Launch App**
   ```bash
   cd backend
   fly launch
   ```

4. **Add PostgreSQL**
   ```bash
   fly postgres create --name motto-db
   fly postgres attach --app motto-backend motto-db
   ```

---

## 🔧 Pre-Deployment Setup

### 1. Generate Secret Keys

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate JWT_SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Prepare Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Required
SECRET_KEY=your-generated-secret-key-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET_KEY=your-jwt-secret-key
ENVIRONMENT=production

# Optional but Recommended
SENTRY_DSN=your-sentry-dsn
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 3. Run Deployment Script

```bash
cd backend
chmod +x deploy.sh
./deploy.sh production
```

This will:
- ✅ Check prerequisites
- ✅ Validate environment variables
- ✅ Install dependencies
- ✅ Run migrations
- ✅ Run tests
- ✅ Perform health check

---

## 📊 Verification Checklist

After deployment, verify:

### 1. Health Check
```bash
curl https://your-api-url.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "version": "v1",
  "environment": "production",
  "database": {
    "status": "healthy"
  },
  "system": {
    "memory_percent": 45.2,
    "cpu_percent": 12.5,
    "memory_available_mb": 1024
  }
}
```

### 2. API Documentation
```bash
# Open in browser
https://your-api-url.com/docs
```

### 3. Database Connection
- Verify database is accessible
- Check migrations ran successfully
- Test database operations

### 4. CORS Configuration
- Test API from frontend
- Verify CORS headers are correct

### 5. Error Logging
- Check Sentry (if configured)
- Verify errors are being logged

---

## 🔄 Update Frontend Configuration

After backend is deployed:

1. **Update API Base URL**

   ```typescript
   // src/config/api.ts
   export const API_BASE_URL = process.env.API_BASE_URL || 'https://your-api-url.com';
   ```

2. **Environment Variables** (for React Native)

   ```env
   # .env
   API_BASE_URL=https://your-api-url.com
   ```

3. **Test Connection**
   ```bash
   # In your app
   # Should connect to production backend
   ```

---

## 📱 Testing Mobile Apps

### iOS Testing

1. **Update API URL** in app config
2. **Build for TestFlight**:
   ```bash
   cd ios
   xcodebuild -workspace Motto.xcworkspace -scheme Motto archive
   ```
3. **Upload to TestFlight**
4. **Test with production backend**

### Android Testing

1. **Update API URL** in app config
2. **Build APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. **Install on device** or upload to Play Console internal testing
4. **Test with production backend**

---

## 🔍 Monitoring Setup

### 1. Set Up Sentry

1. Create account at https://sentry.io
2. Create new project (Python/FastAPI)
3. Get DSN
4. Add to environment:
   ```bash
   railway variables set SENTRY_DSN=your-sentry-dsn
   ```

### 2. Enable Monitoring

The monitoring service is already integrated. Just add Sentry DSN:

```python
# In main_improved.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "production"),
)
```

### 3. Set Up Alerts

In Sentry dashboard:
- Configure alerts for errors
- Set up email/Slack notifications
- Monitor performance

---

## 🚨 Troubleshooting

### Deployment Fails

1. **Check Logs**
   ```bash
   railway logs
   # or in Render dashboard
   ```

2. **Verify Environment Variables**
   ```bash
   railway variables
   ```

3. **Check Database Connection**
   - Verify DATABASE_URL is correct
   - Check database is accessible
   - Test connection manually

### Health Check Fails

1. **Check Database**
   - Is database running?
   - Is DATABASE_URL correct?
   - Are migrations run?

2. **Check Dependencies**
   - Are all packages installed?
   - Check requirements.txt

### CORS Errors

1. **Update ALLOWED_ORIGINS**
   ```bash
   railway variables set ALLOWED_ORIGINS=https://your-frontend.com
   ```

2. **Check CORS Configuration** in main_improved.py

---

## 📋 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Health check returns healthy
- [ ] Database connected and migrations run
- [ ] API documentation accessible at /docs
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Monitoring (Sentry) configured
- [ ] Frontend updated with new API URL
- [ ] Mobile apps tested with production backend
- [ ] Error logging working
- [ ] Performance monitoring active

---

## 🎯 Next Steps After Deployment

1. **Test Thoroughly**
   - Run through TESTING_CHECKLIST.md
   - Test all features with production backend
   - Monitor for errors

2. **Gather Feedback**
   - Share TestFlight/internal testing links
   - Collect user feedback
   - Monitor usage patterns

3. **Optimize**
   - Review performance metrics
   - Optimize slow endpoints
   - Improve error handling

4. **Prepare for Launch**
   - Finalize app store assets
   - Complete privacy policy
   - Prepare marketing materials

---

## 📞 Support

- **Deployment Issues**: Check logs in platform dashboard
- **Database Issues**: Verify connection string
- **API Issues**: Check /docs endpoint for API documentation
- **Monitoring**: Check Sentry dashboard

---

**Last Updated**: $(date)  
**Status**: ✅ Ready for Production Testing  
**Platforms**: Railway, Render, Fly.io  
**Quick Start**: Run `./backend/deploy.sh production`

