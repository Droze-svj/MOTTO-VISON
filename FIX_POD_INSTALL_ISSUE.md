# 🔧 Fix Pod Install Issue - iCloud Timeout

## ❌ Problem

Your project is in **iCloud Drive** which causes file system timeouts:

```
Error: ETIMEDOUT: connection timed out, read
```

**Location:** `~/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON`

This happens because iCloud syncs files on-demand, causing timeouts when Node.js tries to read them.

---

## ✅ Solution: Use CLI-Only Method (Recommended)

**Good news:** You don't need pod install for Firebase CLI-only!

### Remove Firebase Pods from Podfile

Since you're using CLI-only (no SDK), remove the Firebase pods:

```bash
# Edit ios/Podfile and remove these lines:
# pod 'Firebase/Core'
# pod 'Firebase/AppDistribution'
```

Then pod install will work!

---

## 🚀 Quick Fix Steps

### Step 1: Remove Firebase Pods

I'll update the Podfile to remove Firebase pods (not needed for CLI-only):

### Step 2: Install Pods

```bash
cd ios && pod install && cd ..
```

### Step 3: Build App

```bash
./scripts/build-ios-ipa.sh
```

### Step 4: Upload (CLI-only, no SDK)

```bash
./scripts/upload-to-firebase.sh
```

**Done!** No SDK, no pod issues!

---

## 🔄 Alternative: Move Project Out of iCloud

If you want to use Firebase SDK (not needed), move project:

```bash
# Move to local directory
mv ~/Library/Mobile\ Documents/com~apple~CloudDocs/MOTTO-VISON ~/MOTTO-VISON

# Work from there
cd ~/MOTTO-VISON
```

---

## 💡 Recommendation

**Use CLI-only method:**
- No pod install issues
- No SDK needed
- Simpler setup
- Works immediately

**I'll update the Podfile now to remove Firebase pods!**

