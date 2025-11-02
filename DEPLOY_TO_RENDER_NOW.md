# 🚀 Deploy to Render - Step by Step Guide

## Quick Steps (Follow in Order)

### Step 1: Sign Up to Render (2 minutes)

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended) or email

---

### Step 2: Create PostgreSQL Database (3 minutes)

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Fill in:
   ```
   Name: motto-db
   Database: motto
   Region: Oregon (or closest to you)
   PostgreSQL Version: Latest
   Plan: Free
   ```
3. Click **"Create Database"**
4. ⚠️ **IMPORTANT**: After creation, copy the **"Internal Database URL"**
   - It looks like: `postgresql://user:password@hostname:5432/dbname`
   - **NOT** the "External Database URL"
   - Save this somewhere safe - you'll need it!

---

### Step 3: Create Web Service (5 minutes)

1. In Render dashboard, click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Click "Connect account" if needed
   - Select your **GitHub account**
   - Select your **MOTTO repository**
   - Branch: `main` or `master`

3. **Basic Settings:**
   ```
   Name: motto-backend
   Region: Oregon (same as database)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Python Version: 3.11
   Instance Type: Free
   ```

4. **Build & Start Commands:**
   
   **Build Command:**
   ```bash
   cd backend && pip install -r requirements.txt && python setup_db.py init
   ```
   
   **Start Command:**
   ```bash
   cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
   ```

5. **Environment Variables:**
   
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these one by one:
   
   **Generate SECRET_KEY first:**
   ```bash
   # Run this in terminal:
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   
   Then add:
   ```
   SECRET_KEY = [paste the generated key]
   DATABASE_URL = [paste Internal Database URL from Step 2]
   ENVIRONMENT = production
   API_VERSION = v1
   PYTHON_VERSION = 3.11
   ALLOWED_ORIGINS = *
   CORS_ORIGINS = *
   ```
   
   For JWT (generate another key):
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   
   Add:
   ```
   JWT_SECRET_KEY = [paste the generated key]
   JWT_ALGORITHM = HS256
   ```

6. **Health Check:**
   ```
   Health Check Path: /health
   ```

7. Click **"Create Web Service"**

---

### Step 4: Wait for Deployment (3-5 minutes)

- Watch the **"Logs"** tab
- You'll see:
  - Building dependencies
  - Installing packages
  - Running migrations
  - Starting service
- Wait for: **"Your service is live"** message

---

### Step 5: Get Your Service URL

1. In the service dashboard, you'll see:
   ```
   URL: https://motto-backend.onrender.com
   ```
   (Your URL will be unique based on service name)

2. **Copy this URL** - you'll need it for mobile apps!

---

### Step 6: Test Your Deployment

```bash
# Test health endpoint
curl https://motto-backend.onrender.com/health

# Should return:
# {
#   "status": "healthy",
#   "database": {"status": "healthy"},
#   ...
# }
```

Or open in browser:
```
https://motto-backend.onrender.com/docs
```

---

## ✅ Next: Update Mobile Apps

Once you have your Render URL, we'll update:
- iOS app configuration
- Android app configuration
- API config files

**Your Render URL will be something like:**
`https://motto-backend.onrender.com`

---

## 🐛 Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Verify Python 3.11 is selected
- Check requirements.txt is correct

**Database error?**
- Make sure you used **Internal Database URL** (not External)
- Verify DATABASE_URL environment variable

**Service won't start?**
- Check start command is correct
- Verify PORT variable (Render sets this automatically)
- Check logs for errors

**Can't access service?**
- Wait 2-3 minutes after deployment
- Check service status is "Live" (green)
- Try health endpoint: `/health`

---

**Once deployed, let me know your Render URL and I'll help update the mobile apps!**

