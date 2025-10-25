#!/bin/bash

echo "🚀 Starting MOTTO-VISON..."

# Kill any existing Metro processes
echo "🔄 Stopping any existing Metro processes..."
pkill -f "expo start" || true
pkill -f "metro" || true

# Wait a moment for processes to stop
sleep 2

# Start Metro on port 8081
echo "📱 Starting Metro bundler on port 8081..."
npx expo start --clear --port 8081 &
METRO_PID=$!

# Wait for Metro to be ready
echo "⏳ Waiting for Metro bundler to be ready..."
until curl -s http://localhost:8081/status >/dev/null 2>&1; do
    sleep 1
done

echo "✅ Metro bundler is ready on port 8081!"

# Clean Xcode project
echo "🧹 Cleaning Xcode project..."
cd ios && xcodebuild clean -workspace MOTTOVISON.xcworkspace -scheme MOTTOVISON >/dev/null 2>&1

# Open Xcode
echo "📱 Opening Xcode..."
open MOTTOVISON.xcworkspace

echo ""
echo "🎯 MOTTO-VISON is ready to run!"
echo "📱 In Xcode:"
echo "   1. Select an iOS Simulator (iPhone 16 recommended)"
echo "   2. Press ⌘+R to build and run"
echo "   3. The app should now connect to Metro successfully"
echo ""
echo "🌐 Metro bundler is running at: http://localhost:8081"
echo "📱 Expo DevTools: http://localhost:8081"
echo ""
echo "💡 If you see any connection errors, they should now be resolved!" 