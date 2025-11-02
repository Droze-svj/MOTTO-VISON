# 🔥 Firebase Setup - Start Here!

## ✅ What I've Done for You

I've updated your project files:
- ✅ Added Firebase pods to `Podfile`
- ✅ Added `FirebaseAppDistributionEnabled` to `Info.plist`
- ✅ Created upload script: `scripts/upload-to-firebase.sh`
- ✅ Created setup guides

**Your Bundle ID:** `com.anonymous.motto-vison`

---

## 🚀 Next Steps (Follow in Order)

### Step 1: Install Firebase Packages

```bash
npm install @react-native-firebase/app @react-native-firebase/distribution
```

### Step 2: Create Firebase Project (3 min)

1. **Go to:** https://console.firebase.google.com
2. **Sign in** with Google account
3. **Click:** "Add Project"
4. **Name:** `motto` (or `Motto`)
5. **Enable Analytics:** Optional (recommended)
6. **Click:** "Create Project"
7. **Wait:** 30 seconds

---

### Step 3: Add iOS App (2 min)

1. **In Firebase Console:** Click iOS icon (or "Add App" → iOS)
2. **iOS bundle ID:** `com.anonymous.motto-vison`
   - ⚠️ **Use this exact value!**
3. **App nickname:** `Motto iOS`
4. **App Store ID:** Leave blank
5. **Click:** "Register App"

---

### Step 4: Download Config File (1 min)

1. **Download:** `GoogleService-Info.plist`
2. **Copy to project:**
   ```bash
   cp ~/Downloads/GoogleService-Info.plist ios/MOTTOVISON/GoogleService-Info.plist
   ```
3. **Add to Xcode:**
   - Open `ios/MOTTOVISON.xcworkspace`
   - Drag `GoogleService-Info.plist` into Xcode project
   - ✅ Check "Copy items if needed"
   - ✅ Check "Add to targets: MOTTOVISON"

---

### Step 5: Install Pods (2 min)

```bash
cd ios && pod install && cd ..
```

**Wait for installation** (may take 2-3 minutes)

---

### Step 6: Install Firebase CLI (1 min)

```bash
npm install -g firebase-tools
firebase login
```

**This opens browser** → Sign in → Authorize

---

### Step 7: Get App ID (1 min)

1. **Firebase Console** → ⚙️ Gear → "Project Settings"
2. **General** tab → "Your apps"
3. **iOS app** → Copy **App ID**
   - Format: `1:123456789:ios:abc123def456`
4. **Save it!**

---

### Step 8: Create Tester Group (2 min)

1. **Firebase Console** → "App Distribution" (left menu)
2. **Groups** tab → "New Group"
3. **Name:** `beta-testers`
4. **Add emails** (yours + testers)
5. **Click:** "Create Group"

---

### Step 9: Save App ID (1 min)

Create `.env.firebase`:

```bash
cat > .env.firebase << EOF
FIREBASE_APP_ID=YOUR_APP_ID_HERE
FIREBASE_GROUP=beta-testers
EOF
```

**Replace `YOUR_APP_ID_HERE` with your actual App ID from Step 7!**

---

### Step 10: Build & Upload (5 min)

```bash
# Build
./scripts/build-ios-ipa.sh

# Upload
./scripts/upload-to-firebase.sh
```

**Or manually:**
```bash
npx firebase-tools app-distribution:distribute \
  ios/build/export/MOTTOVISON.ipa \
  --app YOUR_APP_ID \
  --groups "beta-testers" \
  --release-notes "Initial Firebase test"
```

---

## 📋 Quick Checklist

**Setup:**
- [ ] `npm install @react-native-firebase/app @react-native-firebase/distribution`
- [ ] Firebase project created
- [ ] iOS app added (bundle ID: `com.anonymous.motto-vison`)
- [ ] `GoogleService-Info.plist` downloaded and added to Xcode
- [ ] `pod install` completed
- [ ] Firebase CLI installed and logged in
- [ ] App ID copied from Firebase Console
- [ ] Tester group created
- [ ] `.env.firebase` created with App ID

**Upload:**
- [ ] IPA built (`./scripts/build-ios-ipa.sh`)
- [ ] Uploaded to Firebase (`./scripts/upload-to-firebase.sh`)
- [ ] Testers received email

---

## 🎯 Complete Workflow

Once set up, for future updates:

```bash
# 1. Make changes
# 2. Build
./scripts/build-ios-ipa.sh

# 3. Upload
./scripts/upload-to-firebase.sh

# 4. Testers get automatic email!
```

---

## 🐛 Troubleshooting

### "App not found"
- Check App ID is correct in `.env.firebase`
- Verify app registered in Firebase Console

### "Group not found"
- Create group in Firebase Console first
- Use exact name: `beta-testers`

### Build fails
- Run `cd ios && pod install && cd ..`
- Check `GoogleService-Info.plist` is in Xcode project

---

## 📖 Detailed Guides

- **Full setup:** `FIREBASE_DISTRIBUTION_SETUP.md`
- **Quick reference:** `FIREBASE_SETUP_NOW.md`

---

## 🎉 Ready?

**Start with Step 1** → Install packages, then follow steps 2-10!

**Questions?** Check the detailed guides or let me know!

