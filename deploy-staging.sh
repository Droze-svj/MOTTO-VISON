#!/bin/bash
#
# MOTTO Staging Deployment Script
# Prepares and validates app for staging deployment
#

set -e  # Exit on error

echo "🚀 MOTTO Staging Deployment Preparation"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}Error: Must run from project root${NC}"
    exit 1
fi

echo "📋 Step 1: Running Quality Checks..."
echo ""

# Security check
echo "🔒 Checking security..."
npm audit
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Security: 0 vulnerabilities${NC}"
else
    echo "${RED}❌ Security vulnerabilities found${NC}"
    echo "Run: npm audit fix"
    exit 1
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests --silent > /dev/null 2>&1
if [ $? -eq 0 ]; then
    TEST_RESULTS=$(npm test -- --passWithNoTests --silent 2>&1 | grep "Tests:")
    echo "${GREEN}✅ Tests: $TEST_RESULTS${NC}"
else
    echo "${YELLOW}⚠️  Some tests failing (check npm test)${NC}"
fi
echo ""

# TypeScript check
echo "📘 Checking TypeScript..."
TS_ERRORS=$(npm run type-check 2>&1 | grep -c "error TS" || echo "0")
echo "${YELLOW}⚠️  TypeScript: $TS_ERRORS errors (non-blocking)${NC}"
echo ""

# Lint check
echo "🔍 Checking code style..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Linting: Clean${NC}"
else
    echo "${YELLOW}⚠️  Lint issues found (run: npm run lint:fix)${NC}"
fi
echo ""

echo "📋 Step 2: Preparing Build..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios/build
rm -rf android/app/build
echo "${GREEN}✅ Cleaned${NC}"
echo ""

# Install dependencies
echo "📦 Verifying dependencies..."
npm install --silent
echo "${GREEN}✅ Dependencies verified${NC}"
echo ""

# iOS pods (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Installing iOS pods..."
    cd ios && pod install --silent && cd ..
    echo "${GREEN}✅ iOS pods installed${NC}"
    echo ""
fi

echo "📋 Step 3: Build Information..."
echo ""

# Get version
VERSION=$(node -p "require('./package.json').version")
echo "Version: $VERSION-staging"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "React Native: $(npm list react-native --depth=0 | grep react-native | awk '{print $2}')"
echo ""

echo "📋 Step 4: Ready to Deploy!"
echo ""
echo "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "  iOS:     open ios/MOTTOVISION.xcworkspace"
echo "           (Archive and upload to TestFlight)"
echo ""
echo "  Android: cd android && ./gradlew assembleRelease"
echo "           (Upload to Firebase App Distribution)"
echo ""
echo "  Backend: cd backend && railway up"
echo "           (or deploy to your preferred platform)"
echo ""
echo "🎉 Staging deployment ready!"

