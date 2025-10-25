#!/bin/bash
#
# Deploy MOTTO iOS App to TestFlight (Apple's Official Beta)
# Alternative to Firebase for iOS
#

set -e

echo "✈️  MOTTO TestFlight Deployment"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "${RED}❌ iOS builds require macOS${NC}"
    exit 1
fi

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "${RED}❌ Xcode not found${NC}"
    echo "   Install from: https://apps.apple.com/app/xcode/id497799835"
    exit 1
fi
echo "${GREEN}✅ Xcode found${NC}"
echo ""

# Check for Apple Developer account
echo "${YELLOW}⚠️  TestFlight requires Apple Developer Program membership${NC}"
echo "   Cost: \$99/year"
echo "   Sign up: https://developer.apple.com/programs/"
echo ""
read -p "Do you have an Apple Developer account? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "${YELLOW}💡 Alternative: Use Firebase App Distribution (free)${NC}"
    echo "   Run: ./deploy-ios-firebase.sh"
    exit 0
fi
echo ""

cd "$(dirname "$0")/ios"
echo "📂 Working directory: $(pwd)"
echo ""

# Install pods
echo "📦 Installing CocoaPods dependencies..."
pod install
echo "${GREEN}✅ Pods installed${NC}"
echo ""

# Open Xcode
echo "🔨 Opening Xcode..."
echo ""
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}MANUAL STEPS IN XCODE:${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. ${YELLOW}Select Device:${NC}"
echo "   - Top toolbar: Select 'Any iOS Device (arm64)'"
echo ""
echo "2. ${YELLOW}Configure Signing:${NC}"
echo "   - Select MOTTOVISION target"
echo "   - Signing & Capabilities tab"
echo "   - Team: Select your Apple Developer team"
echo "   - Signing Certificate: Automatic"
echo ""
echo "3. ${YELLOW}Archive:${NC}"
echo "   - Menu: Product → Archive"
echo "   - Wait 5-10 minutes for build"
echo ""
echo "4. ${YELLOW}Upload to TestFlight:${NC}"
echo "   - Organizer window appears"
echo "   - Click 'Distribute App'"
echo "   - Choose 'App Store Connect'"
echo "   - Click 'Upload'"
echo "   - Click 'Next' through all steps"
echo "   - Click 'Upload'"
echo ""
echo "5. ${YELLOW}TestFlight Processing:${NC}"
echo "   - Apple processes build (30-60 min)"
echo "   - You'll receive email when ready"
echo "   - Add testers in App Store Connect"
echo ""
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

open MOTTOVISION.xcworkspace

echo ""
echo "${GREEN}📱 Xcode opened!${NC}"
echo ""
echo "${BLUE}After uploading to TestFlight:${NC}"
echo "  1. Visit: https://appstoreconnect.apple.com"
echo "  2. My Apps → MOTTO → TestFlight"
echo "  3. Add internal testers (Apple Developer team)"
echo "  4. Add external testers (up to 10,000)"
echo "  5. Testers get invite via email"
echo "  6. They install via TestFlight app"
echo ""
echo "🎊 TestFlight is Apple's official beta testing platform!"

