# 🚀 GitHub Actions - Complete Setup Guide

## What This Solves

- ✅ **No local Xcode builds** - GitHub builds in the cloud
- ✅ **No iCloud issues** - Everything runs on GitHub servers
- ✅ **Automatic distribution** - Push code → Build → Testers notified
- ✅ **Free** - 2000 minutes/month for private repos

---

## 📋 Prerequisites

- GitHub account (free)
- Firebase account (free)
- Your code on GitHub

---

## 🎯 Step-by-Step Setup

### Step 1: Push Code to GitHub (5 min)

```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"

# Check if already on GitHub
git remote -v

# If not, create repo on github.com, then:
git remote add origin https://github.com/yourusername/motto.git
git branch -M main
git add .
git commit -m "Add GitHub Actions for iOS builds"
git push -u origin main
```

---

### Step 2: Create Firebase Project (2 min)

1. Go to https://console.firebase.google.com
2. Create project: "motto"
3. Go to **App Distribution** (left menu)
4. Create group: "beta-testers"
5. Add tester emails

---

### Step 3: Get Firebase CI Token (1 min)

```bash
# Install Firebase CLI (if not already)
npm install -g firebase-tools

# Login
firebase login

# Get CI token
firebase login:ci
```

**Copy the token** (format: `1//abc123...`)

---

### Step 4: Add GitHub Secret (2 min)

1. Go to your GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `FIREBASE_TOKEN`
5. Value: Paste token from Step 3
6. Click **"Add secret"**

---

### Step 5: Trigger Build (1 min)

**Option A: Push Code**
```bash
git add .
git commit -m "Trigger iOS build"
git push
```

**Option B: Manual Trigger**
1. GitHub repo → **Actions** tab
2. Select **"Build and Distribute iOS"**
3. Click **"Run workflow"**
4. Click **"Run workflow"** button

---

### Step 6: Watch Build (10-15 min)

1. GitHub → **Actions** tab
2. Click on your running workflow
3. Watch progress in real-time
4. Build takes ~10-15 minutes

---

### Step 7: Download IPA or Wait for Firebase

**When build completes:**

**Option A: Download IPA from GitHub**
1. Click completed build
2. Scroll to **"Artifacts"**
3. Download **"MOTTOVISON-IPA"**

**Option B: Automatic Firebase Upload**
- If Firebase token is configured, it uploads automatically
- Testers get email notification
- Check Firebase Console → App Distribution

---

## 🔄 Complete Workflow

```
You: Make changes → Commit → Push to GitHub
GitHub: Automatically builds iOS app (10-15 min)
GitHub: Uploads to Firebase App Distribution
Firebase: Emails testers automatically
Testers: Install/update with one tap
```

**Completely automated!** 🎉

---

## ✅ What's Included

The workflow (`.github/workflows/ios-build-and-distribute.yml`) does:

1. ✅ Checkout code
2. ✅ Install Node.js
3. ✅ Install npm dependencies
4. ✅ Install CocoaPods
5. ✅ Bundle React Native
6. ✅ Build iOS archive
7. ✅ Export IPA
8. ✅ Upload as artifact (downloadable for 30 days)
9. ✅ Distribute via Firebase

---

## 📊 Monitoring

### GitHub Actions:
- **Actions** tab shows all builds
- Green ✅ = Success
- Red ❌ = Failed (click for logs)
- Email notifications on failure

### Firebase Console:
- **App Distribution** shows uploads
- See download statistics
- View tester feedback

---

## 🎯 Next Steps After First Build

1. **Wait for build** (~15 minutes)
2. **Check Actions tab** for success
3. **Go to Firebase Console** → App Distribution
4. **Share link** with testers
5. **Collect feedback**
6. **Make improvements**
7. **Push changes** → Automatic rebuild!

---

## 💡 Pro Tips

### Trigger Builds:
- Push to `main` branch (automatic)
- Use **"workflow_dispatch"** for manual builds
- Create pull requests to test before merging

### Speed Up Builds:
- Cache node_modules and Pods
- Only build when iOS files change
- Use matrix builds for multiple configs

### Multiple Environments:
- `main` branch → Firebase beta-testers
- `staging` branch → Internal testers
- `production` branch → Production release

---

## 🐛 Troubleshooting

### Build Fails - Dependencies

**Check logs in Actions tab:**
```
Actions → Failed build → View logs
```

**Common fixes:**
- Verify package.json is correct
- Check Podfile syntax
- Ensure all dependencies are listed

### Firebase Upload Fails

**Fix:**
- Verify `FIREBASE_TOKEN` secret is set correctly
- Token format: `1//abc123...`
- Re-run: `firebase login:ci` if expired

### No Artifacts

**Fix:**
- Build must complete successfully first
- Check Actions logs for errors
- Artifacts only available for 30 days

---

## ✅ Success Checklist

**Setup:**
- [ ] Code pushed to GitHub
- [ ] Firebase project created
- [ ] Tester group created in Firebase
- [ ] Firebase CI token obtained
- [ ] `FIREBASE_TOKEN` secret added to GitHub
- [ ] Workflow file in `.github/workflows/`

**First Build:**
- [ ] Build triggered (push or manual)
- [ ] Build completes successfully
- [ ] IPA artifact available
- [ ] Firebase upload successful
- [ ] Testers receive email

**Testing:**
- [ ] Testers can install app
- [ ] App works correctly
- [ ] Feedback collected
- [ ] Issues tracked

---

## 🎉 Benefits

- ✅ **No local Xcode** - Cloud builds
- ✅ **No iCloud issues** - GitHub has fast storage
- ✅ **Automated** - Push → Build → Distribute
- ✅ **Version control** - Every build is tracked
- ✅ **Team friendly** - Anyone can trigger builds
- ✅ **Free** - Generous free tier

**Best solution for your setup!** 🚀

---

**Ready? Follow the steps above to set it up!**

