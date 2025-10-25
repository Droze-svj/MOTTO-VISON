# 🎨 Render Web Service - Field by Field Guide

**You're creating a Web Service on Render.com**  
**Follow this EXACT field guide**

---

## 📋 **SECTION 1: CONNECT REPOSITORY** (Top of Page)

### If you see "Connect a repository":

**Option A - If you have GitHub repo**:
- Click "Connect" next to your repository
- Skip to Section 2

**Option B - If NO GitHub repo** (Most likely):
- Scroll down past this section
- You'll configure manually below
- Just ignore this section for now ✅

---

## 📋 **SECTION 2: BASIC SETTINGS** (Main Form)

### Field 1: **Name** (Required)

```
┌─────────────────────────────────────┐
│ Name                                │
│ ┌─────────────────────────────────┐ │
│ │ motto-backend-staging           │ │ ← Enter this EXACTLY
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Copy this**: `motto-backend-staging`

---

### Field 2: **Region** (Required)

```
┌─────────────────────────────────────┐
│ Region                              │
│ ┌─────────────────────────────────┐ │
│ │ ▼ Oregon (US West)              │ │ ← Click dropdown
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Select**: `Oregon (US West)` or closest to you:
- Oregon (US West)
- Ohio (US East)
- Frankfurt (EU)
- Singapore (Asia)

---

### Field 3: **Branch** (If using Git)

```
┌─────────────────────────────────────┐
│ Branch                              │
│ ┌─────────────────────────────────┐ │
│ │ main                            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Enter**: `main` (if this field appears)  
**Skip**: If not using Git

---

### Field 4: **Root Directory** (Important!)

```
┌─────────────────────────────────────┐
│ Root Directory (optional)           │
│ ┌─────────────────────────────────┐ │
│ │ backend                         │ │ ← Enter this!
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Copy this**: `backend`

**Why**: Your FastAPI code is in the backend/ folder

---

### Field 5: **Runtime** / **Environment**

```
┌─────────────────────────────────────┐
│ Environment                         │
│ ┌─────────────────────────────────┐ │
│ │ ▼ Python 3                      │ │ ← Select from dropdown
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Select**: `Python 3` or `Python`

---

## 📋 **SECTION 3: BUILD & DEPLOY**

### Field 6: **Build Command** (Required)

```
┌─────────────────────────────────────────────────────────┐
│ Build Command                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ pip install -r requirements.txt                     │ │ ← Copy this
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Copy this EXACTLY**:
```
pip install -r requirements.txt
```

---

### Field 7: **Start Command** (Required)

```
┌───────────────────────────────────────────────────────────────────┐
│ Start Command                                                     │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ uvicorn main_improved:app --host 0.0.0.0 --port $PORT        │ │ ← Copy
│ └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

**Copy this EXACTLY**:
```
uvicorn main_improved:app --host 0.0.0.0 --port $PORT
```

**Important**: Keep `$PORT` - Render sets this automatically!

---

## 📋 **SECTION 4: ADVANCED SETTINGS**

### **Click the "Advanced" Button**

You'll see this button below the Start Command field. **Click it!**

It reveals more options ↓

---

### **ENVIRONMENT VARIABLES** (Most Important!)

You'll see an "Environment Variables" section.

**Click "Add Environment Variable"** button **6 times** to add these:

---

#### Variable 1: SECRET_KEY

```
┌─────────────────────────────────────┐
│ Key                                 │
│ ┌─────────────────────────────────┐ │
│ │ SECRET_KEY                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Value                               │
│ ┌─────────────────────────────────┐ │
│ │ nEXuxUljwrto9kkSRZQZg8keeS...  │ │ ← Paste below
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Key**: `SECRET_KEY`  
**Value**: `nEXuxUljwrto9kkSRZQZg8keeSudbhgqgspfqbaKkoM`

---

#### Variable 2: ENVIRONMENT

```
Key:   ENVIRONMENT
Value: staging
```

---

#### Variable 3: DEBUG

```
Key:   DEBUG
Value: false
```

---

#### Variable 4: LOG_LEVEL

```
Key:   LOG_LEVEL
Value: INFO
```

---

#### Variable 5: ALLOWED_ORIGINS

