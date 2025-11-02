# Deployment Quick Start Guide

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   cd backend
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   railway variables set SECRET_KEY=your-secret-key
   railway variables set SENTRY_DSN=your-sentry-dsn
   ```

4. **Deploy**
   ```bash
   railway up
   ```

**Documentation**: See `docs/RAILWAY_QUICK_START.md`

### Option 2: Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up

2. **Create Web Service**
   - Connect GitHub repository
   - Set build command: `cd backend && pip install -r requirements.txt`
   - Set start command: `cd backend && uvicorn main_improved:app --host 0.0.0.0 --port $PORT`
   - Add environment variables

3. **Deploy**
   - Render auto-deploys on push to main

**Documentation**: See `docs/RENDER_DEPLOYMENT_STEPS.md`

### Option 3: Firebase

1. **Setup Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

2. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

**Documentation**: See `docs/FIREBASE_DEPLOYMENT_GUIDE.md`

## Frontend Deployment

### React Native Apps

**iOS**:
1. Build in Xcode
2. Archive for App Store
3. Submit via App Store Connect

**Android**:
1. Build APK/AAB: `cd android && ./gradlew assembleRelease`
2. Upload to Play Console
3. Submit for review

### Web App (if applicable)

**Vercel** (Recommended):
```bash
npm i -g vercel
vercel deploy
```

**Netlify**:
```bash
npm i -g netlify-cli
netlify deploy --prod
```

## Environment Setup

1. **Copy Environment Template**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Generate Secret Keys**
   ```python
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **Configure Database**
   - PostgreSQL for production
   - Set DATABASE_URL in environment

4. **Set Monitoring**
   - Configure SENTRY_DSN
   - Set up alerts

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates ready
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Documentation updated

## Post-Deployment

1. **Verify Deployment**
   - Check health endpoint
   - Test API endpoints
   - Verify monitoring working

2. **Monitor**
   - Check error rates
   - Monitor performance
   - Review logs

3. **Rollback Plan**
   - Keep previous version ready
   - Have rollback script ready

---

**Quick Commands**:
```bash
# Test backend locally
cd backend && uvicorn main_improved:app --reload

# Run tests
npm test
cd backend && pytest

# Check coverage
npm run test:coverage
```

