# 🧪 Beta Testing Setup - Invite Testers

## Overview

This guide helps you set up beta testing so others can test MOTTO before public launch.

---

## 📱 iOS: TestFlight Setup

### Step 1: Prepare for TestFlight

**1. Create App Store Connect Account** (if you don't have one)
- Go to https://appstoreconnect.apple.com
- Sign in with Apple ID
- Accept agreements

**2. Create App Listing**
- Click "My Apps" → "+" → "New App"
- Fill in:
  ```
  Platform: iOS
  Name: MOTTO
  Primary Language: English
  Bundle ID: com.yourcompany.motto (must match your app)
  SKU: motto-ios-001
  User Access: Full Access
  ```

**3. Prepare Build**
```bash
cd ios
# Archive for App Store
xcodebuild -workspace Motto.xcworkspace \
  -scheme Motto \
  -configuration Release \
  -archivePath build/Motto.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/Motto.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist
```

### Step 2: Upload to TestFlight

**Option A: Using Xcode (Easiest)**
1. Open Xcode
2. Product → Archive
3. Window → Organizer
4. Select archive
5. Click "Distribute App"
6. Choose "App Store Connect"
7. Follow prompts
8. Upload

**Option B: Using Transporter App**
1. Download "Transporter" from Mac App Store
2. Export .ipa file
3. Drag into Transporter
4. Upload

### Step 3: Add Testers

**1. Internal Testing (Up to 100 testers - fastest)**
- App Store Connect → Your App → TestFlight
- Click "+" next to Internal Testing
- Add testers by email (they must accept invitation)
- Select build to test
- Click "Submit for Review" (usually approved in hours)

**2. External Testing (Up to 10,000 testers)**
- App Store Connect → TestFlight → External Testing
- Click "+" to create group
- Add testers
- Submit for Beta App Review (can take 24-48 hours)

### Step 4: Share TestFlight Link

Once approved, you'll get:
```
https://testflight.apple.com/join/XXXXXXXX
```

Share this link with testers!

---

## 🤖 Android: Google Play Internal Testing

### Step 1: Prepare for Play Console

**1. Create Google Play Developer Account**
- Go to https://play.google.com/console
- Pay $25 one-time fee
- Complete account setup

**2. Create App Listing**
- Click "Create app"
- Fill in:
  ```
  App name: MOTTO
  Default language: English
  App type: App
  Free or paid: Free
  ```

**3. Prepare Build (AAB format)**
```bash
cd android
./gradlew bundleRelease

# AAB file location:
# android/app/build/outputs/bundle/release/app-release.aab
```

### Step 2: Upload to Internal Testing

**1. Create Release**
- Play Console → Your App → Testing → Internal testing
- Click "Create new release"
- Upload AAB file
- Add release notes
- Click "Save"

**2. Add Testers**

**Option A: Email List (Up to 100 testers)**
- Create tester list
- Add tester emails
- Copy opt-in link to share

**Option B: Internal Testing Link**
- Get testing link (looks like):
  ```
  https://play.google.com/apps/internaltest/XXXXXXXX
  ```
- Share this link - testers join automatically

### Step 3: Share Testing Link

Once set up, share:
```
https://play.google.com/apps/internaltest/XXXXXXXX
```

---

## 📝 Quick Setup Comparison

| Platform | Setup Time | Max Testers | Review Time |
|----------|------------|-------------|-------------|
| **iOS TestFlight Internal** | 1-2 hours | 100 | Hours |
| **iOS TestFlight External** | 1-2 hours | 10,000 | 24-48 hours |
| **Android Internal** | 30 min | 100+ | Immediate |

---

## 🎯 Recommended Approach

**For Quick Testing (This Week):**
1. **iOS**: TestFlight Internal (100 testers, fast approval)
2. **Android**: Internal Testing (100+ testers, immediate)

**For Larger Beta (Before Launch):**
1. **iOS**: TestFlight External (up to 10K, needs review)
2. **Android**: Closed Testing Track (unlimited, needs review)

---

## 📧 Inviting Testers

### Email Template

```
Subject: Test MOTTO - Beta Testing Invitation

Hi [Name],

I'd like to invite you to test MOTTO, my new AI assistant app!

iOS Testers:
Download TestFlight and use this link:
https://testflight.apple.com/join/XXXXXXXX

Android Testers:
Click this link to join testing:
https://play.google.com/apps/internaltest/XXXXXXXX

What to Test:
- Chat functionality
- AI responses
- Personalization features
- Any bugs or issues

Feedback:
Please share your thoughts at: [feedback link]

Thanks for helping test MOTTO!

[Your Name]
```

---

## ✅ Beta Testing Checklist

**Before Inviting Testers:**
- [ ] iOS build uploaded to TestFlight
- [ ] Android build uploaded to Play Console
- [ ] Testing links ready
- [ ] Tester guide created
- [ ] Feedback system set up
- [ ] Backend is stable
- [ ] Critical bugs fixed

**During Testing:**
- [ ] Monitor crash reports
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Communicate with testers
- [ ] Update builds as needed

---

## 📊 Feedback Collection

### Option 1: Simple Form

Create Google Form with:
- Tester name/email
- Device/OS version
- What worked well
- Issues/bugs found
- Overall rating
- Additional comments

### Option 2: In-App Feedback

Add feedback button in app that:
- Opens feedback form
- Captures app version
- Captures device info
- Sends to your email/backend

### Option 3: GitHub Issues

Create private GitHub repo for beta testers
- They can report issues
- You can track bugs
- Collaborative feedback

---

**Next Steps**: Follow iOS or Android setup below! 🚀

