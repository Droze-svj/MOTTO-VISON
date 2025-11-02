# 🔐 Add GitHub Secret - Step by Step

## 🎯 What We're Doing

Adding the `FIREBASE_TOKEN` secret to GitHub so the workflow can upload builds to Firebase.

---

## Step 1: Get Firebase CI Token (2 min)

### Option A: Get New Token

Open Terminal and run:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Get CI token
firebase login:ci
```

**This will:**
1. Open your browser
2. Ask you to sign in to Google/Firebase
3. Show a token in the terminal

**Copy the entire token!** It looks like:
```
1//0abc123def456ghi789jkl...
```

### Option B: Use Existing Token

If you already have a Firebase token, use that instead.

---

## Step 2: Go to GitHub Repository

1. **Open your browser**
2. **Go to:** https://github.com
3. **Navigate to your MOTTO repository**
   - If you haven't pushed yet, do that first:
     ```bash
     cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"
     git add .
     git commit -m "Add GitHub Actions"
     git push
     ```

---

## Step 3: Navigate to Secrets Settings

1. In your GitHub repository page
2. Click **"Settings"** tab (top right)
3. In left sidebar, find **"Secrets and variables"**
4. Click **"Secrets and variables"** to expand
5. Click **"Actions"**

**You should see:** "Actions secrets" page

---

## Step 4: Add New Secret

1. Click **"New repository secret"** button (green button, top right)
2. You'll see a form with two fields:

**Fill in:**
```
Name: FIREBASE_TOKEN
Secret: [Paste your Firebase token here]
```

**Example:**
```
Name: FIREBASE_TOKEN
Secret: 1//0abc123def456ghi789jkl...
```

3. Click **"Add secret"** button (green)

---

## Step 5: Verify Secret Added

You should see:
```
✓ FIREBASE_TOKEN
```

in the list of secrets (the value is hidden for security).

---

## ✅ Done!

Your GitHub Actions workflow can now:
- Build iOS app
- Upload to Firebase
- Notify testers

---

## 🚀 Test It

### Trigger a Build:

**Option 1: Push Code**
```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"
git add .
git commit -m "Test GitHub Actions build"
git push
```

**Option 2: Manual Trigger**
1. GitHub repo → **Actions** tab
2. Select **"Build and Distribute iOS"** workflow
3. Click **"Run workflow"** dropdown
4. Click **"Run workflow"** button (green)

---

## 📊 Watch the Build

1. **Actions** tab
2. Click on the running workflow
3. Watch real-time progress:
   - Setup
   - Install dependencies  
   - Install pods
   - Build archive
   - Export IPA
   - Upload to Firebase

**Takes about 10-15 minutes** ⏱️

---

## 🐛 Troubleshooting

### "Secret not found"

**Fix:**
- Verify secret name is exactly: `FIREBASE_TOKEN` (case-sensitive)
- Check you added it to the correct repository
- Refresh the page

### "Invalid token"

**Fix:**
```bash
# Get a fresh token
firebase login:ci
```
- Copy the new token
- Edit the GitHub secret
- Paste new token

### "Permission denied"

**Fix:**
- Ensure you have admin access to the repository
- Check you're the repository owner
- Or ask repository owner to add the secret

---

## 📋 Quick Checklist

- [ ] Firebase CLI installed
- [ ] Logged into Firebase (`firebase login`)
- [ ] CI token obtained (`firebase login:ci`)
- [ ] Token copied
- [ ] GitHub repository settings opened
- [ ] Secrets → Actions page accessed
- [ ] New secret created: `FIREBASE_TOKEN`
- [ ] Token pasted as value
- [ ] Secret added successfully
- [ ] Build triggered (push or manual)
- [ ] Build running in Actions tab

---

## 🎉 Once Set Up

Every time you push code:
1. GitHub automatically builds
2. Uploads to Firebase
3. Testers get notified
4. You check Actions tab for status

**Completely hands-free!** 🚀

---

**Need help with any step? Let me know!**

