# 🧪 Start Testing MOTTO - Complete Guide

## Quick Start Testing (5 Minutes)

### Step 1: Verify Backend is Running (1 min)

**Test in Browser:**
1. Open: https://motto-backend.onrender.com/health
2. Should show JSON with `"status": "healthy"`

**Or use Terminal:**
```bash
curl https://motto-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": {"status": "healthy"},
  ...
}
```

### Step 2: Test API Documentation (1 min)

1. Open: https://motto-backend.onrender.com/docs
2. You'll see interactive API documentation
3. Try the `/api/chat` endpoint:
   - Click "Try it out"
   - Enter test message
   - Click "Execute"

---

## 📱 Testing Mobile Apps

### iOS Testing

**1. Start iOS App:**
```bash
npm run ios
```

**2. What to Test:**
- ✅ App launches successfully
- ✅ Chat screen opens
- ✅ Type a message: "Hello MOTTO"
- ✅ Send message
- ✅ Wait for response
- ✅ Check for errors in Xcode console

**3. Check Logs (Xcode Console):**
Look for:
```
[API] POST https://motto-backend.onrender.com/api/chat
[API] Response: 200 OK
```

---

### Android Testing

**1. Start Android App:**
```bash
npm run android
```

**2. What to Test:**
- ✅ App launches successfully
- ✅ Chat screen opens
- ✅ Type a message: "Hello MOTTO"
- ✅ Send message
- ✅ Wait for response
- ✅ Check for errors in Logcat

**3. Check Logs (Logcat):**
Look for:
```
API: POST https://motto-backend.onrender.com/api/chat
API: Response 200
```

---

## ✅ Testing Checklist

### Backend Tests
- [ ] Health endpoint returns "healthy"
- [ ] API docs accessible at `/docs`
- [ ] Database connected
- [ ] No errors in Render logs

### iOS App Tests
- [ ] App builds successfully
- [ ] App launches
- [ ] Chat screen loads
- [ ] Can send messages
- [ ] Receives responses
- [ ] No connection errors
- [ ] API calls show in console

### Android App Tests
- [ ] App builds successfully
- [ ] App launches
- [ ] Chat screen loads
- [ ] Can send messages
- [ ] Receives responses
- [ ] No connection errors
- [ ] API calls show in Logcat

---

## 🎯 Specific Features to Test

### 1. Basic Chat
```
Test: Send "Hello"
Expected: Receive a response from MOTTO
```

### 2. Context Memory
```
Test: 
1. Say "My name is John"
2. Say "What's my name?"
Expected: MOTTO remembers you said "John"
```

### 3. Multilingual
```
Test: Send message in Spanish: "Hola, ¿cómo estás?"
Expected: MOTTO responds appropriately
```

### 4. Personalization
```
Test: Send multiple messages
Expected: Responses become more personalized over time
```

### 5. Offline Mode
```
Test:
1. Disable WiFi/cellular
2. Try to send message
Expected: Offline indicator or cached response
```

---

## 🔍 How to Monitor

### Backend Monitoring

**Render Dashboard:**
1. Go to https://dashboard.render.com
2. Click on your service
3. View:
   - Logs (real-time)
   - Metrics (CPU, memory, requests)
   - Events

**Health Endpoints:**
```bash
# Overall health
curl https://motto-backend.onrender.com/health

# Liveness (for Kubernetes)
curl https://motto-backend.onrender.com/health/live

# Readiness
curl https://motto-backend.onrender.com/health/ready
```

### Mobile App Monitoring

**iOS (Xcode):**
1. Open Xcode
2. View Console (Cmd+Shift+Y)
3. Filter for "API" or "motto-backend"
4. Watch for errors

**Android (Logcat):**
```bash
# View logs
adb logcat | grep -i motto
# or
adb logcat | grep -i api
```

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Network request failed"

**Quick Fix:**
1. Check Render service is "Live" (green in dashboard)
2. Verify URL: `https://motto-backend.onrender.com` (not http)
3. Test health endpoint in browser
4. Rebuild app: `npm run ios` or `npm run android`

### Issue: "Cannot connect to backend"

**Quick Fix:**
1. Wait 2-3 minutes (Render may be spinning up)
2. Check Render logs for errors
3. Verify environment variables are set
4. Test health endpoint manually

### Issue: App crashes on launch

**Quick Fix:**
```bash
# Clear caches and rebuild
npm run ios -- --reset-cache
# or
npm run android
```

### Issue: No response from MOTTO

**Quick Fix:**
1. Check Render logs for API errors
2. Verify database is connected
3. Check API endpoint: `/api/chat`
4. Look for error messages in app logs

---

## 📊 Testing Scenarios

### Scenario 1: First Time User
1. Launch app
2. Open chat
3. Send: "Hi, I'm new here"
4. ✅ Verify: Friendly welcome response

### Scenario 2: Returning User
1. Send: "Remember when I said I like Python?"
2. Send: "Tell me more"
3. ✅ Verify: Context is maintained

### Scenario 3: Feature Testing
1. Test voice input (if available)
2. Test multilingual support
3. Test personalization features
4. Test offline mode

### Scenario 4: Error Handling
1. Turn off network
2. Try to send message
3. ✅ Verify: Graceful error handling
4. Turn network back on
5. ✅ Verify: Auto-reconnects

---

## 🚀 Quick Commands

```bash
# Test backend health
curl https://motto-backend.onrender.com/health

# Test iOS
npm run ios

# Test Android
npm run android

# View Render logs (if using CLI)
# Or check dashboard

# Test API endpoint directly
curl -X POST https://motto-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test-user"}'
```

---

## ✅ Success Criteria

Your MOTTO is working correctly if:

1. ✅ Backend responds to health checks
2. ✅ Mobile apps launch without errors
3. ✅ Chat messages send successfully
4. ✅ Responses come back from MOTTO
5. ✅ No network errors in logs
6. ✅ Context/personalization works
7. ✅ Offline mode works (if tested)

---

## 📝 Testing Log Template

```
Date: ___________
Tester: ___________
Platform: iOS / Android / Both

✅ Backend Health: PASS / FAIL
✅ iOS Launch: PASS / FAIL
✅ Android Launch: PASS / FAIL
✅ Chat Functionality: PASS / FAIL
✅ Response Quality: PASS / FAIL

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

## 🎯 Start Testing Now!

**Step 1:** Verify backend
```bash
curl https://motto-backend.onrender.com/health
```

**Step 2:** Test iOS
```bash
npm run ios
```

**Step 3:** Test Android
```bash
npm run android
```

**Step 4:** Test chat functionality in both apps

**Step 5:** Report any issues or celebrate success! 🎉

---

**Backend URL**: `https://motto-backend.onrender.com`  
**Status**: ✅ Ready for Testing  
**Next**: Follow the steps above to start testing!

