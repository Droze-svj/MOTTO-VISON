# 🤖 Android Beta Testing Setup - Step by Step

## Prerequisites

- ✅ Google Play Developer Account ($25 one-time)
- ✅ Google Play Console access
- ✅ App configured correctly
- ✅ Backend deployed and working

---

## 🚀 Quick Setup (30-60 minutes)

### Step 1: Create App in Play Console

1. Go to https://play.google.com/console
2. Click **"Create app"**
3. Fill in details:
   ```
   App name: MOTTO
   Default language: English
   App type: App
   Free or paid: Free
   ```
4. Check **"Distribute on Google Play"**
5. Click **"Create app"**

### Step 2: Complete Store Listing

**Required:**
- App name: MOTTO
- Short description (80 chars)
- Full description
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (at least 2)
- Privacy policy URL (required)

**Quick Setup:**
1. Play Console → Your App → **"Main store listing"**
2. Fill in basic info
3. Upload app icon
4. Add screenshots
5. Add privacy policy URL

### Step 3: Create AAB Build

**Build Release Bundle:**
```bash
cd android

# Create release AAB
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Or in Android Studio:**
1. Build → Generate Signed Bundle / APK
2. Select "Android App Bundle"
3. Choose keystore (create if needed)
4. Build

### Step 4: Set Up Internal Testing

**1. Create Internal Testing Track**
- Play Console → Your App → **"Testing"** → **"Internal testing"**
- Click **"Create new release"**

**2. Upload AAB**
- Click **"Upload"**
- Select your `app-release.aab` file
- Add release notes:
  ```
  Beta version for testing
  - Backend deployed to Render
  - Initial testing release
  ```
- Click **"Save"**

**3. Create Tester List**
- Internal testing → **"Testers"** tab
- Click **"Create list"**
- Name: "Beta Testers"
- Add tester emails:
  ```
  tester1@example.com
  tester2@example.com
  tester3@example.com
  ```
- Click **"Save"**

**4. Get Testing Link**
- Internal testing → **"Testers"** tab
- Copy the **"Opt-in URL"**
- Looks like: `https://play.google.com/apps/internaltest/XXXXXXXX`

### Step 5: Share with Testers

**Share the link** - testers can join immediately!

---

## 📋 Requirements Checklist

Before uploading:
- [ ] App signed with release keystore
- [ ] Version code incremented (in build.gradle)
- [ ] Version name set (e.g., "1.0.0-beta")
- [ ] API URL points to production
- [ ] App icon ready (512x512)
- [ ] Screenshots ready
- [ ] Privacy policy URL added

---

## ⚙️ Configuration

### build.gradle Updates

Make sure `android/app/build.gradle` has:
```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0-beta"
        // ... other config
    }
}
```

### API Configuration

Ensure production API:
```env
API_BASE_URL=https://motto-backend.onrender.com
```

---

## 🎯 Closed Testing (For Larger Beta)

For more testers or staged rollout:

**1. Create Closed Testing Track**
- Testing → Closed testing
- Click "+ Create new release"
- Upload AAB
- Set up tester groups

**2. Add Testers**
- Create tester groups (e.g., "Beta Group 1", "Beta Group 2")
- Add up to 100,000 testers
- Share opt-in links

**3. Staged Rollout**
- Gradually increase tester percentage
- Monitor for issues
- Full rollout when ready

---

## ✅ Testing Checklist

**Before Inviting:**
- [ ] AAB uploaded successfully
- [ ] Release created
- [ ] Tester list created
- [ ] Testing link obtained

**Ready to Share:**
- [ ] Testing link copied
- [ ] Tester instructions ready
- [ ] Feedback form created

---

## 🐛 Troubleshooting

### Upload Fails

**Common Issues:**
- AAB too large: Optimize or enable App Bundle
- Invalid signature: Check keystore
- Version code conflict: Increment version code
- Missing privacy policy: Add in store listing

### Testers Can't Access

**Fix:**
- Verify tester list is created
- Check link is correct
- Ensure testers use same Google account
- Verify release is published

### App Crashes on Launch

**Fix:**
- Check API URL is correct
- Verify backend is running
- Check logs in Play Console
- Test on physical device first

---

## 📧 Invitation Email Template

```
Subject: Test MOTTO on Android - Beta Invitation

Hi [Name],

I'd like to invite you to beta test MOTTO on Android!

To join:
1. Click this link: https://play.google.com/apps/internaltest/XXXXXXXX
2. Join the beta testing program
3. Install MOTTO from Play Store

What to Test:
- Chat functionality
- AI responses and features
- Overall experience
- Report bugs or issues

Feedback:
Share your thoughts at: [feedback link]

Thanks for helping test MOTTO!

[Your Name]
```

---

## 📊 Testing Tracks Comparison

| Track | Max Testers | Review | Best For |
|-------|-------------|--------|----------|
| **Internal** | 100 | None | Quick testing |
| **Closed** | 100,000 | None | Larger beta |
| **Open** | Unlimited | Yes | Public beta |

**Recommended**: Start with Internal, expand to Closed if needed

---

## 🎉 Success!

Once set up:
- Testers click link and join
- App appears in Play Store for them
- Automatic updates when you publish new release
- Easy to manage testers

**Time to First Testers**: 30-60 minutes  
**Max Internal Testers**: 100  
**Review Time**: None (immediate)

---

**Next**: Create tester guide or start inviting! 🚀

