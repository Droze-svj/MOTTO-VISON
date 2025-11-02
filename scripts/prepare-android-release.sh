#!/bin/bash

# Prepare Android App for Release/Testing
# Checks configuration and prepares AAB for Play Console

set -e

echo "🤖 Preparing MOTTO for Android Release..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}❌ Error: package.json not found. Run from project root.${NC}"
    exit 1
fi

# Check Android folder
if [ ! -d "android" ]; then
    echo "${RED}❌ Error: android folder not found.${NC}"
    exit 1
fi

echo "${BLUE}📋 Checking configuration...${NC}"

# Check API URL
if grep -q "motto-backend.onrender.com" android/app/src/main/res/values/api_config.xml 2>/dev/null; then
    echo "${GREEN}✅ API URL configured${NC}"
else
    echo "${YELLOW}⚠️  API URL may not be configured. Check api_config.xml${NC}"
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "${BLUE}Current Version: ${VERSION}${NC}"

# Check gradle version
if [ -f "android/app/build.gradle" ]; then
    VERSION_CODE=$(grep "versionCode" android/app/build.gradle | head -1 | sed 's/.*versionCode //' | sed 's/[^0-9].*//')
    VERSION_NAME=$(grep "versionName" android/app/build.gradle | head -1 | sed 's/.*versionName "//' | sed 's/".*//')
    echo "${BLUE}Android Version Code: ${VERSION_CODE}${NC}"
    echo "${BLUE}Android Version Name: ${VERSION_NAME}${NC}"
fi

echo ""
echo "${YELLOW}📦 Building release AAB...${NC}"
echo ""

cd android

# Clean previous builds
echo "${BLUE}Cleaning...${NC}"
./gradlew clean

# Build release bundle
echo "${BLUE}Building release bundle...${NC}"
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Build successful!${NC}"
    echo ""
    
    AAB_FILE="app/build/outputs/bundle/release/app-release.aab"
    
    if [ -f "$AAB_FILE" ]; then
        FILE_SIZE=$(du -h "$AAB_FILE" | cut -f1)
        echo "${GREEN}📦 AAB Location: android/${AAB_FILE}${NC}"
        echo "${GREEN}📊 File Size: ${FILE_SIZE}${NC}"
        echo ""
        echo "${BLUE}Next Steps:${NC}"
        echo "1. Go to: https://play.google.com/console"
        echo "2. Create app (if not done)"
        echo "3. Testing → Internal testing → Create new release"
        echo "4. Upload: android/${AAB_FILE}"
        echo "5. Get testing link and share!"
        echo ""
    else
        echo "${RED}❌ AAB file not found at expected location${NC}"
    fi
else
    echo "${RED}❌ Build failed${NC}"
    exit 1
fi

cd ..

echo "${GREEN}✅ Ready for Play Console upload!${NC}"

