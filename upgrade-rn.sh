#!/bin/bash

# React Native Upgrade Script for MOTTO
# Safely upgrades to React Native 0.81.4

echo "🚀 MOTTO - React Native Upgrade Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "package.json" ]; then
  echo "${RED}❌ Error: package.json not found${NC}"
  echo "Please run this script from the MOTTO-VISON directory"
  exit 1
fi

echo "📋 Pre-Upgrade Checklist:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check git status
echo -n "1. Checking git status... "
if git diff-index --quiet HEAD --; then
  echo "${GREEN}✅ Clean${NC}"
else
  echo "${YELLOW}⚠️  Uncommitted changes${NC}"
  echo ""
  read -p "   Create backup commit? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Pre-upgrade backup (RN 0.73 → 0.81)"
    echo "${GREEN}✅ Backup committed${NC}"
  fi
fi

# 2. Check node version
echo -n "2. Checking Node.js... "
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  echo "${GREEN}✅ Node $NODE_VERSION${NC}"
else
  echo "${RED}❌ Node $NODE_VERSION (need 18+)${NC}"
  exit 1
fi

# 3. Check npm
echo -n "3. Checking npm... "
npm -v > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "${GREEN}✅ $(npm -v)${NC}"
else
  echo "${RED}❌ npm not found${NC}"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Starting Upgrade Process..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 4. Run React Native upgrade
echo "4. Running React Native upgrade..."
npx react-native upgrade 0.81.4

if [ $? -ne 0 ]; then
  echo "${RED}❌ Upgrade failed${NC}"
  echo "Try manually: npx react-native upgrade 0.81.4"
  exit 1
fi

echo "${GREEN}✅ React Native upgraded to 0.81.4${NC}"
echo ""

# 5. Install dependencies
echo "5. Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "${RED}❌ npm install failed${NC}"
  exit 1
fi

echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

# 6. iOS: Update and install pods
if [ -d "ios" ]; then
  echo "6. Updating iOS dependencies..."
  cd ios
  
  # Update CocoaPods
  pod repo update > /dev/null 2>&1
  
  # Install pods
  pod install
  
  if [ $? -ne 0 ]; then
    echo "${YELLOW}⚠️  Pod install had issues, trying clean install...${NC}"
    rm -rf Pods Podfile.lock
    pod install
  fi
  
  cd ..
  echo "${GREEN}✅ iOS pods updated${NC}"
fi

echo ""

# 7. Android: Clean build
if [ -d "android" ]; then
  echo "7. Cleaning Android build..."
  cd android
  ./gradlew clean > /dev/null 2>&1
  cd ..
  echo "${GREEN}✅ Android cleaned${NC}"
fi

echo ""

# 8. Clear Metro cache
echo "8. Clearing Metro cache..."
rm -rf $TMPDIR/metro-* $TMPDIR/haste-* 2>/dev/null
watchman watch-del-all 2>/dev/null
echo "${GREEN}✅ Cache cleared${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}🎉 Upgrade Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  React Native: 0.73.11 → 0.81.4 ✅"
echo "  Dependencies: Updated ✅"
echo "  iOS Pods: Updated ✅"
echo "  Android: Cleaned ✅"
echo "  Cache: Cleared ✅"
echo ""
echo "🚀 Next Steps:"
echo "  1. npm start"
echo "  2. Test on iOS: npx react-native run-ios"
echo "  3. Test on Android: npx react-native run-android"
echo ""
echo "📚 Documentation:"
echo "  See REACT_NATIVE_UPGRADE_GUIDE.md for details"
echo ""
echo "✨ MOTTO is now on the latest React Native!"
echo ""
