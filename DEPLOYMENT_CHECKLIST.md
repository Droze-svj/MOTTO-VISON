# ✅ Deployment Checklist - Track Your Progress

Use this to track where you are in the deployment process!

---

## 📋 BACKEND DEPLOYMENT (Render.com)

- [ ] **Step 1**: Visit https://dashboard.render.com/register
- [ ] **Step 2**: Sign up with GitHub
- [ ] **Step 3**: Click "New +" → "Web Service"
- [ ] **Step 4**: Enter configuration:
  - [ ] Name: motto-backend-staging
  - [ ] Region: Oregon
  - [ ] Environment: Python 3
  - [ ] Root Directory: backend
  - [ ] Build Command: pip install -r requirements.txt
  - [ ] Start Command: uvicorn main_improved:app --host 0.0.0.0 --port $PORT
- [ ] **Step 5**: Click "Advanced" → Add environment variables:
  - [ ] SECRET_KEY = nEXuxUljwrto9kkSRZQZg8keeSudbhgqgspfqbaKkoM
  - [ ] ENVIRONMENT = staging
  - [ ] DEBUG = false
  - [ ] LOG_LEVEL = INFO
  - [ ] ALLOWED_ORIGINS = *
  - [ ] DATABASE_URL = sqlite+aiosqlite:///./tokens.db
- [ ] **Step 6**: Click "Create Web Service"
- [ ] **Step 7**: Wait for deployment (5-10 min)
- [ ] **Step 8**: Save your URL: ______________________
- [ ] **Step 9**: Test /health endpoint
- [ ] **Step 10**: Test /docs endpoint

**Backend Status**: __________ (Pending/Complete)

---

## 📱 FIREBASE SETUP

- [ ] **Step 1**: Visit https://console.firebase.google.com
- [ ] **Step 2**: Click "Add Project"
- [ ] **Step 3**: Name: MOTTO-VISON-Staging
- [ ] **Step 4**: Enable Analytics (Yes)
- [ ] **Step 5**: Create Project

**Firebase Project Created**: __________ (Yes/No)

---

## 🤖 ANDROID APP SETUP

- [ ] **Step 1**: Click Android icon (🤖) or "Add App"
- [ ] **Step 2**: Package name: com.visionmotto
- [ ] **Step 3**: Register app
- [ ] **Step 4**: Download google-services.json
- [ ] **Step 5**: Place in: android/app/google-services.json
- [ ] **Step 6**: Copy Android App ID: ______________________

**Android Setup**: __________ (Pending/Complete)

---

## 🍎 iOS APP SETUP

- [ ] **Step 1**: Click iOS icon (🍎) or "Add App"
- [ ] **Step 2**: Bundle ID: com.visionmotto
- [ ] **Step 3**: Register app
- [ ] **Step 4**: Download GoogleService-Info.plist
- [ ] **Step 5**: Place in: ios/MOTTOVISION/GoogleService-Info.plist
- [ ] **Step 6**: Copy iOS App ID: ______________________

**iOS Setup**: __________ (Pending/Complete)

---

## 🔧 UPDATE MOBILE APP

- [ ] **Step 1**: Run in terminal:
  ```
  cd /Users/orlandhino/MOTTO-VISON
  cat > src/config/api.ts << 'EOCONFIG'
  export const API_BASE_URL = 'https://your-render-url.onrender.com';
  export default { baseURL: API_BASE_URL, timeout: 30000 };
  EOCONFIG
  ```
- [ ] **Step 2**: Replace URL with your actual Render URL

**Mobile App Updated**: __________ (Yes/No)

---

## 🚀 DEPLOY MOBILE APPS

- [ ] **Step 1**: Login to Firebase CLI: `firebase login`
- [ ] **Step 2**: Initialize: `firebase init` (select App Distribution)
- [ ] **Step 3**: Run: `./deploy-mobile-complete.sh`
- [ ] **Step 4**: Choose option: 3 (Both platforms)
- [ ] **Step 5**: Enter Android App ID when prompted
- [ ] **Step 6**: Enter iOS App ID when prompted
- [ ] **Step 7**: Wait for builds (20 minutes)
- [ ] **Step 8**: Verify upload success

**Mobile Apps Deployed**: __________ (Yes/No)

---

## 👥 INVITE TESTERS

- [ ] **Step 1**: Go to Firebase Console → App Distribution
- [ ] **Step 2**: Click "Testers & Groups"
- [ ] **Step 3**: Click "Add Testers"
- [ ] **Step 4**: Enter tester emails
- [ ] **Step 5**: Select testers
- [ ] **Step 6**: Click "Distribute"

**Testers Invited**: __________ (Yes/No)

---

## ✅ FINAL VERIFICATION

- [ ] Backend /health returns {"status":"healthy"}
- [ ] Backend /docs shows API documentation
- [ ] Android app appears in Firebase Console
- [ ] iOS app appears in Firebase Console
- [ ] Testers received email invitations
- [ ] Downloaded and tested apps work
- [ ] Chat messages get AI responses
- [ ] All features functional

**DEPLOYMENT STATUS**: __________ (Complete/In Progress)

---

## 🎊 COMPLETION

**Date Completed**: __________  
**Backend URL**: __________  
**Total Time**: __________ minutes  
**Total Cost**: $0 ✅

**Status**: 🟢 STAGING ENVIRONMENT LIVE!

---

Print this checklist and mark items as you complete them!
