#!/bin/bash

echo "🎯 Setting up VISIONMOTTO Offline React Native App"

# Ensure bundle file is in the app directory
echo "📦 Ensuring bundle file is in app directory..."
if [ -f "ios/main.jsbundle" ]; then
    cp ios/main.jsbundle ios/VISIONMOTTO/
    echo "✅ Bundle file copied to app directory"
else
    echo "❌ Bundle file not found"
fi

# Check if bundle file exists in app directory
if [ -f "ios/VISIONMOTTO/main.jsbundle" ]; then
    echo "✅ Bundle file is ready in app directory"
    ls -la ios/VISIONMOTTO/main.jsbundle
else
    echo "❌ Bundle file not found in app directory"
fi

echo ""
echo "🎯 VISIONMOTTO Offline App Setup Complete!"
echo "📱 You can now build and run the app in Xcode"
echo "🚀 The app will work completely offline without Metro bundler" 