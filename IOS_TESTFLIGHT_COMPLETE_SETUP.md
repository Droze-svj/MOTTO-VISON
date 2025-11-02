# 🎯 Complete iOS TestFlight Setup with Feedback & Auto-Updates

## Overview

This guide sets up:
- ✅ TestFlight beta testing
- ✅ In-app feedback collection
- ✅ Automatic update notifications
- ✅ Easy tester sharing

---

## 🚀 Quick Start

### Prerequisites Checklist

Before starting, you need:
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect access
- [ ] Xcode installed
- [ ] CocoaPods installed
- [ ] Backend deployed (for feedback)

---

## Step 1: Initial App Store Connect Setup

### 1.1 Create App Listing

1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   ```
   Platform: iOS
   Name: MOTTO
   Primary Language: English
   Bundle ID: com.yourcompany.motto  (must match your app)
   SKU: motto-ios-001
   User Access: Full Access
   ```
4. Click **"Create"**

### 1.2 Complete App Information

Go to your app → **"App Information"**:
- Upload app icon (1024x1024)
- Add screenshots (required for TestFlight)
- Add privacy policy URL (required)
- Set up categories

---

## Step 2: Configure Your iOS Project

### 2.1 Update Bundle Identifier

1. Open `ios/MOTTOVISON.xcworkspace` in Xcode
2. Select project → Target "MOTTOVISON"
3. General tab → **Bundle Identifier**
4. Set to: `com.yourcompany.motto` (match App Store Connect)

### 2.2 Update Version Info

The build script will auto-update these, but verify:
- **Version**: `1.0.0` (from package.json)
- **Build**: Auto-generated timestamp

---

## Step 3: Set Up Signing

### 3.1 Automatic Signing (Recommended)

1. In Xcode → Target → **"Signing & Capabilities"**
2. Check **"Automatically manage signing"**
3. Select your Team (Apple Developer account)
4. Xcode will generate certificates automatically

### 3.2 Manual Signing (If Needed)

- Create Distribution Certificate in Apple Developer Portal
- Create App Store Provisioning Profile
- Download and install both

---

## Step 4: Build Script Setup

### 4.1 Make Script Executable

```bash
chmod +x scripts/build-ios-testflight.sh
```

### 4.2 Update ExportOptions.plist

Edit `ios/ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

Replace `YOUR_TEAM_ID` with your Apple Developer Team ID (find in App Store Connect).

---

## Step 5: First Build & Upload

### 5.1 Build for TestFlight

```bash
./scripts/build-ios-testflight.sh
```

This will:
- ✅ Clean build folder
- ✅ Install pods
- ✅ Bundle JavaScript
- ✅ Update version info
- ✅ Create archive
- ✅ Export IPA

### 5.2 Upload to App Store Connect

**Option A: Using Xcode (Easiest)**

1. Open Xcode
2. **Window** → **Organizer**
3. Select your archive
4. Click **"Distribute App"**
5. Choose **"App Store Connect"**
6. Follow prompts
7. Upload

**Option B: Using Transporter**

1. Download "Transporter" from Mac App Store
2. Drag `.ipa` file into Transporter
3. Click **"Deliver"**

**Option C: Using Command Line**

```bash
xcrun altool --upload-app \
    --type ios \
    --file ios/build/export/MOTTOVISON.ipa \
    --apiKey "$APP_STORE_CONNECT_API_KEY" \
    --apiIssuer "$APP_STORE_CONNECT_ISSUER_ID"
```

---

## Step 6: Set Up TestFlight

### 6.1 Wait for Processing

After upload:
- Processing takes 10-30 minutes
- Check App Store Connect → **TestFlight** tab
- Wait for status to show "Ready to Submit"

### 6.2 Create Internal Testing Group

1. App Store Connect → Your App → **TestFlight**
2. Click **"Internal Testing"**
3. Click **"+"** → Create group
4. Name: "Beta Testers"

### 6.3 Add Testers

1. In your testing group
2. Click **"Add Testers"**
3. Enter emails (one per line):
   ```
   tester1@example.com
   tester2@example.com
   tester3@example.com
   ```
4. Click **"Add"**

### 6.4 Add Build to Testing

1. Click **"Select Build"**
2. Choose your processed build
3. Add release notes:
   ```
   Beta version for testing
   - Initial TestFlight release
   - Feedback collection enabled
   ```
4. Click **"Start Testing"**

### 6.5 Get TestFlight Link

1. In your testing group
2. Enable **"Public Link"** (optional)
3. Copy the link:
   ```
   https://testflight.apple.com/join/XXXXXXXX
   ```

---

## Step 7: Add Feedback to Backend

### 7.1 Add Feedback Endpoint

Add to your `backend/main_improved.py`:

```python
from feedback_endpoint import router as feedback_router
from updates_endpoint import router as updates_router

app.include_router(feedback_router)
app.include_router(updates_router)
```

### 7.2 Update TestFlight URL

Edit `backend/updates_endpoint.py`:
```python
TESTFLIGHT_URL = "https://testflight.apple.com/join/XXXXXXXX"  # Your actual link
```

### 7.3 Deploy Backend Changes

```bash
# Test locally first
cd backend
uvicorn main_improved:app --reload

# Then deploy to Render
git add .
git commit -m "Add feedback and updates endpoints"
git push
```

---

## Step 8: Integrate Feedback in App

### 8.1 Add Feedback Button

Add to your main screen (e.g., `src/screens/ChatScreen.tsx`):

```typescript
import { FeedbackModal } from '../components/FeedbackModal';
import { useState } from 'react';

