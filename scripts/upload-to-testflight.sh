#!/bin/bash

# Upload IPA to TestFlight via Command Line
# Uses xcrun altool or notarytool

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

IPA_FILE="$1"

if [ -z "$IPA_FILE" ]; then
    echo "${RED}❌ Error: IPA file not provided${NC}"
    echo "Usage: $0 <path-to-ipa>"
    echo ""
    echo "Example:"
    echo "  $0 ios/build/export/MOTTOVISON.ipa"
    exit 1
fi

if [ ! -f "$IPA_FILE" ]; then
    echo "${RED}❌ Error: IPA file not found: ${IPA_FILE}${NC}"
    exit 1
fi

echo "${BLUE}📤 Uploading to TestFlight...${NC}"
echo "File: ${IPA_FILE}"
echo ""

# Check for API key method (preferred)
if [ -n "$APP_STORE_CONNECT_API_KEY" ] && [ -n "$APP_STORE_CONNECT_ISSUER_ID" ] && [ -n "$APP_STORE_CONNECT_KEY_ID" ]; then
    echo "${BLUE}Using API Key authentication...${NC}"
    
    # Method 1: Using xcrun notarytool (if available)
    if command -v xcrun &> /dev/null && xcrun notarytool --help &> /dev/null; then
        echo "${YELLOW}Using notarytool...${NC}"
        # Notarytool is for notarization, not direct upload
        # We'll use altool instead
    fi
    
    # Method 2: Using xcrun altool
    if command -v xcrun &> /dev/null; then
        echo "${BLUE}Uploading with altool...${NC}"
        
        # Try to find the .p8 key file
        KEY_FILE="${APP_STORE_CONNECT_KEY_FILE:-./AuthKey_${APP_STORE_CONNECT_KEY_ID}.p8}"
        
        if [ ! -f "$KEY_FILE" ]; then
            echo "${YELLOW}⚠️  Key file not found at: ${KEY_FILE}${NC}"
            echo "${YELLOW}Please set APP_STORE_CONNECT_KEY_FILE or place key file in current directory${NC}"
            echo ""
            echo "${BLUE}Using username/password method instead...${NC}"
        else
            xcrun altool --upload-app \
                --type ios \
                --file "$IPA_FILE" \
                --apiKey "$APP_STORE_CONNECT_API_KEY" \
                --apiIssuer "$APP_STORE_CONNECT_ISSUER_ID" \
                2>&1 | tee upload.log
            
            if [ $? -eq 0 ]; then
                echo "${GREEN}✅ Upload successful!${NC}"
                echo "${BLUE}Check App Store Connect → TestFlight for processing status${NC}"
                exit 0
            else
                echo "${RED}❌ Upload failed. Check upload.log for details${NC}"
                exit 1
            fi
        fi
    fi
fi

# Fallback: Username/Password method (requires app-specific password)
if [ -n "$APP_STORE_CONNECT_USERNAME" ] && [ -n "$APP_STORE_CONNECT_PASSWORD" ]; then
    echo "${BLUE}Using username/password authentication...${NC}"
    
    xcrun altool --upload-app \
        --type ios \
        --file "$IPA_FILE" \
        --username "$APP_STORE_CONNECT_USERNAME" \
        --password "$APP_STORE_CONNECT_PASSWORD" \
        2>&1 | tee upload.log
    
    if [ $? -eq 0 ]; then
        echo "${GREEN}✅ Upload successful!${NC}"
        echo "${BLUE}Check App Store Connect → TestFlight for processing status${NC}"
        exit 0
    else
        echo "${RED}❌ Upload failed. Check upload.log for details${NC}"
        exit 1
    fi
fi

# If no authentication method found
echo "${RED}❌ No authentication method configured${NC}"
echo ""
echo "${YELLOW}Setup Options:${NC}"
echo ""
echo "${GREEN}Option 1: Use Transporter App (Easiest)${NC}"
echo "1. Open Transporter app"
echo "2. Sign in with Apple ID"
echo "3. Drag IPA file into Transporter"
echo "4. Click 'Deliver'"
echo ""
echo "${GREEN}Option 2: Configure API Keys${NC}"
echo "Set environment variables:"
echo "  export APP_STORE_CONNECT_API_KEY='your-api-key'"
echo "  export APP_STORE_CONNECT_ISSUER_ID='your-issuer-id'"
echo "  export APP_STORE_CONNECT_KEY_ID='your-key-id'"
echo "  export APP_STORE_CONNECT_KEY_FILE='./AuthKey_XXXXX.p8'"
echo ""
echo "${GREEN}Option 3: Configure Username/Password${NC}"
echo "Set environment variables:"
echo "  export APP_STORE_CONNECT_USERNAME='your-email@example.com'"
echo "  export APP_STORE_CONNECT_PASSWORD='your-app-specific-password'"
echo ""
echo "${BLUE}For now, use Transporter app (Option 1) - it's the easiest!${NC}"

