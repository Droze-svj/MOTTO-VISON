#!/bin/bash

echo "🔄 Ensuring bundle file is up to date..."

# Generate the bundle
echo "📦 Generating React Native bundle..."
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios

# Copy to app directory
echo "📋 Copying bundle to app directory..."
cp ios/main.jsbundle ios/VISIONMOTTO/

echo "✅ Bundle file is ready!"
echo "📱 You can now build and run the iOS app in Xcode" 