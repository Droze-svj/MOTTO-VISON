# 🔥 Firebase App Distribution - Setup Now

## 🎯 Step-by-Step Setup (Follow in Order)

---

## Step 1: Create Firebase Project (3 min)

1. **Go to:** https://console.firebase.google.com
2. **Sign in** with your Google account
3. **Click:** "Add Project" (or "Create a Project")
4. **Project name:** `motto` (or `Motto`)
5. **Google Analytics:** 
   - ✅ Enable (recommended) OR
   - ❌ Disable (faster)
6. **Click:** "Create Project"
7. **Wait:** 30 seconds for setup

**✅ Done!** You'll see the Firebase Console.

---

## Step 2: Add iOS App to Firebase (2 min)

1. **In Firebase Console:** Click the iOS icon (or "Add App" → iOS)
2. **iOS bundle ID:** 
   - Look in your project: `ios/MOTTOVISON/Info.plist`
   - Find: `CFBundleIdentifier`
   - **Example:** `com.motto.app` or `com.yourcompany.motto`
   - **Copy this value exactly!**
3. **App nickname:** `Motto iOS` (optional)
4. **App Store ID:** Leave blank (for now)
5. **Click:** "Register App"

**✅ App registered!**

---

## Step 3: Download Config File (1 min)

1. **Download:** `GoogleService-Info.plist` button (automatically downloads)
2. **Find the file:** Check your Downloads folder
3. **Copy to project:**
   ```bash
   cp ~/Downloads/GoogleService-Info.plist ios/MOTTOVISON/GoogleService-Info.plist
   ```

**Or manually:**
- Open Xcode: `ios/MOTTOVISON.xcworkspace`
- Drag `GoogleService-Info.plist` into `MOTTOVISON` folder in Xcode
- ✅ Check "Copy items if needed"
- ✅ Check "Add to targets: MOTTOVISON"

**✅ Config file added!**

---

## Step 4: Install Firebase SDK (2 min)

Run these commands:

```bash
# Install Firebase packages
npm install @react-native-firebase/app @react-native-firebase/distribution

# Install iOS dependencies
cd ios && pod install && cd ..
```

**Wait for installation** (may take 2-3 minutes)

**✅ Firebase SDK installed!**

---

## Step 5: Update Podfile (1 min)

Open `ios/Podfile` and add Firebase pods (if not already there):

```ruby
target 'MOTTOVISON' do
  # ... existing code ...
  
  # Add Firebase (add these lines)
  pod 'Firebase/Core'
  pod 'Firebase/AppDistribution'
end
```

Then run:
```bash
cd ios && pod install && cd ..
```

**✅ Pods updated!**

---

## Step 6: Update Info.plist (1 min)

Open `ios/MOTTOVISON/Info.plist` and add this key:

```xml
<key>FirebaseAppDistributionEnabled</key>
<true/>
```

**Location:** Add it after other `<key>` entries, before `</dict>`.

**✅ Info.plist updated!**

---

## Step 7: Get Your Firebase App ID (1 min)

1. **Firebase Console** → Click gear icon (⚙️) → "Project Settings"
2. **General** tab → Scroll to "Your apps"
3. **iOS app** → Find "App ID"
4. **Copy the App ID** (format: `1:123456789:ios:abc123def456`)
5. **Save it somewhere!** You'll need it for uploads.

**✅ App ID copied!**

---

## Step 8: Install Firebase CLI (2 min)

```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

**This will:**
- Open browser for authentication
- Sign in with Google account
- Authorize Firebase CLI

**✅ Firebase CLI ready!**

---

## Step 9: Test Upload (5 min)

### Build your app first:

```bash
./scripts/build-ios-ipa.sh
```

### Upload to Firebase:

```bash
# Replace YOUR_APP_ID with your actual App ID from Step 7
npx firebase-tools app-distribution:distribute \
  ios/build/export/MOTTOVISON.ipa \
  --app YOUR_APP_ID \
  --groups "beta-testers" \
  --release-notes "Initial Firebase setup test"
```

**Note:** If group doesn't exist, create it in Firebase Console first (Step 10).

**✅ Upload complete!**

---

## Step 10: Create Tester Group (2 min)

1. **Firebase Console** → "App Distribution" (left menu)
2. **Groups** tab → "New Group"
3. **Group name:** `beta-testers`
4. **Add testers:**
   - Enter email addresses (one per line)
   - Example:
     ```
     tester1@example.com
     tester2@example.com
     your-email@example.com
     ```
5. **Click:** "Create Group"

**✅ Tester group created!**

---

## Step 11: Save Configuration (1 min)

Create `.env.firebase` file:

```bash
# Create file
cat > .env.firebase << EOF
FIREBASE_APP_ID=YOUR_APP_ID_HERE
FIREBASE_GROUP=beta-testers
EOF
```

**Replace `YOUR_APP_ID_HERE` with your actual App ID!**

**Or use the upload script:**

```bash
# The script will prompt you if App ID is not set
./scripts/upload-to-firebase.sh
```

---

## ✅ Setup Complete!

**You now have:**
- ✅ Firebase project created
- ✅ iOS app registered
- ✅ Config file added
- ✅ SDK installed
- ✅ Testers group ready
- ✅ Upload script ready

---

## 🚀 Quick Upload Workflow

```bash
# 1. Build
./scripts/build-ios-ipa.sh

# 2. Upload
./scripts/upload-to-firebase.sh

# 3. Testers get email automatically!
```

---

## 📋 Checklist

**Setup:**
- [ ] Firebase project created
- [ ] iOS app added to Firebase
- [ ] GoogleService-Info.plist downloaded and added
- [ ] Firebase SDK installed (`npm install`)
- [ ] Pods installed (`pod install`)
- [ ] Info.plist updated (FirebaseAppDistributionEnabled)
- [ ] App ID copied
- [ ] Firebase CLI installed and logged in
- [ ] Tester group created
- [ ] First build uploaded

**Testing:**
- [ ] Testers received email
- [ ] Testers can install app
- [ ] Updates work automatically

---

## 🐛 Troubleshooting

### Error: "App not found"
- Check App ID is correct
- Verify app is registered in Firebase Console

### Error: "Group not found"
- Create group in Firebase Console first
- Use exact group name (case-sensitive)

### Error: "GoogleService-Info.plist not found"
- Make sure file is in `ios/MOTTOVISON/` folder
- Check it's added to Xcode project

### Build fails
- Run `cd ios && pod install && cd ..`
- Check `GoogleService-Info.plist` is correct

---

## 🎉 Next Steps

1. **Upload first build:**
   ```bash
   ./scripts/upload-to-firebase.sh
   ```

2. **Add more testers:**
   - Firebase Console → App Distribution → Groups
   - Edit group → Add emails

3. **View analytics:**
   - Firebase Console → App Distribution
   - See downloads, installations, devices

**Ready to start? Begin with Step 1!** 🔥

