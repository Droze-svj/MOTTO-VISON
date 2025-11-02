# 🔧 Fix GitHub Push - Authentication Guide

## 📋 Repository Name Confirmed:
- Name: `MOTTO-VISON` ✅
- Expected URL: `https://github.com/orlandhino/MOTTO-VISON.git`

---

## 🎯 Quick Fix Steps

### Step 1: Verify Repository Exists

**Open in browser:**
```
https://github.com/orlandhino/MOTTO-VISON
```

**Does it exist?**
- ✅ **Yes** → Continue to Step 2
- ❌ **No** → Go to Step 3 (Create it)

---

### Step 2: Authenticate with GitHub

The "Repository not found" error is likely an **authentication issue** (private repo).

**Option A: Use Personal Access Token (Recommended)**

1. **Generate Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "MOTTO Development"
   - Scopes: Check `repo` (all sub-items)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Update Remote URL:**
```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"

# Remove current remote
git remote remove origin

# Add remote with token (replace YOUR_TOKEN with the token you copied)
git remote add origin https://YOUR_TOKEN@github.com/orlandhino/MOTTO-VISON.git

# Push
git push -u origin main
```

**Option B: Use SSH (More Secure)**

1. **Check if you have SSH key:**
```bash
ls -la ~/.ssh/id_*.pub
```

2. **If no key exists, create one:**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter for all prompts (default location)
```

3. **Copy SSH public key:**
```bash
cat ~/.ssh/id_ed25519.pub
# Copy the entire output
```

4. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Title: "Mac"
   - Paste your public key
   - Click "Add SSH key"

5. **Update Remote URL:**
```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"

# Remove current remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:orlandhino/MOTTO-VISON.git

# Push
git push -u origin main
```

---

### Step 3: Create Repository (If It Doesn't Exist)

1. **Go to:** https://github.com/new

2. **Fill in:**
   - Repository name: `MOTTO-VISON` (exact spelling)
   - Visibility: **Private**
   - **Don't** check "Initialize with README"

3. **Click:** "Create repository"

4. **Follow authentication steps from Step 2**

---

## 🚀 Quick Commands (Using Token)

```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"

# 1. Get your token from: https://github.com/settings/tokens

# 2. Update remote (replace YOUR_TOKEN)
git remote remove origin
git remote add origin https://YOUR_TOKEN@github.com/orlandhino/MOTTO-VISON.git

# 3. Push
git push -u origin main
```

---

## 🚀 Quick Commands (Using SSH)

```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"

# 1. Set up SSH key (if not already)
# Follow Step 2, Option B above

# 2. Update remote
git remote remove origin
git remote add origin git@github.com:orlandhino/MOTTO-VISON.git

# 3. Push
git push -u origin main
```

---

## ✅ After Successful Push:

1. **GitHub Actions will auto-start!** 🎉
2. **Watch the build:**
   - Go to: https://github.com/orlandhino/MOTTO-VISON/actions
   - See your workflow running
   - Takes ~10-15 minutes

3. **Result:**
   - iOS app built ✅
   - IPA uploaded to Firebase ✅
   - Ready to distribute to testers ✅

---

## 🐛 Still Having Issues?

### "Repository not found" after adding token
- Verify repository exists at: https://github.com/orlandhino/MOTTO-VISON
- Check token has `repo` permission
- Try SSH instead

### "Authentication failed"
- Token expired? Generate a new one
- Token has wrong permissions? Regenerate with `repo` scope
- Try SSH method instead

### "Permission denied (publickey)"
- SSH key not added to GitHub
- Add key at: https://github.com/settings/keys

---

**Choose your method:**
- 🔐 **Personal Access Token** (easier, less secure)
- 🔑 **SSH Key** (more secure, recommended for long-term)

**Which method would you like to use?**

