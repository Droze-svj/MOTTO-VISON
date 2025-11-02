#!/bin/bash

# Build iOS App for TestFlight
# This script automates the process of building and uploading to TestFlight

set -e  # Exit on error

echo "🚀 Building MOTTO for TestFlight..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="MOTTOVISON"
SCHEME="MOTTOVISON"
WORKSPACE="ios/${PROJECT_NAME}.xcworkspace"
BUNDLE_ID="com.yourcompany.motto"  # Update this with your actual bundle ID
EXPORT_OPTIONS="ios/ExportOptions.plist"
ARCHIVE_PATH="ios/build/${PROJECT_NAME}.xcarchive"
EXPORT_PATH="ios/build/export"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: xcodebuild not found. Please install Xcode."
    exit 1
fi

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must be run on macOS."
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "${BLUE}Current Version: ${VERSION}${NC}"

# Auto-increment build number
BUILD_NUMBER=$(date +%Y%m%d%H%M%S)  # Use timestamp as build number
echo "${BLUE}Build Number: ${BUILD_NUMBER}${NC}"
echo ""

# Step 1: Clean build
echo "${YELLOW}📦 Step 1: Cleaning build folder...${NC}"
rm -rf ios/build
mkdir -p ios/build

# Step 2: Install pods
echo "${YELLOW}📦 Step 2: Installing CocoaPods dependencies...${NC}"
cd ios
pod install
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
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${VERSION}" "ios/${PROJECT_NAME}/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${BUILD_NUMBER}" "ios/${PROJECT_NAME}/Info.plist"

echo "${GREEN}✅ Version: ${VERSION} (Build: ${BUILD_NUMBER})${NC}"
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
    | xcpretty

if [ $? -ne 0 ]; then
    echo "❌ Error: Archive failed"
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
    | xcpretty

if [ $? -ne 0 ]; then
    echo "❌ Error: Export failed"
    exit 1
fi

echo "${GREEN}✅ IPA exported successfully${NC}"
echo ""

# Step 7: Upload to App Store Connect
echo "${YELLOW}📦 Step 7: Uploading to App Store Connect...${NC}"
IPA_FILE="${EXPORT_PATH}/${PROJECT_NAME}.ipa"

if [ ! -f "${IPA_FILE}" ]; then
    echo "❌ Error: IPA file not found at ${IPA_FILE}"
    exit 1
fi

# Check if altool or xcrun notarytool is available
if command -v xcrun altool &> /dev/null; then
    echo "${BLUE}Using altool to upload...${NC}"
    xcrun altool --upload-app \
        --type ios \
        --file "${IPA_FILE}" \
        --apiKey "$APP_STORE_CONNECT_API_KEY" \
        --apiIssuer "$APP_STORE_CONNECT_ISSUER_ID"
elif command -v xcrun notarytool &> /dev/null; then
    echo "${BLUE}Using notarytool to upload...${NC}"
    echo "${YELLOW}Note: Manual upload required. Open Xcode → Window → Organizer → Upload${NC}"
    echo "${BLUE}IPA Location: ${IPA_FILE}${NC}"
else
    echo "${YELLOW}⚠️  Automatic upload not available.${NC}"
    echo "${BLUE}Manual Upload Instructions:${NC}"
    echo "1. Open Xcode"
    echo "2. Window → Organizer"
    echo "3. Select the archive: ${ARCHIVE_PATH}"
    echo "4. Click 'Distribute App'"
    echo "5. Choose 'App Store Connect'"
    echo "6. Follow the prompts"
    echo ""
    echo "Or use Transporter app:"
    echo "1. Download 'Transporter' from Mac App Store"
    echo "2. Drag ${IPA_FILE} into Transporter"
    echo "3. Click 'Deliver'"
fi

echo ""
echo "${GREEN}✅ Build complete!${NC}"
echo ""
echo "${BLUE}Summary:${NC}"
echo "  Version: ${VERSION}"
echo "  Build: ${BUILD_NUMBER}"
echo "  Archive: ${ARCHIVE_PATH}"
echo "  IPA: ${IPA_FILE}"
echo ""
echo "${YELLOW}Next Steps:${NC}"
echo "1. Upload to App Store Connect (if not done automatically)"
echo "2. Wait for processing (10-30 minutes)"
echo "3. Go to App Store Connect → TestFlight"
echo "4. Select build and add to testing group"
echo "5. Share TestFlight link with testers"
echo ""

