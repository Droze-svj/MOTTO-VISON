# 🚀 Update Mobile Apps - Quick Guide

## Step 1: Get Your Render URL

Your Render service URL should look like:
```
https://motto-backend.onrender.com
```
(or similar, based on your service name)

**Find it in:**
- Render Dashboard → Your Web Service → "Settings" tab → Look for "URL"

---

## Step 2: Update Mobile Apps Automatically

### Option A: Use the Script (Easiest)

Replace `YOUR_RENDER_URL` with your actual URL:

```bash
./scripts/update-mobile-api-url.sh https://YOUR_RENDER_URL.onrender.com
```

**Example:**
```bash
./scripts/update-mobile-api-url.sh https://motto-backend.onrender.com
```

This automatically updates:
- ✅ `.env` file
- ✅ iOS `Info.plist`
- ✅ Android `api_config.xml`

---

### Option B: Manual Update

**1. Update `.env` file** (create if doesn't exist):

```env
API_BASE_URL=https://your-render-url.onrender.com
REACT_NATIVE_API_URL=https://your-render-url.onrender.com
RENDER_API_URL=https://your-render-url.onrender.com
```

**2. Rebuild apps:**
```bash
npm run ios
npm run android
```

---

## Step 3: Verify Backend is Working

Test your Render service:

```bash
# Replace with your actual URL
curl https://your-render-url.onrender.com/health
```

**Should return:**
```json
{
  "status": "healthy",
  "database": {"status": "healthy"},
  ...
}
```

Or open in browser:
```
https://your-render-url.onrender.com/docs
```

---

## Step 4: Test Mobile Apps

### iOS:
```bash
npm run ios
```

### Android:
```bash
npm run android
```

### What to Test:
1. Open chat screen
2. Send a test message
3. Check console/logs for API calls to your Render URL
4. Verify response comes back

---

## ✅ Checklist

- [ ] Render URL copied
- [ ] Mobile apps updated (script or manual)
- [ ] `.env` file updated
- [ ] iOS app rebuilt
- [ ] Android app rebuilt
- [ ] Health check works
- [ ] Apps connect successfully
- [ ] Chat functionality works

---

## 🐛 Troubleshooting

### "Cannot connect to API"
- Verify Render URL is correct
- Check Render service is "Live" (green status)
- Test health endpoint in browser
- Check network connectivity

### "Network request failed"
- Verify HTTPS (not HTTP) in URL
- Check CORS_ORIGINS=* is set in Render
- Rebuild apps after updating URL

### "API URL not found"
- Verify `.env` file exists and has correct URL
- Check API config file is updated
- Rebuild apps

---

**Share your Render URL and I'll help you update everything! 🚀**

