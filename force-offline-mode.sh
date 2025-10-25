#!/bin/bash

echo "🚫 FORCING OFFLINE MODE - COMPLETELY DISABLING METRO BUNDLER"

# Kill any existing Metro processes
echo "🔄 Killing any existing Metro processes..."
pkill -f "metro" 2>/dev/null || echo "No Metro processes found"

# Generate bundle with offline entry point
echo "📦 Generating offline bundle..."
npx react-native bundle --platform ios --dev false --entry-file index-offline.js --bundle-output ios/main.jsbundle --assets-dest ios

# Copy to app directory
echo "📋 Copying bundle to app directory..."
cp ios/main.jsbundle ios/VISIONMOTTO/

# Set file permissions
echo "🔐 Setting file permissions..."
chmod 644 ios/main.jsbundle
chmod 644 ios/VISIONMOTTO/main.jsbundle

echo "✅ OFFLINE MODE ACTIVATED!"
echo "📱 App will now work completely offline without Metro bundler"
echo "🎯 Build and run in Xcode - no more connection refused errors!" 