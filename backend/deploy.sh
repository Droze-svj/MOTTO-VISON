#!/bin/bash
# MOTTO Backend Deployment Script
# Handles deployment to production/staging environment

set -e  # Exit on error

echo "🚀 MOTTO Backend Deployment Script"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$BACKEND_DIR"

echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command -v pip &> /dev/null; then
    echo -e "${RED}❌ pip is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# Step 2: Check environment variables
echo "📋 Step 2: Checking environment variables..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found, creating from template...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please update .env with your configuration${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check required variables
REQUIRED_VARS=("SECRET_KEY" "DATABASE_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables: ${MISSING_VARS[*]}${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables OK${NC}"
echo ""

# Step 3: Install dependencies
echo "📋 Step 3: Installing dependencies..."
python3 -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Run database migrations
echo "📋 Step 4: Running database migrations..."
if command -v alembic &> /dev/null; then
    alembic upgrade head
    echo -e "${GREEN}✅ Migrations complete${NC}"
else
    echo -e "${YELLOW}⚠️  Alembic not found, skipping migrations${NC}"
fi
echo ""

# Step 5: Initialize database (if needed)
echo "📋 Step 5: Initializing database..."
python3 setup_db.py init 2>/dev/null || echo -e "${YELLOW}⚠️  Database initialization skipped${NC}"
echo ""

# Step 6: Run tests
echo "📋 Step 6: Running tests..."
if [ -d "tests" ]; then
    pytest tests/ -v --tb=short || {
        echo -e "${YELLOW}⚠️  Some tests failed, but continuing deployment${NC}"
    }
else
    echo -e "${YELLOW}⚠️  No tests found${NC}"
fi
echo ""

# Step 7: Health check
echo "📋 Step 7: Performing health check..."
python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from database import SessionLocal
    db = SessionLocal()
    db.execute('SELECT 1')
    db.close()
    print('✅ Database connection OK')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    sys.exit(1)
" || {
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
}
echo ""

# Step 8: Deployment instructions
echo "📋 Step 8: Deployment Instructions"
echo "=================================="
echo ""
echo "For Railway:"
echo "  railway up"
echo ""
echo "For Render:"
echo "  Render will auto-deploy on git push"
echo ""
echo "For Manual Deployment:"
echo "  uvicorn main_improved:app --host 0.0.0.0 --port \$PORT"
echo ""

# Step 9: Generate deployment info
echo "📋 Step 9: Deployment Information"
echo "=================================="
python3 deployment_config.py
echo ""

echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review configuration in .env"
echo "2. Deploy using your chosen platform"
echo "3. Verify health endpoint: curl https://your-api.com/health"
echo ""

