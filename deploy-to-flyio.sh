#!/bin/bash
#
# Deploy MOTTO Backend to Fly.io
# FREE tier with no sleep - production quality!
#

set -e

echo "🪰 MOTTO Fly.io Deployment"
echo "==========================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "${GREEN}✅ Fly.io - Production-Quality Free Tier!${NC}"
echo ""
echo "${BLUE}Free Tier Benefits:${NC}"
echo "  ✅ Apps NEVER sleep (vs Render 15min)"
echo "  ✅ 3 VMs with 256MB RAM"
echo "  ✅ 160GB bandwidth/month"
echo "  ✅ Free PostgreSQL (3GB)"
echo "  ✅ Global edge network"
echo ""
echo "${YELLOW}⚠️  Requires credit card (but won't charge on free tier)${NC}"
echo ""

# Check flyctl
if ! command -v flyctl &> /dev/null; then
    echo "${YELLOW}📦 Installing Fly.io CLI...${NC}"
    curl -L https://fly.io/install.sh | sh
    
    # Add to PATH for current session
    export FLYCTL_INSTALL="$HOME/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
    
    echo "${GREEN}✅ Fly.io CLI installed${NC}"
else
    echo "${GREEN}✅ Fly.io CLI found${NC}"
fi
echo ""

# Check if logged in
echo "🔐 Checking Fly.io authentication..."
if ! flyctl auth whoami &> /dev/null; then
    echo "${YELLOW}Please login to Fly.io:${NC}"
    flyctl auth login
    echo "${GREEN}✅ Logged in to Fly.io${NC}"
else
    echo "${GREEN}✅ Already logged in to Fly.io${NC}"
fi
echo ""

# Navigate to backend
cd "$(dirname "$0")/backend"
echo "📂 Working directory: $(pwd)"
echo ""

# Create Dockerfile if doesn't exist
if [ ! -f "Dockerfile" ]; then
    echo "📝 Creating Dockerfile..."
    cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Initialize database
RUN python setup_db.py init || echo "DB init will run on startup"

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main_improved:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
    echo "${GREEN}✅ Dockerfile created${NC}"
fi
echo ""

# Launch app
echo "🚀 Launching Fly.io app..."
if [ ! -f "fly.toml" ]; then
    flyctl launch \
      --name motto-backend-staging \
      --region sjc \
      --no-deploy
    echo "${GREEN}✅ App configured${NC}"
else
    echo "${GREEN}✅ fly.toml found${NC}"
fi
echo ""

# Generate and set SECRET_KEY
echo "🔑 Setting SECRET_KEY..."
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
flyctl secrets set SECRET_KEY="$SECRET_KEY"
echo "${GREEN}✅ SECRET_KEY set${NC}"
echo ""

# Set other secrets
echo "⚙️  Setting environment variables..."
flyctl secrets set ENVIRONMENT=staging
flyctl secrets set ALLOWED_ORIGINS="*"
echo "${GREEN}✅ Environment configured${NC}"
echo ""

# Deploy
echo "🚀 Deploying to Fly.io..."
flyctl deploy

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "${GREEN}========================================${NC}"
echo ""

# Get app info
APP_URL=$(flyctl info --json 2>/dev/null | python3 -c "import sys,json; print('https://' + json.load(sys.stdin).get('Hostname', 'check-flyctl-info'))" 2>/dev/null || echo "https://motto-backend-staging.fly.dev")

echo "📍 Staging URL: ${BLUE}$APP_URL${NC}"
echo "📚 API Docs: ${BLUE}$APP_URL/docs${NC}"
echo "🏥 Health: ${BLUE}$APP_URL/health${NC}"
echo ""

# Test health
echo "🏥 Testing health endpoint..."
sleep 5
if command -v curl &> /dev/null; then
    if curl -f "${APP_URL}/health" &> /dev/null; then
        echo "${GREEN}✅ Backend is healthy!${NC}"
    else
        echo "${YELLOW}⚠️  Backend starting... (check in a minute)${NC}"
    fi
fi

echo ""
echo "${GREEN}🎊 Your backend is live on Fly.io!${NC}"
echo ""
echo "${BLUE}Fly.io Benefits:${NC}"
echo "  ✅ Never sleeps (always fast)"
echo "  ✅ Global edge network"
echo "  ✅ Production-quality infrastructure"
echo ""
echo "Next: Deploy mobile apps with ./deploy-mobile-complete.sh"

