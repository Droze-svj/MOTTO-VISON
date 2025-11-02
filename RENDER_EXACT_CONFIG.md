# 🎯 Render Web Service - Exact Configuration

## 📝 Start Command

Copy this EXACT command into Render's "Start Command" field:

```bash
cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
```

**Why this command?**
- `cd backend` - Navigate to backend directory
- `uvicorn` - ASGI server for FastAPI
- `main_improved:app` - Your FastAPI app instance
- `--host 0.0.0.0` - Listen on all interfaces (required for Render)
- `--port $PORT` - Use Render's provided PORT variable

---

## 🔧 Build Command

Copy this EXACT command into Render's "Build Command" field:

```bash
cd backend && pip install -r requirements.txt && python setup_db.py init
```

**Why this command?**
- `cd backend` - Navigate to backend directory
- `pip install -r requirements.txt` - Install all Python dependencies
- `python setup_db.py init` - Initialize database tables

---

## 🔑 Environment Variables

Add these **one by one** in Render's Environment Variables section:

### Step-by-Step Instructions:

1. Go to your Web Service in Render
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"** for each one below

### Required Environment Variables:

**Variable 1:**
```
Key: SECRET_KEY
Value: DkGe3zMlJ5PgCADFCRE_gWPr6znPD73JA0554DWVq_4
```

**Variable 2:**
```
Key: JWT_SECRET_KEY
Value: HoC2v46Y_zYJ9CuDkUpi5fUrNxkfVknUe5SVLBHzqKQ
```

**Variable 3:**
```
Key: DATABASE_URL
Value: postgresql://motto_user:ywGjhDrpBONdThwr8aAlZLAySP4VAd3t@dpg-d42q98odl3ps73cm045g-a/motto
```

**Variable 4:**
```
Key: ENVIRONMENT
Value: production
```

**Variable 5:**
```
Key: API_VERSION
Value: v1
```

**Variable 6:**
```
Key: PYTHON_VERSION
Value: 3.11
```

**Variable 7:**
```
Key: ALLOWED_ORIGINS
Value: *
```

**Variable 8:**
```
Key: CORS_ORIGINS
Value: *
```

---

## ✅ Quick Copy-Paste Checklist

### Build Command:
```
cd backend && pip install -r requirements.txt && python setup_db.py init
```

### Start Command:
```
cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
```

### Environment Variables (8 total):

1. **SECRET_KEY** = `DkGe3zMlJ5PgCADFCRE_gWPr6znPD73JA0554DWVq_4`
2. **JWT_SECRET_KEY** = `HoC2v46Y_zYJ9CuDkUpi5fUrNxkfVknUe5SVLBHzqKQ`
3. **DATABASE_URL** = `postgresql://motto_user:ywGjhDrpBONdThwr8aAlZLAySP4VAd3t@dpg-d42q98odl3ps73cm045g-a/motto`
4. **ENVIRONMENT** = `production`
5. **API_VERSION** = `v1`
6. **PYTHON_VERSION** = `3.11`
7. **ALLOWED_ORIGINS** = `*`
8. **CORS_ORIGINS** = `*`

---

## 🎯 Complete Render Settings Summary

### Basic Settings:
```
Name: motto-backend
Region: Oregon (or same as your database)
Branch: main (or master)
Root Directory: backend
Runtime: Python 3
Python Version: 3.11
```

### Commands:
```
Build Command: cd backend && pip install -r requirements.txt && python setup_db.py init

Start Command: cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
```

### Health Check:
```
Health Check Path: /health
```

### Environment Variables:
(Add all 8 from the list above)

---

## 🚀 After Adding These Settings

1. Click **"Create Web Service"** or **"Save Changes"**
2. Render will automatically:
   - Build your service
   - Install dependencies
   - Initialize database
   - Start the service
3. Wait 3-5 minutes
4. You'll see: **"Your service is live"**
5. Copy your service URL (e.g., `https://motto-backend.onrender.com`)

---

## ⚠️ Important Notes

- **Don't add spaces** before/after the `=` sign in environment variables
- **Copy commands exactly** - including `cd backend &&`
- **DATABASE_URL** must match exactly (including password)
- **Health Check Path** should be `/health` (leading slash, no trailing)

---

## 🐛 If Something Goes Wrong

### Build Fails?
- Check logs in Render dashboard
- Verify Python 3.11 is selected
- Ensure `requirements.txt` exists in `backend/` directory

### Start Command Fails?
- Verify command is exactly: `cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT`
- Check that `main_improved.py` exists in `backend/` directory
- Look at logs for specific error messages

### Database Connection Error?
- Double-check DATABASE_URL is exactly: `postgresql://motto_user:ywGjhDrpBONdThwr8aAlZLAySP4VAd3t@dpg-d42q98odl3ps73cm045g-a/motto`
- Verify database is running in Render dashboard
- Ensure database and web service are in same region

---

**All set! Copy the commands and variables above into Render! 🚀**

