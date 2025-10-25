#!/bin/bash
#
# Deploy MOTTO Backend to Render.com (FREE)
# Most generous free tier available!
#

set -e

echo "🎨 MOTTO Render.com Deployment"
echo "==============================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${GREEN}✅ Render.com - Most Generous Free Tier!${NC}"
echo ""
echo "${BLUE}Free Tier Benefits:${NC}"
echo "  ✅ 750 hours/month (vs Railway's 500)"
echo "  ✅ Free PostgreSQL (90 days)"
echo "  ✅ Automatic HTTPS"
echo "  ✅ No credit card required"
echo "  ✅ Auto-deploy from Git"
echo ""

# Check for render.yaml
if [ -f "render.yaml" ]; then
    echo "${GREEN}✅ render.yaml configuration found${NC}"
else
    echo "${YELLOW}⚠️  render.yaml not found (will create manually)${NC}"
fi
echo ""

# Generate SECRET_KEY
echo "🔑 Generating SECRET_KEY..."
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
echo "${GREEN}✅ SECRET_KEY: $SECRET_KEY${NC}"
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}RENDER DEPLOYMENT OPTIONS:${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "${YELLOW}Option A: Blueprint (EASIEST - Recommended)${NC}"
echo ""
echo "1. Push code to GitHub (if not already):"
echo "   ${BLUE}git init${NC}"
echo "   ${BLUE}git add .${NC}"
echo "   ${BLUE}git commit -m 'Initial commit'${NC}"
echo "   ${BLUE}# Create repo on GitHub, then:${NC}"
echo "   ${BLUE}git remote add origin https://github.com/yourusername/motto.git${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "2. In Render Dashboard (https://dashboard.render.com):"
echo "   ${BLUE}New + → Blueprint${NC}"
echo "   ${BLUE}Connect your GitHub repository${NC}"
echo "   ${BLUE}Render finds render.yaml automatically${NC}"
echo "   ${BLUE}Click 'Apply'${NC}"
echo ""
echo "3. Add SECRET_KEY in dashboard:"
echo "   ${BLUE}Environment → Add Secret${NC}"
echo "   ${BLUE}Key: SECRET_KEY${NC}"
echo "   ${BLUE}Value: $SECRET_KEY${NC}"
echo ""
echo "4. Done! Render auto-deploys everything"
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "${YELLOW}Option B: Manual Setup (No GitHub needed)${NC}"
echo ""
echo "1. Visit: https://dashboard.render.com/register"
echo "2. Sign up (GitHub recommended)"
echo "3. Dashboard → New + → Web Service"
echo ""
echo "4. Configuration:"
echo "   ${BLUE}Name: motto-backend-staging${NC}"
echo "   ${BLUE}Environment: Python 3${NC}"
echo "   ${BLUE}Region: Oregon (or closest)${NC}"
echo "   ${BLUE}Branch: main${NC}"
echo "   ${BLUE}Root Directory: backend${NC}"
echo "   ${BLUE}Build Command: pip install -r requirements.txt${NC}"
echo "   ${BLUE}Start Command: uvicorn main_improved:app --host 0.0.0.0 --port \$PORT${NC}"
echo "   ${BLUE}Plan: Free${NC}"
echo ""
echo "5. Environment Variables:"
echo "   ${BLUE}SECRET_KEY = $SECRET_KEY${NC}"
echo "   ${BLUE}ENVIRONMENT = staging${NC}"
echo "   ${BLUE}DEBUG = false${NC}"
echo "   ${BLUE}ALLOWED_ORIGINS = *${NC}"
echo ""
echo "6. Click 'Create Web Service'"
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "${GREEN}After Deployment:${NC}"
echo "  📍 URL: https://motto-backend-staging.onrender.com"
echo "  📚 Docs: https://motto-backend-staging.onrender.com/docs"
echo "  🏥 Health: https://motto-backend-staging.onrender.com/health"
echo ""
echo "  ${YELLOW}Note: Apps sleep after 15min inactivity${NC}"
echo "  ${YELLOW}First request wakes it up (~30 seconds)${NC}"
echo ""

echo "${GREEN}Optional: Add PostgreSQL${NC}"
echo "  1. Dashboard → New + → PostgreSQL"
echo "  2. Name: motto-db"
echo "  3. Plan: Free"
echo "  4. Render auto-connects DATABASE_URL"
echo "  5. Free for 90 days, then \$7/month"
echo ""

echo "🎊 Deploy to Render.com - Most generous free tier!"
echo ""
echo "Start at: ${BLUE}https://dashboard.render.com${NC}"
