#!/bin/bash
# Script to update mobile apps with Render API URL
# Usage: ./scripts/update-mobile-api-url.sh https://your-render-url.onrender.com

set -e

RENDER_URL=$1

if [ -z "$RENDER_URL" ]; then
  echo "❌ Error: Please provide your Render URL"
  echo "Usage: ./scripts/update-mobile-api-url.sh https://your-service.onrender.com"
  exit 1
fi

# Remove trailing slash if present
RENDER_URL=$(echo "$RENDER_URL" | sed 's:/*$::')

echo "🚀 Updating mobile apps with Render URL: $RENDER_URL"
echo ""

# Update .env file
if [ -f ".env" ]; then
  echo "📝 Updating .env file..."
  # Remove old API URLs if they exist
  sed -i '' '/^API_BASE_URL=/d' .env 2>/dev/null || sed -i '/^API_BASE_URL=/d' .env
  sed -i '' '/^REACT_NATIVE_API_URL=/d' .env 2>/dev/null || sed -i '/^REACT_NATIVE_API_URL=/d' .env
  sed -i '' '/^RENDER_API_URL=/d' .env 2>/dev/null || sed -i '/^RENDER_API_URL=/d' .env
  
  # Add new API URLs
  echo "" >> .env
  echo "# Production API URL (Render)" >> .env
  echo "API_BASE_URL=$RENDER_URL" >> .env
  echo "REACT_NATIVE_API_URL=$RENDER_URL" >> .env
  echo "RENDER_API_URL=$RENDER_URL" >> .env
  echo "✅ Updated .env file"
else
  echo "📝 Creating .env file..."
  cat > .env << EOF
# Production API URL (Render)
API_BASE_URL=$RENDER_URL
REACT_NATIVE_API_URL=$RENDER_URL
RENDER_API_URL=$RENDER_URL

# Environment
NODE_ENV=production
EOF
  echo "✅ Created .env file"
fi

# Update iOS Info.plist if it exists
if [ -f "ios/Motto/Info.plist" ]; then
  echo "📝 Updating iOS Info.plist..."
  # This is a basic update - may need manual adjustment
  if grep -q "API_BASE_URL" ios/Motto/Info.plist; then
    # Update existing
    sed -i '' "s|<string>https://.*</string>|<string>$RENDER_URL</string>|g" ios/Motto/Info.plist 2>/dev/null || \
    sed -i "s|<string>https://.*</string>|<string>$RENDER_URL</string>|g" ios/Motto/Info.plist
  else
    # Add new (before closing </dict>)
    sed -i '' "s|</dict>|    <key>API_BASE_URL</key>\\n    <string>$RENDER_URL</string>\\n</dict>|" ios/Motto/Info.plist 2>/dev/null || \
    sed -i "s|</dict>|    <key>API_BASE_URL</key>\\n    <string>$RENDER_URL</string>\\n</dict>|" ios/Motto/Info.plist
  fi
  echo "✅ Updated iOS Info.plist"
fi

# Update Android api_config.xml if it exists
if [ -f "android/app/src/main/res/values/api_config.xml" ]; then
  echo "📝 Updating Android api_config.xml..."
  sed -i '' "s|<string name=\"api_base_url\">.*</string>|<string name=\"api_base_url\">$RENDER_URL</string>|g" android/app/src/main/res/values/api_config.xml 2>/dev/null || \
  sed -i "s|<string name=\"api_base_url\">.*</string>|<string name=\"api_base_url\">$RENDER_URL</string>|g" android/app/src/main/res/values/api_config.xml
  echo "✅ Updated Android api_config.xml"
fi

echo ""
echo "✅ Mobile apps updated with Render URL!"
echo ""
echo "Next steps:"
echo "1. Rebuild iOS: npm run ios"
echo "2. Rebuild Android: npm run android"
echo "3. Test connection to: $RENDER_URL"
echo ""

