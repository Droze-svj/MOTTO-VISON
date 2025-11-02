# Render Deployment Guide - iOS & Android Testing

## 🎯 Overview

This guide walks you through deploying MOTTO backend to Render and configuring it for iOS and Android app testing.

---

## 📱 Step 1: Deploy Backend to Render

### 1.1 Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email

### 1.2 Create Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
   - Select your MOTTO repository
   - Choose branch: `main` or `master`

### 1.3 Configure Service

**Basic Settings:**
```
Name: motto-backend
Region: Oregon (or closest to you)
Branch: main
Root Directory: backend
```

**Build & Start:**
```
Build Command: cd backend && pip install -r requirements.txt && python setup_db.py init
Start Command: cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT
```

**Runtime:**
```
Environment: Python 3
Python Version: 3.11
```

### 1.4 Add PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   ```
   Name: motto-db
   Database: motto
   Region: Oregon (same as web service)
   Plan: Free (for testing)
   ```
3. Copy the **Internal Database URL** (we'll use this)

### 1.5 Set Environment Variables

In your Web Service settings, go to **"Environment"** and add:

**Required Variables:**
```
SECRET_KEY=your-generated-secret-key-here
DATABASE_URL=postgresql://... (use Internal Database URL from PostgreSQL service)
ENVIRONMENT=production
API_VERSION=v1
PYTHON_VERSION=3.11
```

**For Mobile Apps (Important!):**
```
ALLOWED_ORIGINS=*
CORS_ORIGINS=*
```

**Optional (for monitoring):**
```
SENTRY_DSN=your-sentry-dsn-here (if using Sentry)
```

**Generate Secret Key:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 1.6 Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Build your service
   - Run database migrations
   - Start the service
3. Wait for deployment (2-5 minutes)
4. Copy your service URL (e.g., `motto-backend.onrender.com`)

---

## 📱 Step 2: Configure iOS App

### 2.1 Update API Configuration

**For React Native iOS:**

1. **Create/Update `.env` file** (in project root):
   ```env
   API_BASE_URL=https://motto-backend.onrender.com
   API_URL=https://motto-backend.onrender.com
   ```

2. **Update API Config** (`src/config/api.ts`):
   ```typescript
   const getApiBaseUrl = (): string => {
     // Check environment variable first
     if (process.env.API_BASE_URL) {
       return process.env.API_BASE_URL;
     }
     
     // For production (Render)
     return __DEV__ 
       ? 'http://localhost:8000' 
       : 'https://motto-backend.onrender.com';
   };
   ```

3. **Update `react-native.config.js`** (if exists):
   ```javascript
   module.exports = {
     env: {
       API_BASE_URL: 'https://motto-backend.onrender.com',
     },
   };
   ```

### 2.2 Configure iOS Build

1. **Update Info.plist** (`ios/Motto/Info.plist`):
   ```xml
   <key>API_BASE_URL</key>
   <string>https://motto-backend.onrender.com</string>
   ```

2. **For App Transport Security** (if needed):
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsArbitraryLoads</key>
     <false/>
     <key>NSExceptionDomains</key>
     <dict>
       <key>onrender.com</key>
       <dict>
         <key>NSIncludesSubdomains</key>
         <true/>
         <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
         <false/>
       </dict>
     </dict>
   </dict>
   ```

### 2.3 Build for Testing

1. **Test in Simulator**:
   ```bash
   npm run ios
   ```

2. **Build for TestFlight**:
   ```bash
   cd ios
   xcodebuild -workspace Motto.xcworkspace \
     -scheme Motto \
     -configuration Release \
     -archivePath build/Motto.xcarchive \
     archive
   
   # Upload to App Store Connect via Xcode
   ```

---

## 🤖 Step 3: Configure Android App

### 3.1 Update API Configuration

**For React Native Android:**

1. **Update `.env` file**:
   ```env
   API_BASE_URL=https://motto-backend.onrender.com
   ```

2. **Update `android/app/src/main/res/values/strings.xml`**:
   ```xml
   <resources>
     <string name="app_name">MOTTO</string>
     <string name="api_base_url">https://motto-backend.onrender.com</string>
   </resources>
   ```

3. **Update API Config** (same as iOS):
   ```typescript
   // src/config/api.ts - already configured
   ```

### 3.2 Configure Android Network Security

