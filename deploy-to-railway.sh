#!/bin/bash
#
# Deploy MOTTO Backend to Railway
# Complete automated deployment
#

set -e

echo "🚂 MOTTO Railway Deployment"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "${YELLOW}📦 Installing Railway CLI...${NC}"
    npm install -g @railway/cli
    echo "${GREEN}✅ Railway CLI installed${NC}"
else
    echo "${GREEN}✅ Railway CLI found${NC}"
fi
echo ""

# Check if logged in
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "${YELLOW}Please login to Railway:${NC}"
    railway login
    echo "${GREEN}✅ Logged in to Railway${NC}"
else
    RAILWAY_USER=$(railway whoami 2>&1 | grep "Logged in as" || echo "Logged in")
    echo "${GREEN}✅ $RAILWAY_USER${NC}"
fi
echo ""

# Navigate to backend
cd "$(dirname "$0")/backend"
echo "📂 Working directory: $(pwd)"
echo ""

# Check if project exists
echo "🔍 Checking Railway project..."
if ! railway status &> /dev/null; then
    echo "${YELLOW}📝 Creating new Railway project...${NC}"
    railway init
    echo "${GREEN}✅ Railway project created${NC}"
else
    echo "${GREEN}✅ Railway project found${NC}"
fi
echo ""

# Generate SECRET_KEY if needed
echo "🔑 Checking SECRET_KEY..."
if ! railway variables get SECRET_KEY &> /dev/null; then
    echo "${YELLOW}Generating SECRET_KEY...${NC}"
    SECRET_KEY=$(python3 setup_db.py generate-key 2>&1 | tail -1)
    railway variables set SECRET_KEY="$SECRET_KEY"
    echo "${GREEN}✅ SECRET_KEY generated and set${NC}"
else
    echo "${GREEN}✅ SECRET_KEY already configured${NC}"
fi
echo ""

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set ENVIRONMENT=staging
railway variables set DEBUG=false
railway variables set LOG_LEVEL=INFO
echo "${GREEN}✅ Environment variables set${NC}"
echo ""

# Link PostgreSQL database (optional)
echo "${BLUE}💡 Tip: Add PostgreSQL database in Railway dashboard for production${NC}"
echo "${BLUE}   For now, using SQLite (auto-configured)${NC}"
echo ""

# Deploy
echo "🚀 Deploying to Railway..."
echo ""
railway up

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "${GREEN}========================================${NC}"
echo ""

# Get deployment URL
RAILWAY_URL=$(railway status 2>&1 | grep "https://" | awk '{print $NF}' || echo "Check Railway dashboard")
echo "📍 Staging URL: ${BLUE}$RAILWAY_URL${NC}"
echo ""

# Health check
echo "🏥 Testing health endpoint..."
if command -v curl &> /dev/null; then
    sleep 5  # Wait for deployment
    if curl -f "${RAILWAY_URL}/health" &> /dev/null; then
        echo "${GREEN}✅ Backend is healthy!${NC}"
    else
        echo "${YELLOW}⚠️  Backend starting... (check in a minute)${NC}"
    fi
else
    echo "${YELLOW}💡 Visit: ${RAILWAY_URL}/health${NC}"
fi
echo ""

echo "📚 API Documentation: ${BLUE}${RAILWAY_URL}/docs${NC}"
echo ""

echo "${GREEN}Next steps:${NC}"
echo "  1. Visit: $RAILWAY_URL/docs"
echo "  2. Test API endpoints"
echo "  3. Update mobile app API_BASE_URL to: $RAILWAY_URL"
echo "  4. Build and test mobile app"
echo ""
echo "🎊 Your backend is live on Railway!"