// In your component:
const [feedbackVisible, setFeedbackVisible] = useState(false);

// Add button in your UI:
<TouchableOpacity onPress={() => setFeedbackVisible(true)}>
  <Text>Send Feedback</Text>
</TouchableOpacity>

<FeedbackModal
  visible={feedbackVisible}
  onClose={() => setFeedbackVisible(false)}
/>
```

### 8.2 Add Update Checking

Add to your `App.tsx` or main component:

```typescript
import { updateService } from './services/UpdateService';
import { useEffect } from 'react';

useEffect(() => {
  // Check for updates on app start
  updateService.checkAndNotify();
  
  // Also check periodically (every 24 hours)
  const interval = setInterval(() => {
    updateService.checkAndNotify();
  }, 24 * 60 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
```

---

## Step 9: Automatic Updates

### How It Works

1. **When you upload new build:**
   - Build script auto-increments build number
   - Upload to TestFlight
   - Process and add to testing group

2. **Testers get notified:**
   - TestFlight shows update available
   - In-app update checker also notifies
   - One tap to update in TestFlight

3. **Update checking:**
   - App checks on launch
   - Checks every 24 hours
   - Shows alert if update available

### Update Process Flow

```
1. You: Build new version → Upload to TestFlight
2. TestFlight: Processes build (10-30 min)
3. You: Add build to testing group
4. Testers: Receive notification in TestFlight
5. App: Checks for updates → Shows notification
6. Tester: Opens TestFlight → Updates with one tap
```

---

## Step 10: Sharing with Testers

### Email Template

```
Subject: 🧪 Test MOTTO on iOS - Beta Invitation

Hi [Name],

I'd like to invite you to beta test MOTTO on iOS!

To join:
1. Install TestFlight from App Store (free)
2. Click this link: https://testflight.apple.com/join/XXXXXXXX
3. Install MOTTO

Features to Test:
- Chat with MOTTO AI assistant
- Personalization features
- Overall user experience

Feedback:
Use the "Send Feedback" button in the app, or email me directly.

What's New:
- Beta version with feedback collection
- Automatic update notifications
- Bug fixes and improvements

Thanks for helping make MOTTO better!

[Your Name]
```

### Sharing Options

**Option 1: Public Link**
- Enable public link in TestFlight
- Share link directly (no email needed)
- Testers click and join

**Option 2: Email Invitations**
- TestFlight sends email automatically
- More personal
- Better for tracking

**Option 3: Both**
- Use public link for easy sharing
- Use email for official testers

---

## 🔄 Automatic Update Workflow

### When You Make Changes

1. **Make code changes**
2. **Update version** (optional - script auto-increments build):
   ```bash
   # Edit package.json version if needed
   # Build script will use it
   ```
3. **Build and upload:**
   ```bash
   ./scripts/build-ios-testflight.sh
   # Then upload via Xcode Organizer
   ```
4. **Add to TestFlight:**
   - Wait for processing
   - Add to testing group
   - Testers get notification
   - App checks and notifies
   - One-tap update in TestFlight

### Version Management

- **Version** (`1.0.0`): Increment for major/minor releases
- **Build** (auto): Timestamp-based, always unique

Example:
- Version `1.0.0`, Build `20241201120000`
- Version `1.0.0`, Build `20241201130000` (new build, same version)
- Version `1.1.0`, Build `20241202120000` (new version)

---

## ✅ Complete Checklist

**Setup:**
- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Bundle ID matches
- [ ] Signing configured
- [ ] ExportOptions.plist updated

**First Build:**
- [ ] Build script runs successfully
- [ ] Archive created
- [ ] IPA exported
- [ ] Uploaded to App Store Connect
- [ ] Build processed in TestFlight

**Testing Setup:**
- [ ] Internal testing group created
- [ ] Testers added
- [ ] Build added to group
- [ ] TestFlight link obtained

**App Integration:**
- [ ] Feedback endpoint added to backend
- [ ] Updates endpoint added to backend
- [ ] Backend deployed
- [ ] Feedback modal in app
- [ ] Update checking in app

**Sharing:**
- [ ] TestFlight link ready
- [ ] Email template ready
- [ ] Testers invited

---

## 🐛 Troubleshooting

### Build Fails

**Issue: Signing errors**
- Check Team ID in ExportOptions.plist
- Verify certificates in Keychain
- Try automatic signing

**Issue: Archive fails**
- Clean build folder: `rm -rf ios/build`
- Clean Xcode: `xcodebuild clean`
- Reinstall pods: `cd ios && pod install`

### Upload Fails

**Issue: Invalid bundle**
- Verify Bundle ID matches App Store Connect
- Check version/build number
- Ensure app is signed correctly

### Testers Can't Install

**Issue: Build not processed**
- Wait 10-30 minutes after upload
- Check TestFlight tab for status
- Ensure build is added to testing group

**Issue: TestFlight link doesn't work**
- Verify link is correct
- Check tester has TestFlight app
- Ensure tester accepted invitation

---

## 🎉 Success!

Once set up:
- ✅ Build script automates versioning
- ✅ Upload via Xcode Organizer
- ✅ Testers get automatic updates
- ✅ Feedback collected in app
- ✅ Update notifications work
- ✅ Easy sharing with link

**Next Steps:**
1. Build first version
2. Upload to TestFlight
3. Invite 5-10 initial testers
4. Collect feedback
5. Iterate and improve
6. Expand to more testers

---

**Questions? Check the other guides:**
- `BETA_TESTING_SETUP.md` - General overview
- `BETA_TESTER_GUIDE.md` - For your testers
- `INVITE_TESTERS_NOW.md` - Quick sharing guide

