#!/bin/bash

echo "🔨 Building MOTTO-VISON iOS Project..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd ios
rm -rf build
rm -rf DerivedData

# Clean Xcode project
echo "🧹 Cleaning Xcode project..."
xcodebuild clean -workspace MOTTOVISON.xcworkspace -scheme MOTTOVISON

# Build for simulator with proper debug settings
echo "🔨 Building for iOS Simulator..."
xcodebuild build \
  -workspace MOTTOVISON.xcworkspace \
  -scheme MOTTOVISON \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
  -derivedDataPath build \
  DEBUG_INFORMATION_FORMAT=dwarf \
  COPY_PHASE_STRIP=NO \
  STRIP_INSTALLED_PRODUCT=NO \
  STRIP_STYLE=debugging

echo "✅ Build completed!"
echo "📱 You can now run the app in Xcode or simulator"
echo "💡 If you see dSYM warnings, they're harmless and won't affect functionality" 