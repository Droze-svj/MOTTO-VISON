#!/bin/bash

# Setup App Store Connect API Keys for TestFlight Upload
# Interactive script to help configure API keys

set -e

echo "🔑 Setting up App Store Connect API Keys"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "${BLUE}This will help you set up API keys for TestFlight uploads.${NC}"
echo "${YELLOW}API keys are more reliable than Transporter login!${NC}"
echo ""

# Step 1: Instructions
echo "${BLUE}Step 1: Get API Key from App Store Connect${NC}"
echo ""
echo "1. Go to: https://appstoreconnect.apple.com"
echo "2. Click your name (top right) → 'Users and Access'"
echo "3. Go to 'Keys' tab"
echo "4. Click '+' to generate new key"
echo "5. Name: 'TestFlight Upload'"
echo "6. Access: 'App Manager'"
echo "7. Click 'Generate'"
echo "8. Download the .p8 file (save it!)"
echo "9. Note the Key ID and Issuer ID"
echo ""

read -p "Press Enter when you have the .p8 file downloaded..."

# Step 2: Get Key ID
echo ""
echo "${BLUE}Step 2: Enter your Key ID${NC}"
echo "${YELLOW}(Example: ABC123DEFG)${NC}"
read -p "Key ID: " KEY_ID

# Step 3: Get Issuer ID
echo ""
echo "${BLUE}Step 3: Enter your Issuer ID${NC}"
echo "${YELLOW}(Example: 12345678-1234-1234-1234-123456789012)${NC}"
read -p "Issuer ID: " ISSUER_ID

# Step 4: Get Key File Location
echo ""
echo "${BLUE}Step 4: Where did you save the .p8 file?${NC}"
echo "${YELLOW}Enter the full path, or just filename if it's in Downloads${NC}"
read -p "Path to .p8 file: " KEY_FILE_PATH

# Expand ~ if used
KEY_FILE_PATH="${KEY_FILE_PATH/#\~/$HOME}"

# If just filename, assume Downloads
if [[ ! "$KEY_FILE_PATH" == /* ]]; then
    KEY_FILE_PATH="$HOME/Downloads/$KEY_FILE_PATH"
fi

# Check if file exists
if [ ! -f "$KEY_FILE_PATH" ]; then
    echo "${RED}❌ File not found: ${KEY_FILE_PATH}${NC}"
    echo "${YELLOW}Trying to find it...${NC}"
    
    # Try Downloads folder
    DOWNLOADS_FILE="$HOME/Downloads/$(basename "$KEY_FILE_PATH")"
    if [ -f "$DOWNLOADS_FILE" ]; then
        KEY_FILE_PATH="$DOWNLOADS_FILE"
        echo "${GREEN}✅ Found in Downloads: ${KEY_FILE_PATH}${NC}"
    else
        echo "${RED}❌ Still not found. Please check the path.${NC}"
        exit 1
    fi
fi

# Copy key file to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEY_FILENAME="AuthKey_${KEY_ID}.p8"
DEST_PATH="${PROJECT_ROOT}/${KEY_FILENAME}"

echo ""
echo "${BLUE}Copying key file to project...${NC}"
cp "$KEY_FILE_PATH" "$DEST_PATH"

# Make sure it's not world-readable
chmod 600 "$DEST_PATH"

echo "${GREEN}✅ Key file saved to: ${DEST_PATH}${NC}"

# Step 5: Create .env file or update existing
ENV_FILE="${PROJECT_ROOT}/.env.testflight"

echo ""
echo "${BLUE}Step 5: Creating environment file...${NC}"

cat > "$ENV_FILE" << EOF
# App Store Connect API Keys for TestFlight Upload
# Generated: $(date)

APP_STORE_CONNECT_KEY_ID="${KEY_ID}"
APP_STORE_CONNECT_ISSUER_ID="${ISSUER_ID}"
APP_STORE_CONNECT_KEY_FILE="${DEST_PATH}"
EOF

echo "${GREEN}✅ Environment file created: ${ENV_FILE}${NC}"

# Step 6: Instructions for using
echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "${BLUE}To use these keys for upload:${NC}"
echo ""
echo "  source ${ENV_FILE}"
echo "  ./scripts/upload-to-testflight.sh ios/build/export/MOTTOVISON.ipa"
echo ""
echo "${YELLOW}Or add to your shell profile (~/.zshrc or ~/.bash_profile):${NC}"
echo ""
echo "  export APP_STORE_CONNECT_KEY_ID=\"${KEY_ID}\""
echo "  export APP_STORE_CONNECT_ISSUER_ID=\"${ISSUER_ID}\""
echo "  export APP_STORE_CONNECT_KEY_FILE=\"${DEST_PATH}\""
echo ""
echo "${GREEN}✅ Now you can upload without Transporter login!${NC}"

