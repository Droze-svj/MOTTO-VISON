# 🚀 Move Project Out of iCloud - Fix Build Issues

## ❌ The Problem

Your project is in iCloud Drive, causing timeouts:

**Current location:**
```
~/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON
```

**Issue:** iCloud syncs files on-demand, causing Node.js/pod install to timeout.

---

## ✅ Solution: Move to Local Directory

### Step 1: Move Project

```bash
# Move from iCloud to local directory
mv ~/Library/Mobile\ Documents/com~apple~CloudDocs/MOTTO-VISON ~/MOTTO-VISON

# Or to Documents folder
mv ~/Library/Mobile\ Documents/com~apple~CloudDocs/MOTTO-VISON ~/Documents/MOTTO-VISON
```

### Step 2: Navigate to New Location

```bash
# Go to new location
cd ~/MOTTO-VISON

# Or
cd ~/Documents/MOTTO-VISON
```

### Step 3: Install Pods

```bash
cd ios && pod install && cd ..
```

### Step 4: Build

```bash
./scripts/build-ios-ipa.sh
```

---

## 🎯 Quick Commands

```bash
# All in one (move to home directory):
mv ~/Library/Mobile\ Documents/com~apple~CloudDocs/MOTTO-VISON ~/MOTTO-VISON && \
cd ~/MOTTO-VISON && \
cd ios && pod install && cd .. && \
./scripts/build-ios-ipa.sh
```

---

## 📋 After Moving

Your project will be at:
- **Home:** `~/MOTTO-VISON`
- **Or Documents:** `~/Documents/MOTTO-VISON`

**Benefits:**
- ✅ No more timeouts
- ✅ Faster builds
- ✅ Pod install works
- ✅ No iCloud sync delays

---

## ⚠️ Important

After moving, **always use the new location**:

```bash
cd ~/MOTTO-VISON  # NOT the iCloud path!
```

---

## 🔄 Optional: Keep iCloud Backup

If you want iCloud backup:

```bash
# Work from local copy
cd ~/MOTTO-VISON

# Manually copy to iCloud when needed
# (But don't work from iCloud directly!)
```

---

## ✅ Ready to Move?

Run these commands:

```bash
# Move project
mv ~/Library/Mobile\ Documents/com~apple~CloudDocs/MOTTO-VISON ~/MOTTO-VISON

# Go to new location  
cd ~/MOTTO-VISON

# Install pods
cd ios && pod install && cd ..

# Build app
./scripts/build-ios-ipa.sh
```

**This will fix all timeout issues!** 🎉

