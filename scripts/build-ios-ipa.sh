#!/bin/bash

# Build iOS App as IPA for TestFlight (Using Transporter)
# Creates IPA file that can be uploaded via Transporter app

set -e

echo "📱 Building MOTTO for TestFlight (IPA)..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_NAME="MOTTOVISON"
SCHEME="MOTTOVISON"
WORKSPACE="ios/${PROJECT_NAME}.xcworkspace"
BUNDLE_ID="com.yourcompany.motto"  # Update with your bundle ID
EXPORT_OPTIONS="ios/ExportOptions.plist"
ARCHIVE_PATH="ios/build/${PROJECT_NAME}.xcarchive"
EXPORT_PATH="ios/build/export"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}❌ Error: package.json not found. Run from project root.${NC}"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "${RED}❌ Error: xcodebuild not found. Please install Xcode.${NC}"
    exit 1
fi

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "${RED}❌ Error: This script must be run on macOS.${NC}"
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "${BLUE}Current Version: ${VERSION}${NC}"

# Auto-increment build number (timestamp)
BUILD_NUMBER=$(date +%Y%m%d%H%M%S)
echo "${BLUE}Build Number: ${BUILD_NUMBER}${NC}"
echo ""

# Step 1: Clean build
echo "${YELLOW}📦 Step 1: Cleaning build folder...${NC}"
rm -rf ios/build
mkdir -p ios/build

# Step 2: Install pods
echo "${YELLOW}📦 Step 2: Installing CocoaPods dependencies...${NC}"
cd ios
if [ ! -d "Pods" ]; then
    pod install
else
    pod install --repo-update
fi
cd ..

# Step 3: Bundle React Native
echo "${YELLOW}📦 Step 3: Bundling React Native JavaScript...${NC}"
npx react-native bundle \
    --platform ios \
    --dev false \
    --entry-file index.js \
    --bundle-output ios/main.jsbundle \
    --assets-dest ios/

# Step 4: Update Info.plist with version and build number
echo "${YELLOW}📦 Step 4: Updating version information...${NC}"
if [ -f "ios/${PROJECT_NAME}/Info.plist" ]; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${VERSION}" "ios/${PROJECT_NAME}/Info.plist"
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${BUILD_NUMBER}" "ios/${PROJECT_NAME}/Info.plist"
    echo "${GREEN}✅ Version: ${VERSION} (Build: ${BUILD_NUMBER})${NC}"
else
    echo "${YELLOW}⚠️  Info.plist not found, skipping version update${NC}"
fi
echo ""

# Step 5: Create archive
echo "${YELLOW}📦 Step 5: Creating archive...${NC}"
xcodebuild archive \
    -workspace "${WORKSPACE}" \
    -scheme "${SCHEME}" \
    -configuration Release \
    -archivePath "${ARCHIVE_PATH}" \
    -destination "generic/platform=iOS" \
    CODE_SIGN_IDENTITY="iPhone Developer" \
    CODE_SIGN_STYLE="Automatic" \
    PROVISIONING_PROFILE_SPECIFIER="" \
    2>&1 | grep -v "warning:" || true

if [ $? -ne 0 ]; then
    echo "${RED}❌ Error: Archive failed${NC}"
    exit 1
fi

echo "${GREEN}✅ Archive created successfully${NC}"
echo ""

# Step 6: Export IPA
echo "${YELLOW}📦 Step 6: Exporting IPA...${NC}"
xcodebuild -exportArchive \
    -archivePath "${ARCHIVE_PATH}" \
    -exportPath "${EXPORT_PATH}" \
    -exportOptionsPlist "${EXPORT_OPTIONS}" \
    2>&1 | grep -v "warning:" || true

if [ $? -ne 0 ]; then
    echo "${RED}❌ Error: Export failed${NC}"
    exit 1
fi

echo "${GREEN}✅ IPA exported successfully${NC}"
echo ""

# Step 7: Locate IPA file
IPA_FILE="${EXPORT_PATH}/${PROJECT_NAME}.ipa"

if [ ! -f "${IPA_FILE}" ]; then
    # Sometimes the file might have a different name
    IPA_FILE=$(find "${EXPORT_PATH}" -name "*.ipa" | head -1)
fi

if [ -f "${IPA_FILE}" ]; then
    FILE_SIZE=$(du -h "${IPA_FILE}" | cut -f1)
    echo ""
    echo "${GREEN}✅ Build complete!${NC}"
    echo ""
    echo "${BLUE}📦 IPA File:${NC}"
    echo "   ${IPA_FILE}"
    echo "   Size: ${FILE_SIZE}"
    echo ""
    echo "${BLUE}📋 Next Steps:${NC}"
    echo ""
    echo "${GREEN}Option 1: Transporter App (Easiest)${NC}"
    echo "1. Open Transporter app (from Mac App Store)"
    echo "2. Sign in with your Apple Developer account"
    echo "3. Drag this file into Transporter:"
    echo "   ${IPA_FILE}"
    echo "4. Click 'Deliver'"
    echo "5. Wait for upload to complete"
    echo ""
    echo "${GREEN}Option 2: Command Line Upload${NC}"
    echo "Run: ./scripts/upload-to-testflight.sh ${IPA_FILE}"
    echo ""
    echo "${BLUE}After Upload:${NC}"
    echo "1. Wait 10-30 minutes for processing"
    echo "2. Go to App Store Connect → TestFlight"
    echo "3. Add build to testing group"
    echo "4. Get TestFlight link and share!"
    echo ""
else
    echo "${RED}❌ Error: IPA file not found${NC}"
    echo "Check export folder: ${EXPORT_PATH}"
    exit 1
fi

