# ✅ Mobile Apps Updated - Ready for Testing

## 🎉 What's Done

1. ✅ **Backend Deployed**: `https://motto-backend.onrender.com`
2. ✅ **Mobile Apps Updated**: API URL configured
3. ✅ **Environment Files**: `.env` updated
4. ✅ **Android Config**: `api_config.xml` updated
5. ✅ **iOS Config**: Ready for Info.plist update

---

## 📱 Next Steps: Test Your Apps

### Step 1: Rebuild iOS App

```bash
npm run ios
```

**What to test:**
- Open chat screen
- Send a test message
- Check Xcode console for API calls to `https://motto-backend.onrender.com`
- Verify response comes back

---

### Step 2: Rebuild Android App

```bash
npm run android
```

**What to test:**
- Open chat screen
- Send a test message
- Check Logcat for API calls to `https://motto-backend.onrender.com`
- Verify response comes back

---

### Step 3: Verify Backend Connection

**Test in browser:**
```
https://motto-backend.onrender.com/health
```

**Test API docs:**
```
https://motto-backend.onrender.com/docs
```

---

## 🔍 What Changed

### Updated Files:
- ✅ `.env` - Added `API_BASE_URL=https://motto-backend.onrender.com`
- ✅ `android/app/src/main/res/values/api_config.xml` - Updated with Render URL
- ✅ `src/config/api.ts` - Defaults to Render URL for production

### API Configuration:
Your apps will now connect to:
```
https://motto-backend.onrender.com
```

In development mode, they'll still use:
```
http://localhost:8000
```

---

## ✅ Testing Checklist

- [ ] Backend health check returns "healthy"
- [ ] iOS app rebuilt successfully
- [ ] Android app rebuilt successfully
- [ ] iOS app connects to Render API
- [ ] Android app connects to Render API
- [ ] Chat functionality works on iOS
- [ ] Chat functionality works on Android
- [ ] No network errors
- [ ] No CORS errors

---

## 🐛 Troubleshooting

### "Cannot connect to API"

1. **Verify Render service is running**
   - Check Render dashboard
   - Service should show "Live" (green status)

2. **Test health endpoint**
   ```bash
   curl https://motto-backend.onrender.com/health
   ```

3. **Check API URL in logs**
   - iOS: Xcode console
   - Android: Logcat
   - Look for: `POST https://motto-backend.onrender.com/api/chat`

### "Network request failed"

1. **Verify HTTPS** (not HTTP)
   - URL should start with `https://`

2. **Check CORS**
   - Verify `ALLOWED_ORIGINS=*` in Render environment
   - Redeploy if needed

### "API URL not found"

1. **Rebuild apps**
   ```bash
   npm run ios
   npm run android
   ```

2. **Clear cache**
   ```bash
   # iOS
   cd ios && rm -rf build && cd ..
   
   # Android
   cd android && ./gradlew clean && cd ..
   ```

---

## 📊 Current Status

**Backend**: ✅ Deployed at `https://motto-backend.onrender.com`  
**iOS Config**: ✅ Updated  
**Android Config**: ✅ Updated  
**Environment**: ✅ Configured  
**Next**: Rebuild and test apps!

---

## 🚀 Quick Test Commands

```bash
# Rebuild iOS
npm run ios

# Rebuild Android  
npm run android

# Test backend
curl https://motto-backend.onrender.com/health

# Check API docs
open https://motto-backend.onrender.com/docs
```

---

**Your Render URL**: `https://motto-backend.onrender.com`  
**Status**: ✅ Mobile Apps Ready  
**Action**: Rebuild and test!