```
Key:   ALLOWED_ORIGINS
Value: *
```

---

#### Variable 6: DATABASE_URL

```
Key:   DATABASE_URL
Value: sqlite+aiosqlite:///./tokens.db
```

---

### **Health Check Path** (Optional but recommended)

If you see "Health Check Path" field:

```
┌─────────────────────────────────────┐
│ Health Check Path (optional)        │
│ ┌─────────────────────────────────┐ │
│ │ /health                         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Enter**: `/health`

---

## 📋 **SECTION 5: INSTANCE TYPE**

### Select Free Plan

```
┌─────────────────────────────────────┐
│ Instance Type                       │
│                                     │
│ ● Free                              │ ← Click this
│   $0/month                          │
│   512MB RAM, 0.1 CPU               │
│                                     │
│ ○ Starter                           │
│   $7/month                          │
└─────────────────────────────────────┘
```

**Select**: **Free** (should be default)

---

## 📋 **SECTION 6: AUTO-DEPLOY** (Optional)

### Auto-Deploy

```
┌─────────────────────────────────────┐
│ Auto-Deploy                         │
│ ☐ Yes                               │ ← Can check this later
└─────────────────────────────────────┘
```

**Leave unchecked** for now (you can enable later)

---

## 🎯 **FINAL STEP: CREATE!**

### Scroll to Bottom

You'll see a big blue button:

```
┌─────────────────────────────────────┐
│                                     │
│     Create Web Service              │  ← CLICK THIS!
│                                     │
└─────────────────────────────────────┘
```

**Click**: **"Create Web Service"**

---

## ⏳ **WHAT HAPPENS NEXT**

After clicking "Create Web Service":

### 1. **Creating service...** (10 seconds)
- Render sets up your service
- Allocates resources

### 2. **Build in progress...** (3-5 minutes)
You'll see logs:
```
==> Downloading Python 3.11...
==> Installing dependencies
==> pip install -r requirements.txt
==> Installing fastapi, uvicorn, sqlalchemy...
==> Build successful ✅
```

### 3. **Deploying...** (1-2 minutes)
```
==> Starting service
==> uvicorn main_improved:app --host 0.0.0.0 --port 10000
==> Service is live ✅
```

### 4. **Live!** (Done!)
You'll see:
- Green "Live" status
- Your URL at the top
- Logs showing "Application startup complete"

---

## ✅ **VERIFY IT WORKED**

### Check 1: Health Endpoint

In your browser, visit:
```
https://your-service-name.onrender.com/health
```

**Should show**:
```json
{
  "status": "healthy",
  "version": "2.1.0",
  "database": "connected"
}
```

### Check 2: API Documentation

Visit:
```
https://your-service-name.onrender.com/docs
```

**Should show**: Beautiful interactive API documentation with all endpoints!

---

## 🎊 **YOU'RE DONE WITH BACKEND!**

**Your backend is now live!** ✅

**Save your URL**: `https://motto-backend-staging.onrender.com`

---

## 📱 **READY FOR MOBILE APPS?**

After backend is deployed, let me know and I'll guide you through:
- Firebase project creation
- Adding Android app
- Adding iOS app
- Deploying mobile apps

**Or follow**: `STEP_BY_STEP_DEPLOYMENT.md` starting at STEP 7

---

## 💡 **QUICK TROUBLESHOOTING**

**"I don't see Root Directory field"**:
- It might be labeled "Working Directory"
- Or under "Advanced" section

**"I don't see Environment field"**:
- Might be called "Language" or "Runtime"
- Select "Python 3" from dropdown

**"Build failed"**:
- Check Root Directory is set to `backend`
- Verify Build Command is correct
- Check logs for specific error

**"I don't see Advanced button"**:
- Scroll down - it's usually between Start Command and Plan selection

---

## 🎯 **WHERE ARE YOU NOW?**

**Tell me what you see on your screen and I'll help you!**

Are you:
- [ ] At Render signup page?
- [ ] At "Create Web Service" page?
- [ ] Filling in fields?
- [ ] At environment variables?
- [ ] Waiting for deployment?
- [ ] Deployment complete?

**Let me know and I'll guide you through that specific step!** 🚀
