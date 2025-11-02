# Update Mobile Apps with Render URL

## After Render Deployment

Once you have your Render URL (e.g., `https://motto-backend.onrender.com`), follow these steps:

---

## 📱 Step 1: Update API Configuration

### Option A: Using Environment Variable (Recommended)

Create/Update `.env` file in project root:

```env
# Production API URL (your Render URL)
API_BASE_URL=https://motto-backend.onrender.com
REACT_NATIVE_API_URL=https://motto-backend.onrender.com
RENDER_API_URL=https://motto-backend.onrender.com

# Environment
NODE_ENV=production
```

### Option B: Update Directly in Code

The API config (`src/config/api.ts`) is already set up to use:
1. Environment variable first
2. Render URL as default for production

Just make sure your `.env` file has the Render URL.

---

## 🍎 Step 2: Update iOS App

### 2.1 Update Info.plist

Add to `ios/Motto/Info.plist`:

```xml
<key>API_BASE_URL</key>
<string>https://motto-backend.onrender.com</string>
```

### 2.2 Test Connection

```bash
# Rebuild iOS app
npm run ios

# Or build for device
cd ios
xcodebuild -workspace Motto.xcworkspace -scheme Motto
```

### 2.3 Verify

In your app, test:
- Open chat screen
- Send a message
- Check console logs for API calls to your Render URL

---

## 🤖 Step 3: Update Android App

### 3.1 Update API Config

The file `android/app/src/main/res/values/api_config.xml` is already created with Render URL.

### 3.2 Update AndroidManifest.xml (if needed)

Make sure network security is configured (already done in `network_security_config.xml`).

### 3.3 Test Connection

```bash
# Rebuild Android app
npm run android

# Or build release APK
cd android
./gradlew assembleRelease
```

### 3.4 Verify

In your app, test:
- Open chat screen
- Send a message
- Check Logcat for API calls to your Render URL

---

## 🔍 Step 4: Verify Connection

### Test from App

1. **Open your app** (iOS or Android)
2. **Navigate to chat screen**
3. **Send a test message**
4. **Check logs:**
   - iOS: Xcode console
   - Android: Logcat
   - Look for API calls to your Render URL

### Expected Logs

```
[API] POST https://motto-backend.onrender.com/api/chat
[API] Response: 200 OK
```

---

## ✅ Quick Verification Checklist

- [ ] Render backend deployed and healthy
- [ ] Render URL copied (e.g., `https://motto-backend.onrender.com`)
- [ ] `.env` file updated with Render URL
- [ ] iOS app rebuilt and tested
- [ ] Android app rebuilt and tested
- [ ] API calls working in both apps
- [ ] Chat functionality working
- [ ] No CORS errors
- [ ] No network errors

---

## 🐛 Common Issues

### Issue: "Network request failed"

**Fix:**
1. Verify Render service is running (check dashboard)
2. Test health endpoint in browser
3. Check API URL is correct
4. Verify network security config

### Issue: "CORS error"

**Fix:**
1. Verify `ALLOWED_ORIGINS=*` in Render environment
2. Check CORS middleware in backend code
3. Redeploy backend if needed

### Issue: "Cannot connect to API"

**Fix:**
1. Check Render URL is correct
2. Verify HTTPS (not HTTP)
3. Test health endpoint manually
4. Check Render service status

---

## 📝 Configuration Summary

**Backend (Render):**
- URL: `https://motto-backend.onrender.com` (your unique URL)
- Health: `https://motto-backend.onrender.com/health`
- Docs: `https://motto-backend.onrender.com/docs`

**Mobile Apps:**
- API Config: `src/config/api.ts`
- Environment: `.env` file
- iOS: `ios/Motto/Info.plist`
- Android: `android/app/src/main/res/values/api_config.xml`

---

**After updating, rebuild your apps and test!**

