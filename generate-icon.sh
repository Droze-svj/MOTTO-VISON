#!/bin/bash

# Generate App Icon Script for MOTTO
# Generates all required icon sizes for iOS and Android

echo "🎨 MOTTO App Icon Generator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if source icon exists
if [ ! -f "assets/icon.png" ]; then
    echo "⚠️  Source icon not found at assets/icon.png"
    echo ""
    echo "📝 How to create your icon:"
    echo ""
    echo "Option 1 - Use Online Generator (Easiest):"
    echo "  1. Go to: https://www.appicon.co"
    echo "  2. Upload 🤖 robot emoji or custom design"
    echo "  3. Download generated icons"
    echo "  4. Extract to project"
    echo ""
    echo "Option 2 - Use React Native Tool:"
    echo "  npm install --save-dev @bam.tech/react-native-make"
    echo "  npx react-native set-icon --path ./assets/icon.png"
    echo ""
    echo "Option 3 - Create 1024x1024 PNG:"
    echo "  1. Create assets/icon.png (1024x1024)"
    echo "  2. Run this script again"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "For now, using placeholder robot emoji 🤖"
    echo ""
    exit 0
fi

echo "✅ Found source icon: assets/icon.png"
echo ""
echo "Installing icon generator..."
npm install --save-dev @bam.tech/react-native-make

echo ""
echo "Generating all icon sizes..."
npx react-native set-icon --path ./assets/icon.png

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ App icon generated!"
echo ""
echo "iOS icons: ios/MOTTOVISON/Images.xcassets/AppIcon.appiconset/"
echo "Android icons: android/app/src/main/res/mipmap-*/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
