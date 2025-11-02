# 📱 Step 4: Build Your iOS App - Complete Guide

## 🎯 What We're Building

We're creating an **IPA file** that you'll upload to Firebase App Distribution.

**Output:** `ios/build/export/MOTTOVISON.ipa`

---

## ⏱️ Time: 5-10 Minutes

The build process includes:
1. Clean build folder (10 seconds)
2. Install CocoaPods dependencies (2-5 minutes) ⏳ **This takes the longest**
3. Bundle React Native JavaScript (30 seconds)
4. Update version info (5 seconds)
5. Create archive (2-3 minutes)
6. Export IPA (1 minute)

**Total: ~5-10 minutes**

---

## 🚀 Quick Start

```bash
./scripts/build-ios-ipa.sh
```

**That's it!** The script does everything automatically.

---

## 📋 What Happens During Build

### Step 1: Clean Build Folder ✅
- Removes old build files
- Creates fresh build directory

### Step 2: Install CocoaPods ⏳ (Takes 2-5 minutes)
```bash
cd ios
pod install
cd ..
```
**This is the slowest step.** Be patient! It downloads iOS dependencies.

**You'll see:**
```
Analyzing dependencies
Downloading dependencies
Installing [package names]
Generating Pods project
```

### Step 3: Bundle React Native JavaScript ✅
- Bundles your React Native code
- Creates `ios/main.jsbundle`

### Step 4: Update Version Info ✅
- Sets version: `1.0.0`
- Sets build number: `20251101092628` (timestamp)

### Step 5: Create Archive ⏳ (Takes 2-3 minutes)
- Compiles iOS app
- Creates `.xcarchive` file

### Step 6: Export IPA ✅
- Exports IPA file
- Ready to upload!

---

## ✅ Success Output

When build completes, you'll see:

```
✅ Build complete!

📦 IPA File:
   ios/build/export/MOTTOVISON.ipa
   Size: 25.3 MB

📋 Next Steps:
   [Upload instructions]
```

---

## 🐛 Troubleshooting

### Error: "xcodebuild not found"

**Fix:**
- Install Xcode from Mac App Store
- Open Xcode → Accept license
- Run: `xcodebuild -version` to verify

### Error: "pod: command not found"

**Fix:**
```bash
sudo gem install cocoapods
```

### Error: "Archive failed"

**Common causes:**
1. **Signing issues** - Check your Apple Developer account
2. **Missing certificates** - Download from Apple Developer portal
3. **Provisioning profile** - Update in Xcode

**Fix:**
```bash
# Open Xcode
open ios/MOTTOVISON.xcworkspace

# Xcode → Signing & Capabilities
# Select your team
# Check "Automatically manage signing"
```

### Error: "Export failed"

**Check:**
1. ExportOptions.plist exists: `ios/ExportOptions.plist`
2. Archive was created: `ios/build/MOTTOVISON.xcarchive`
3. Signing is correct

### Build Takes Too Long

**Normal times:**
- First build: 10-15 minutes
- Subsequent builds: 5-10 minutes

**If stuck on "pod install":**
- First time: 5-10 minutes (normal!)
- Network issues: Check internet connection
- Wait patiently - it's downloading dependencies

### "Out of space" Error

**Fix:**
```bash
# Check disk space
df -h

# Clean old builds
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

---

## 🔍 Check Build Progress

### Watch Pod Installation:
```bash
# In another terminal, watch pods
cd ios
pod install --verbose
```

### Check Build Status:
```bash
# Check if archive exists
ls -lh ios/build/MOTTOVISON.xcarchive

# Check if IPA exists
ls -lh ios/build/export/*.ipa
```

---

## ⚡ Speed Tips

### Faster Subsequent Builds:

1. **Don't clean between builds:**
   ```bash
   # Comment out clean step if rebuilding quickly
   # rm -rf ios/build
   ```

2. **Use build cache:**
   - Keep `ios/Pods` folder
   - Keep `ios/build` between builds

3. **Parallel builds:**
   - Xcode uses multiple cores automatically

---

## 📋 Pre-Build Checklist

**Before running build:**

- [ ] Xcode installed
- [ ] Xcode command line tools: `xcode-select --install`
- [ ] CocoaPods installed: `pod --version`
- [ ] Apple Developer account configured
- [ ] Signing configured in Xcode (if needed)
- [ ] Network connection (for pod install)

---

## 🎯 Step-by-Step: Run Build

### Option 1: Full Build (Recommended)

```bash
# Navigate to project
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"

# Run build script
./scripts/build-ios-ipa.sh
```

**Wait 5-10 minutes** - Don't cancel during pod install!

### Option 2: Manual Steps (If Script Fails)

```bash
# 1. Clean
rm -rf ios/build
mkdir -p ios/build

# 2. Install pods
cd ios && pod install && cd ..

# 3. Bundle JS
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ios/main.jsbundle \
  --assets-dest ios/

# 4. Archive (requires Xcode)
xcodebuild archive \
  -workspace ios/MOTTOVISON.xcworkspace \
  -scheme MOTTOVISON \
  -configuration Release \
  -archivePath ios/build/MOTTOVISON.xcarchive

# 5. Export
xcodebuild -exportArchive \
  -archivePath ios/build/MOTTOVISON.xcarchive \
  -exportPath ios/build/export \
  -exportOptionsPlist ios/ExportOptions.plist
```

---

## ✅ After Build Completes

### Verify IPA File:

```bash
# Check file exists
ls -lh ios/build/export/MOTTOVISON.ipa

# Check file size (should be > 1 MB)
du -h ios/build/export/MOTTOVISON.ipa
```

### Then Upload to Firebase:

```bash
./scripts/upload-to-firebase.sh
```

---

## 💡 Pro Tips

1. **First build is slowest** - Be patient!
2. **Don't cancel during pod install** - Let it finish
3. **Check disk space** - Need ~5GB free
4. **Keep terminal open** - Don't close during build
5. **Watch for errors** - Script shows clear error messages

---

## 🎉 Ready?

**Run the build:**
```bash
./scripts/build-ios-ipa.sh
```

**Be patient during pod install (2-5 minutes)!** ⏳

**After build completes, proceed to Step 5 (Upload)!** 🚀

