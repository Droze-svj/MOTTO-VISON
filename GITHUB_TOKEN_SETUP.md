# 🔑 GitHub Personal Access Token - Exact Setup

## 📋 Step-by-Step Instructions

### Step 1: Go to Token Page
**Open this link:** https://github.com/settings/tokens

Click **"Generate new token"** → **"Generate new token (classic)"**

---

### Step 2: Fill in the Form

#### **Note (Description):**
```
MOTTO Development - Push & Actions
```
*This is just a reminder for yourself of what this token is for*

#### **Expiration:**
Select: **90 days** (or "No expiration" if you prefer, but less secure)

#### **Select scopes (Permissions):**

**✅ CHECK THESE BOXES:**

1. **repo** (Full control of private repositories)
   - This automatically checks ALL sub-items:
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events

2. **workflow** (Update GitHub Action workflows)
   - ✅ workflow

**❌ LEAVE UNCHECKED:**
- Everything else (admin:org, admin:public_key, etc.)

---

### Visual Guide:

```
┌─────────────────────────────────────────┐
│ Note: MOTTO Development - Push & Actions│
├─────────────────────────────────────────┤
│ Expiration: 90 days                     │
├─────────────────────────────────────────┤
│ Select scopes:                          │
│                                         │
│ ✅ repo (Full control...)               │
│    ✅ repo:status                       │
│    ✅ repo_deployment                   │
│    ✅ public_repo                       │
│    ✅ repo:invite                       │
│    ✅ security_events                   │
│                                         │
│ ✅ workflow (Update workflows)          │
│                                         │
│ ❌ admin:org                            │
│ ❌ admin:public_key                     │
│ ❌ (everything else unchecked)          │
└─────────────────────────────────────────┘
```

---

### Step 3: Generate Token

1. Scroll to bottom
2. Click **"Generate token"** (green button)
3. **COPY THE TOKEN IMMEDIATELY!**
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!

---

### Step 4: Use the Token

**Now run these commands:**

```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"

# Remove old remote
git remote remove origin

# Add remote with YOUR token (replace the ghp_xxx... part)
git remote add origin https://YOUR_TOKEN_HERE@github.com/orlandhino/MOTTO-VISON.git

# Push to GitHub (this will trigger the build automatically!)
git push -u origin main
```

**Example with fake token:**
```bash
# If your token is: ghp_abc123def456ghi789
git remote add origin https://ghp_abc123def456ghi789@github.com/orlandhino/MOTTO-VISON.git
```

---

## 🎉 After Successful Push:

1. **GitHub Actions starts automatically!**
2. **Watch the build:**
   - Go to: https://github.com/orlandhino/MOTTO-VISON/actions
   - Click on the running workflow
   - Watch real-time progress

3. **Build completes in ~10-15 minutes:**
   - ✅ iOS app built
   - ✅ IPA created
   - ✅ Uploaded to Firebase
   - ✅ Ready for testing!

---

## 🔒 Security Tips:

- **Never commit the token** to your code
- **Don't share it** with anyone
- **Regenerate it** if you accidentally expose it
- **Set expiration** to limit risk

---

## 📋 Quick Checklist:

- [ ] Opened: https://github.com/settings/tokens
- [ ] Clicked "Generate new token (classic)"
- [ ] Note: `MOTTO Development - Push & Actions`
- [ ] Expiration: `90 days`
- [ ] Checked: `repo` (all sub-items)
- [ ] Checked: `workflow`
- [ ] Clicked "Generate token"
- [ ] **Copied token** (saved it somewhere safe!)
- [ ] Ran `git remote remove origin`
- [ ] Ran `git remote add origin https://YOUR_TOKEN@github.com/orlandhino/MOTTO-VISON.git`
- [ ] Ran `git push -u origin main`
- [ ] Opened: https://github.com/orlandhino/MOTTO-VISON/actions
- [ ] Watching the build! 🎉

---

**Ready? Go to:** https://github.com/settings/tokens

**Copy the token, then tell me when you're ready to push!** 🚀

