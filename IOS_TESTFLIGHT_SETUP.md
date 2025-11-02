# 📱 iOS TestFlight Setup - Step by Step

## Prerequisites

- ✅ Apple Developer Account ($99/year)
- ✅ App Store Connect access
- ✅ App configured with correct Bundle ID
- ✅ Backend deployed and working

---

## 🚀 Quick Setup (1-2 hours)

### Step 1: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in details:
   ```
   Platform: iOS
   Name: MOTTO
   Primary Language: English
   Bundle ID: [select your bundle ID]
   SKU: motto-ios-001
   User Access: Full Access
   ```
4. Click **"Create"**

### Step 2: Prepare Build

**Method 1: Using Xcode (Recommended)**

1. Open `ios/Motto.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → **Archive**
4. Wait for archive to complete
5. Window → **Organizer** (opens automatically)
6. Select your archive
7. Click **"Distribute App"**
8. Choose **"App Store Connect"**
9. Click **"Next"** → **"Upload"**
10. Wait for upload (5-10 minutes)

**Method 2: Using Command Line**

```bash
cd ios

# Archive
xcodebuild archive \
  -workspace Motto.xcworkspace \
  -scheme Motto \
  -configuration Release \
  -archivePath build/Motto.xcarchive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/Motto.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist
```

### Step 3: Set Up TestFlight Internal Testing

1. Go to App Store Connect → Your App
2. Click **"TestFlight"** tab
3. Wait for build to process (10-30 minutes)
4. Once processed, click **"Internal Testing"**
5. Click **"+"** to create group
6. Name it: "Beta Testers"

### Step 4: Add Testers

**Add Testers:**
1. In TestFlight → Internal Testing
2. Click **"Add Testers"**
3. Enter tester emails (one per line):
   ```
   tester1@example.com
   tester2@example.com
   tester3@example.com
   ```
4. Click **"Add"**

**Select Build:**
1. Click **"Select Build"**
2. Choose your uploaded build
3. Click **"Start Testing"**

### Step 5: Invite Testers

**Testers Receive:**
- Email invitation from Apple
- Link to download TestFlight app
- Access to your beta app

**Or Share Link:**
1. TestFlight → Internal Testing → Group
2. Copy **"Public Link"** (if enabled)
3. Share link with testers

**Link format:**
```
https://testflight.apple.com/join/XXXXXXXX
```

---

## 📋 Requirements Checklist

Before uploading:
- [ ] Bundle ID matches App Store Connect
- [ ] Version number incremented
- [ ] Build number unique
- [ ] API URL points to production (Render)
- [ ] App icons and screenshots ready
- [ ] Privacy policy URL (required)
- [ ] Signing certificates valid

---

## ⚙️ Configuration Needed

### Info.plist Updates

Make sure `ios/Motto/Info.plist` has:
```xml
<key>CFBundleIdentifier</key>
<string>com.yourcompany.motto</string>

<key>CFBundleVersion</key>
<string>1</string>

<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
```

### API Configuration

Ensure production API URL:
```env
API_BASE_URL=https://motto-backend.onrender.com
```

---

## 🎯 External Testing (For More Testers)

If you need more than 100 testers:

1. **Create External Group**
   - TestFlight → External Testing
   - Click "+" → Create new group
   - Name: "Public Beta"

2. **Add Build**
   - Select your build
   - Add release notes

3. **Submit for Beta App Review**
   - Fill in:
     - What to test
     - Feedback instructions
     - Contact info
   - Submit (takes 24-48 hours)

4. **Share Public Link**
   - Once approved, get public link
   - Share with up to 10,000 testers

---

## ✅ Testing Checklist

**Before Inviting:**
- [ ] Build uploaded successfully
- [ ] Build processed (no errors)
- [ ] Internal testing group created
- [ ] Testers added
- [ ] Build selected for testing

**Test Links Ready:**
- [ ] TestFlight link obtained
- [ ] Tester instructions ready
- [ ] Feedback form created

---

## 🐛 Troubleshooting

### Build Processing Fails

**Common Issues:**
- Missing compliance: Add export compliance info
- Invalid bundle: Check Bundle ID matches
- Missing icons: Add app icons
- Missing screenshots: Add required screenshots

### Testers Can't Install

**Fix:**
- Ensure build is processed
- Check tester accepted email invitation
- Verify tester has TestFlight app installed
- Check iOS version compatibility

### Build Rejected

**Common Reasons:**
- Crashes on launch
- Missing privacy policy
- Violates guidelines
- Check email for specific reasons

---

## 📧 Invitation Email Template

```
Subject: Invitation to Test MOTTO on iOS

Hi [Name],

I'd like to invite you to beta test MOTTO on iOS!

To join:
1. Install TestFlight from App Store
2. Click this link: https://testflight.apple.com/join/XXXXXXXX
3. Or accept the email invitation from Apple

What to Test:
- Chat functionality
- AI responses and personalization
- Overall user experience
- Report any bugs or issues

Feedback:
Please share your thoughts at: [your feedback link]

Thanks for helping make MOTTO better!

[Your Name]
```

---

## 🎉 Success!

Once set up:
- Testers receive invitation
- They install via TestFlight
- They can test your app
- You get crash reports and feedback
- Updates are easy (just upload new build)

**Time to First Testers**: 1-2 hours  
**Max Internal Testers**: 100  
**Review Time**: Usually within hours

---

**Next**: Set up Android testing or start inviting testers!

