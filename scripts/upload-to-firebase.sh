#!/bin/bash

# Upload iOS app to Firebase App Distribution
# Usage: ./scripts/upload-to-firebase.sh [release-notes]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_ID="${FIREBASE_APP_ID:-}"
GROUP="${FIREBASE_GROUP:-beta-testers}"
IPA_PATH="ios/build/export/MOTTOVISON.ipa"
USE_CLI_ONLY="${FIREBASE_CLI_ONLY:-true}"  # Default to CLI-only (no App ID needed)

# Get release notes
if [ -n "$1" ]; then
    RELEASE_NOTES="$1"
elif [ -d .git ]; then
    RELEASE_NOTES=$(git log -1 --pretty=%B 2>/dev/null || echo "New build")
else
    RELEASE_NOTES="New build - $(date '+%Y-%m-%d %H:%M')"
fi

# Check if IPA exists
if [ ! -f "$IPA_PATH" ]; then
    echo "${RED}❌ IPA file not found: ${IPA_PATH}${NC}"
    echo "${YELLOW}Building IPA first...${NC}"
    
    # Try to build
    if [ -f "scripts/build-ios-ipa.sh" ]; then
        ./scripts/build-ios-ipa.sh
    else
        echo "${RED}❌ Build script not found. Please build manually first.${NC}"
        exit 1
    fi
fi

# Load .env.firebase if exists
if [ -f .env.firebase ]; then
    source .env.firebase
    if [ -n "$FIREBASE_APP_ID" ]; then
        APP_ID="$FIREBASE_APP_ID"
        USE_CLI_ONLY="false"  # Use App ID if provided
    fi
    if [ -n "$FIREBASE_GROUP" ]; then
        GROUP="$FIREBASE_GROUP"
    fi
    if [ -n "$FIREBASE_CLI_ONLY" ]; then
        USE_CLI_ONLY="$FIREBASE_CLI_ONLY"
    fi
fi

# Check if firebase-tools is available
if ! command -v firebase &> /dev/null && ! command -v npx &> /dev/null; then
    echo "${RED}❌ firebase-tools not found${NC}"
    echo "${YELLOW}Installing...${NC}"
    npm install -g firebase-tools
fi

# Upload using CLI-only method (no App ID needed)
if [ "$USE_CLI_ONLY" = "true" ] || [ -z "$APP_ID" ]; then
    echo "${BLUE}🔥 Uploading to Firebase App Distribution (CLI-only mode)...${NC}"
    echo ""
    echo "  Mode: CLI-only (no App ID needed)"
    echo "  Group: ${GROUP}"
    echo "  IPA: ${IPA_PATH}"
    echo "  Notes: ${RELEASE_NOTES}"
    echo ""
    
    if command -v firebase &> /dev/null; then
        firebase app-distribution:distribute \
            "$IPA_PATH" \
            --app-type ios \
            --groups "$GROUP" \
            --release-notes "$RELEASE_NOTES"
    else
        npx firebase-tools app-distribution:distribute \
            "$IPA_PATH" \
            --app-type ios \
            --groups "$GROUP" \
            --release-notes "$RELEASE_NOTES"
    fi
else
    # Upload using App ID method (SDK integration)
    echo "${BLUE}🔥 Uploading to Firebase App Distribution (App ID mode)...${NC}"
    echo ""
    echo "  App ID: ${APP_ID}"
    echo "  Group: ${GROUP}"
    echo "  IPA: ${IPA_PATH}"
    echo "  Notes: ${RELEASE_NOTES}"
    echo ""
    
    if command -v firebase &> /dev/null; then
        firebase app-distribution:distribute \
            "$IPA_PATH" \
            --app "$APP_ID" \
            --groups "$GROUP" \
            --release-notes "$RELEASE_NOTES"
    else
        npx firebase-tools app-distribution:distribute \
            "$IPA_PATH" \
            --app "$APP_ID" \
            --groups "$GROUP" \
            --release-notes "$RELEASE_NOTES"
    fi
fi

echo ""
echo "${GREEN}✅ Upload complete!${NC}"
echo "${BLUE}Testers will receive email notification.${NC}"
echo ""
echo "${YELLOW}View in Firebase Console:${NC}"
echo "https://console.firebase.google.com/project/_/appdistribution"

