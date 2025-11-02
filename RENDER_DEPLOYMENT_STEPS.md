# Render Deployment - Step by Step

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Render Account (2 min)

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

### Step 2: Create PostgreSQL Database (3 min)

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Settings:
   ```
   Name: motto-db
   Database: motto
   Region: Choose closest to you (Oregon recommended)
   Plan: Free
   ```
3. Click **"Create Database"**
4. **IMPORTANT**: Copy the **Internal Database URL** (not External)
   - Format: `postgresql://user:pass@host:port/dbname`
   - Save this for Step 3

### Step 3: Create Web Service (5 min)

1. In Render dashboard, click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Select your GitHub account
   - Choose MOTTO repository
   - Branch: `main` or `master`

3. **Basic Settings:**
   ```
   Name: motto-backend
   Region: Same as database (Oregon)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Python Version: 3.11
   ```

4. **Build & Start Commands:**
   ```
   Build Command:
   cd backend && pip install -r requirements.txt && python setup_db.py init
   
   Start Command:
   cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
   ```

5. **Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these one by one:
   ```
   SECRET_KEY
   (Generate with: python3 -c "import secrets; print(secrets.token_urlsafe(32))")
   
   DATABASE_URL
   (Paste Internal Database URL from Step 2)
   
   ENVIRONMENT
   production
   
   API_VERSION
   v1
   
   PYTHON_VERSION
   3.11
   
   ALLOWED_ORIGINS
   *
   
   CORS_ORIGINS
   *
   ```

6. **Health Check:**
   ```
   Health Check Path: /health
   ```

7. Click **"Create Web Service"**

### Step 4: Wait for Deployment (3-5 min)

- Render will:
  - Clone your repo
  - Install dependencies
  - Run migrations
  - Start the service

- Watch the logs for progress
- Wait for "Your service is live" message

### Step 5: Get Your Service URL (1 min)

1. In service dashboard, you'll see:
   ```
   https://motto-backend.onrender.com
   ```
   (Your URL will be unique)

2. **Test it:**
   ```bash
   curl https://motto-backend.onrender.com/health
   ```

   Should return:
   ```json
   {
     "status": "healthy",
     "database": {"status": "healthy"}
   }
   ```

### Step 6: Update Mobile Apps (2 min)

**For iOS:**
Update `src/config/api.ts` or `.env`:
```typescript
API_BASE_URL=https://motto-backend.onrender.com
```

**For Android:**
Same as iOS - update API config

**Test:**
```bash
npm run ios
npm run android
```

---

## ✅ Verification

### Backend Health
```bash
curl https://your-service.onrender.com/health
```

### API Docs
Open in browser:
```
https://your-service.onrender.com/docs
```

### Test Endpoint
```bash
curl -X POST https://your-service.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "userId": "test"}'
```

---

## 📱 Mobile App Configuration

### iOS

1. Update `.env`:
   ```env
   API_BASE_URL=https://motto-backend.onrender.com
   ```

2. Rebuild:
   ```bash
   npm run ios
   ```

### Android

1. Update `.env`:
   ```env
   API_BASE_URL=https://motto-backend.onrender.com
   ```

2. Rebuild:
   ```bash
   npm run android
   ```

---

## 🐛 Common Issues

**Build Fails?**
- Check logs in Render dashboard
- Verify Python 3.11 is set
- Check requirements.txt has all packages

**Database Error?**
- Use Internal Database URL (not External)
- Verify DATABASE_URL is set correctly

**CORS Errors?**
- Set ALLOWED_ORIGINS=* in environment
- Verify CORS middleware in code

**Service Not Starting?**
- Check logs
- Verify start command is correct
- Check PORT environment variable

---

## 📊 Monitoring

**Render Dashboard:**
- View logs: Real-time logs in dashboard
- Metrics: CPU, memory, requests
- Events: Deployments, restarts

**Health Endpoints:**
- `/health` - Full health check
- `/health/live` - Liveness probe
- `/health/ready` - Readiness probe

---

**Time**: ~15 minutes total  
**Cost**: Free tier  
**Status**: ✅ Ready for iOS & Android

