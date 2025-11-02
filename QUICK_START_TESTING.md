# ⚡ Quick Start - Testing Setup

## Choose Your Path

### 🟢 Option 1: Android (30 min) - START HERE!
Fastest way to get testers. No review needed.

```bash
# Step 1: Build Android release
./scripts/prepare-android-release.sh

# Step 2: Go to Play Console
# https://play.google.com/console
# Create app → Upload AAB → Get testing link
```

### 🔵 Option 2: iOS TestFlight (1-2 hours)
If you have Apple Developer account.

```bash
# Step 1: Build for TestFlight
./scripts/build-ios-testflight.sh

# Step 2: Upload via Xcode Organizer
# Window → Organizer → Distribute App
```

---

## 🎯 Recommended: Android First

**Why?**
- ✅ Setup in 30 minutes
- ✅ Testers can join immediately
- ✅ No waiting for review
- ✅ Start getting feedback today

**Then add iOS** when ready for more comprehensive testing.

---

## 📝 Simple 3-Step Process

### 1. Build Release
```bash
# Android
./scripts/prepare-android-release.sh

# iOS
./scripts/build-ios-testflight.sh
```

### 2. Upload to Store
- **Android**: Play Console → Upload AAB
- **iOS**: Xcode Organizer → Upload to TestFlight

### 3. Share Link
- **Android**: Get opt-in URL from Play Console
- **iOS**: Get TestFlight link from App Store Connect

---

## 🚀 Let's Do It!

**Run this now:**
```bash
chmod +x scripts/prepare-android-release.sh
./scripts/prepare-android-release.sh
```

Then follow the prompts to upload to Play Console!

---

**Need help?** Check `SETUP_TESTING_NOW.md` for detailed steps.

