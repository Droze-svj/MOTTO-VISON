#!/bin/bash

# Automatically add GoogleService-Info.plist to Xcode project
# Usage: ./scripts/add-firebase-config.sh [path-to-GoogleService-Info.plist]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="${PROJECT_ROOT}/ios/MOTTOVISON"
CONFIG_FILE="${IOS_DIR}/GoogleService-Info.plist"
PROJECT_FILE="${PROJECT_ROOT}/ios/MOTTOVISON.xcodeproj/project.pbxproj"

echo "${BLUE}🔥 Adding Firebase config to Xcode project...${NC}"
echo ""

# Check if file provided as argument
if [ -n "$1" ]; then
    SOURCE_FILE="$1"
else
    # Try common locations
    SOURCE_FILE="${HOME}/Downloads/GoogleService-Info.plist"
fi

# Expand ~ if used
SOURCE_FILE="${SOURCE_FILE/#\~/$HOME}"

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "${YELLOW}⚠️  GoogleService-Info.plist not found${NC}"
    echo ""
    echo "Please provide the path to your GoogleService-Info.plist:"
    echo "  1. Download from Firebase Console"
    echo "  2. Run: ./scripts/add-firebase-config.sh ~/Downloads/GoogleService-Info.plist"
    echo ""
    read -p "Enter path to GoogleService-Info.plist: " SOURCE_FILE
    
    # Expand ~ again
    SOURCE_FILE="${SOURCE_FILE/#\~/$HOME}"
    
    if [ ! -f "$SOURCE_FILE" ]; then
        echo "${RED}❌ File not found: ${SOURCE_FILE}${NC}"
        exit 1
    fi
fi

# Copy file
echo "${BLUE}Copying GoogleService-Info.plist...${NC}"
cp "$SOURCE_FILE" "$CONFIG_FILE"
echo "${GREEN}✅ File copied to: ${CONFIG_FILE}${NC}"

# Check if already in Xcode project
if grep -q "GoogleService-Info.plist" "$PROJECT_FILE" 2>/dev/null; then
    echo "${YELLOW}⚠️  GoogleService-Info.plist already referenced in Xcode project${NC}"
    echo "${BLUE}You may need to add it manually in Xcode:${NC}"
    echo "  1. Open ios/MOTTOVISON.xcworkspace"
    echo "  2. Drag GoogleService-Info.plist into project"
    echo "  3. Check 'Copy items if needed' and 'Add to targets: MOTTOVISON'"
else
    echo "${YELLOW}⚠️  Note: File added to filesystem, but Xcode project update requires manual step${NC}"
    echo ""
    echo "${BLUE}To complete setup:${NC}"
    echo "  1. Open ios/MOTTOVISON.xcworkspace in Xcode"
    echo "  2. Right-click MOTTOVISON folder → 'Add Files to MOTTOVISON'"
    echo "  3. Select GoogleService-Info.plist"
    echo "  4. Check 'Copy items if needed' and 'Add to targets: MOTTOVISON'"
    echo ""
    echo "${YELLOW}OR use CLI-only method (no Xcode needed!):${NC}"
    echo "  See: FIREBASE_NO_XCODE_SETUP.md"
fi

echo ""
echo "${GREEN}✅ Firebase config file added!${NC}"
echo "${BLUE}Location: ${CONFIG_FILE}${NC}"