**Update `android/app/src/main/AndroidManifest.xml`**:
```xml
<application
  ...
  android:usesCleartextTraffic="false">
  
  <!-- Network Security Config -->
  <meta-data
    android:name="com.facebook.react.modules.network.NetworkSecurityConfig"
    android:resource="@xml/network_security_config" />
</application>
```

**Create `android/app/src/main/res/xml/network_security_config.xml`**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">onrender.com</domain>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>
```

### 3.3 Build for Testing

1. **Test in Emulator**:
   ```bash
   npm run android
   ```

2. **Build Release APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   
   # APK location: android/app/build/outputs/apk/release/app-release.apk
   ```

3. **Build Release AAB** (for Play Store):
   ```bash
   cd android
   ./gradlew bundleRelease
   
   # AAB location: android/app/build/outputs/bundle/release/app-release.aab
   ```

---

## ✅ Step 4: Verify Deployment

### 4.1 Backend Health Check

```bash
# Test health endpoint
curl https://motto-backend.onrender.com/health

# Expected response:
# {
#   "status": "healthy",
#   "database": {"status": "healthy"},
#   ...
# }
```

### 4.2 Test API from Mobile Apps

**In iOS Simulator/Device:**
1. Open app
2. Try chat functionality
3. Check console for API calls
4. Verify responses

**In Android Emulator/Device:**
1. Open app
2. Try chat functionality
3. Check Logcat for API calls
4. Verify responses

### 4.3 Test CORS (if testing from web)

```bash
curl -X OPTIONS https://motto-backend.onrender.com/api/chat \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

## 🔧 Step 5: Configure CORS for Mobile Apps

**Update backend CORS** (if needed):

In `backend/main_improved.py`, ensure CORS allows all origins:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing, use specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Set in Render environment:**
```
ALLOWED_ORIGINS=*
```

---

## 📊 Step 6: Monitor Your Deployment

### 6.1 Render Dashboard

- View logs in real-time
- Monitor service status
- Check metrics (CPU, memory, requests)

### 6.2 Health Monitoring

```bash
# Check health
curl https://motto-backend.onrender.com/health

# Check readiness
curl https://motto-backend.onrender.com/health/ready
```

### 6.3 Test Endpoints

```bash
# Test chat endpoint
curl -X POST https://motto-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from Render!", "userId": "test-user"}'
```

---

## 🐛 Troubleshooting

### Issue: App Can't Connect to API

**Fix:**
1. Verify API URL in app config
2. Check Render service is running (green status)
3. Test health endpoint in browser
4. Check CORS configuration

### Issue: CORS Errors

**Fix:**
1. Set `ALLOWED_ORIGINS=*` in Render environment
2. Update CORS middleware in backend
3. Redeploy service

### Issue: Database Connection Error

**Fix:**
1. Verify DATABASE_URL in Render environment
2. Use Internal Database URL (not External)
3. Check database is running

### Issue: Build Fails on Render

**Fix:**
1. Check build logs in Render dashboard
2. Verify requirements.txt has all dependencies
3. Check Python version matches (3.11)

---

## 📱 Quick Testing Checklist

- [ ] Backend deployed on Render
- [ ] Health check returns "healthy"
- [ ] Database connected
- [ ] API URL updated in iOS app
- [ ] API URL updated in Android app
- [ ] iOS app connects to API
- [ ] Android app connects to API
- [ ] Chat functionality works
- [ ] No CORS errors
- [ ] Error handling works

---

## 🚀 Next Steps

1. **Test Thoroughly**
   - Test all features with Render backend
   - Test on real devices (not just simulators)
   - Test offline mode

2. **Monitor Performance**
   - Check Render dashboard metrics
   - Monitor API response times
   - Watch for errors

3. **Prepare for App Stores**
   - Fix any issues found during testing
   - Optimize performance
   - Prepare store assets

---

## 📝 Environment Variables Summary

**Required for Render:**
```
SECRET_KEY=...
DATABASE_URL=postgresql://... (Internal URL)
ENVIRONMENT=production
API_VERSION=v1
PYTHON_VERSION=3.11
ALLOWED_ORIGINS=*
```

**For Mobile Apps:**
```
API_BASE_URL=https://motto-backend.onrender.com
```

---

**Deployment Time**: ~15 minutes  
**Cost**: Free tier available  
**Status**: ✅ Ready for iOS & Android Testing

**Your Render URL**: `https://motto-backend.onrender.com`

---

**Last Updated**: $(date)  
**Platform**: Render  
**Mobile Support**: iOS ✅ | Android ✅

