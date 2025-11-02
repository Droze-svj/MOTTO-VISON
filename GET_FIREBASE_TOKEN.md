# 🔑 Get Firebase CI Token - Quick Guide

## Run These Commands:

```bash
# Step 1: Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Step 2: Login to Firebase
firebase login

# Step 3: Get CI token
firebase login:ci
```

---

## What Happens:

### Command 1: `npm install -g firebase-tools`
- Installs Firebase command line tools
- Takes ~1 minute

### Command 2: `firebase login`
- Opens browser
- Sign in with Google account (same one used for Firebase Console)
- Authorizes Firebase CLI

### Command 3: `firebase login:ci`
- Generates a CI token
- Shows token in terminal
- **Copy this token!**

---

## The Token Looks Like:

```
1//0abc123def456ghi789jkl012mno345pqr678stu901vwx...
```

**Copy the entire thing** (starts with `1//`)

---

## Then Add to GitHub:

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Name: `FIREBASE_TOKEN`
5. Value: [Paste token]
6. **Add secret**

---

## ✅ Quick Commands:

```bash
# All in one:
npm install -g firebase-tools && \
firebase login && \
firebase login:ci

# Then copy the token and add to GitHub
```

---

**Ready? Run the commands above!** 🚀

