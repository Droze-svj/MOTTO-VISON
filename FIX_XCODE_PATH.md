# 🔧 Fix Xcode Path - Enable iOS Simulator

## ⚠️ Issue:

Your Mac is using Command Line Tools instead of full Xcode.

**Error:** `xcode-select: error: tool 'xcodebuild' requires Xcode`

---

## ✅ Quick Fix (1 command):

**Run this in your terminal:**

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**It will ask for your Mac password** - type it and press Enter.

---

## 📋 Step-by-Step:

### **Step 1: Open Terminal**
(You probably have it open already)

### **Step 2: Run the Command**
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### **Step 3: Enter Password**
- Type your Mac password (it won't show as you type)
- Press Enter

### **Step 4: Verify It Worked**
```bash
xcode-select -p
```

**Should show:**
```
/Applications/Xcode.app/Contents/Developer
```

---

## 🚀 Then Test the Simulator:

After running the command above:

```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"
npx react-native run-ios
```

**This will:**
- ✅ Start Metro bundler
- ✅ Build iOS app
- ✅ Open iOS Simulator
- ✅ Launch MOTTO app! 📱

---

## 🐛 If Xcode Not Found:

### **Check if Xcode is installed:**
```bash
ls /Applications/ | grep Xcode
```

**Should show:** `Xcode.app`

### **If no Xcode:**
You have 2 options:

**Option A: Install Xcode** (Large download - ~13GB)
1. Open Mac App Store
2. Search "Xcode"
3. Click "Get" or "Install"
4. Wait for download (~1-2 hours)
5. Then run the xcode-select command above

**Option B: Skip Simulator Testing**
- Just use GitHub Actions for build verification
- Wait for real device testing setup later

---

## ✅ Quick Commands:

### **Fix Xcode Path:**
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### **Verify Path:**
```bash
xcode-select -p
```

### **Then Start Simulator:**
```bash
npx react-native run-ios
```

---

**Run the sudo command and let me know when it's done!** 🔧

