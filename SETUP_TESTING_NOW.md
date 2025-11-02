# 🚀 Setup MOTTO Testing - Action Plan

## Choose Your Platform

**Fastest Option:** Android Internal Testing (30 min)  
**Most Control:** iOS TestFlight (1-2 hours)  
**Best:** Both! (Start with Android, then iOS)

---

## Option A: Android First (Recommended - Fastest)

### ✅ Step 1: Create Google Play Developer Account

1. Go to: https://play.google.com/console
2. Click **"Start"** → Create account
3. Pay $25 one-time fee
4. Complete account setup

**Time:** 15-20 minutes

### ✅ Step 2: Create App in Play Console

1. Click **"Create app"**
2. Fill in:
   ```
   App name: MOTTO
   Default language: English
   App type: App
   Free or paid: Free
   ```
3. Click **"Create app"**

**Time:** 5 minutes

### ✅ Step 3: Build Android Release

Run this command:

```bash
cd android
./gradlew bundleRelease
```

This creates: `android/app/build/outputs/bundle/release/app-release.aab`

**Time:** 5-10 minutes

### ✅ Step 4: Upload to Play Console

1. Play Console → Your App → **Testing** → **Internal testing**
2. Click **"Create new release"**
3. Click **"Upload"** → Select `app-release.aab`
4. Add release notes:
   ```
   Beta version for testing
   - Initial release
   - Backend: https://motto-backend.onrender.com
   ```
5. Click **"Save"**

**Time:** 5 minutes

### ✅ Step 5: Create Tester List & Get Link

1. **Testing** → **Internal testing** → **Testers** tab
2. Click **"Create list"**
3. Name: "Beta Testers"
4. Add tester emails (optional - can do later)
5. Click **"Testers"** → Copy the **"Opt-in URL"**

**Link looks like:**
```
https://play.google.com/apps/internaltest/XXXXXXXX
```

**Time:** 3 minutes

### ✅ Step 6: Share with Testers!

Send them the link - they can install immediately!

**Total Time:** 30-45 minutes ⚡

---

## Option B: iOS TestFlight

### ✅ Step 1: Apple Developer Account

1. Go to: https://developer.apple.com
2. Sign in (or create account)
3. Enroll in Apple Developer Program ($99/year)

**Time:** 30 minutes (if new account)

### ✅ Step 2: Create App in App Store Connect

1. Go to: https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   ```
   Platform: iOS
   Name: MOTTO
   Primary Language: English
   Bundle ID: com.yourcompany.motto  (must match your app)
   SKU: motto-ios-001
   ```
4. Click **"Create"**

**Time:** 10 minutes

### ✅ Step 3: Build for TestFlight

Run the build script:

```bash
./scripts/build-ios-testflight.sh
```

Or manually in Xcode:
1. Open `ios/MOTTOVISON.xcworkspace`
2. Product → Archive
3. Wait for archive

**Time:** 10-15 minutes

### ✅ Step 4: Upload to TestFlight

**Via Xcode:**
1. Window → Organizer
2. Select archive
3. Click **"Distribute App"**
4. Choose **"App Store Connect"**
5. Follow prompts
6. Upload

**Time:** 10 minutes

### ✅ Step 5: Wait for Processing

- Processing takes 10-30 minutes
- Check App Store Connect → TestFlight tab

### ✅ Step 6: Set Up Testing

1. TestFlight → **Internal Testing**
2. Click **"+"** → Create group "Beta Testers"
3. Add tester emails
4. Select build
5. Click **"Start Testing"**

### ✅ Step 7: Get TestFlight Link

Copy the link:
```
https://testflight.apple.com/join/XXXXXXXX
```

**Total Time:** 1-2 hours

---

## 🎯 Recommended: Start with Android

**Why Android first:**
- ✅ Faster setup (30 min vs 2 hours)
- ✅ No waiting for review
- ✅ Immediate tester access
- ✅ Can start getting feedback today

**Then add iOS:**
- Set up iOS in parallel
- Testers on both platforms
- More comprehensive testing

---

## 📋 Pre-Flight Checklist

Before starting:
- [ ] Backend is running: https://motto-backend.onrender.com
- [ ] App builds successfully: `npm run android` or `npm run ios`
- [ ] No critical bugs
- [ ] API URL configured correctly

---

## 🚀 Let's Start Now!

**I'll help you execute each step. Choose:**

1. **Android** - Fastest path (start here!)
2. **iOS** - If you have Apple Developer account
3. **Both** - Comprehensive testing

**Which would you like to start with?** 🎯

