#!/bin/bash
#
# Deploy MOTTO Mobile Apps (iOS + Android) to Firebase
# Complete mobile deployment for beta testing
#

set -e

echo "📱 MOTTO Complete Mobile Deployment"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo "${BLUE}This script will deploy:${NC}"
echo "  🤖 Android → Firebase App Distribution"
echo "  🍎 iOS → Firebase App Distribution OR TestFlight"
echo ""

# Check platform
echo "📱 Select deployment platform:"
echo ""
echo "  1) Android only (Firebase)"
echo "  2) iOS only (Firebase or TestFlight)"
echo "  3) Both Android + iOS (Firebase)"
echo "  4) iOS TestFlight + Android Firebase"
echo ""
read -p "Enter choice (1-4): " CHOICE
echo ""

case $CHOICE in
    1)
        echo "${GREEN}🤖 Deploying Android to Firebase...${NC}"
        ./deploy-to-firebase.sh
        ;;
    2)
        echo "${GREEN}🍎 iOS Deployment Options:${NC}"
        echo "  a) Firebase App Distribution (free, no Apple Dev account)"
        echo "  b) TestFlight (requires \$99/year Apple Developer)"
        echo ""
        read -p "Choose (a/b): " IOS_CHOICE
        if [[ $IOS_CHOICE == "a" ]]; then
            ./deploy-ios-firebase.sh
        else
            ./deploy-ios-testflight.sh
        fi
        ;;
    3)
        echo "${GREEN}📱 Deploying both platforms to Firebase...${NC}"
        echo ""
        echo "🤖 Step 1: Android"
        ./deploy-to-firebase.sh
        echo ""
        echo "🍎 Step 2: iOS"
        ./deploy-ios-firebase.sh
        ;;
    4)
        echo "${GREEN}📱 Deploying to Apple + Google platforms...${NC}"
        echo ""
        echo "🤖 Step 1: Android → Firebase"
        ./deploy-to-firebase.sh
        echo ""
        echo "🍎 Step 2: iOS → TestFlight"
        ./deploy-ios-testflight.sh
        ;;
    *)
        echo "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}🎉 MOBILE DEPLOYMENT COMPLETE!${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "📚 Next Steps:"
echo "  1. Check Firebase Console / App Store Connect"
echo "  2. Invite beta testers"
echo "  3. Collect feedback"
echo "  4. Monitor crashes & analytics"
echo ""
echo "🎊 Your staging apps are ready for testing!"

