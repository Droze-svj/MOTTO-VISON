#!/bin/bash

echo "🚀 Starting MOTTO-VISON Development Environment..."

# Check if Metro bundler is already running on either port 8081 or 8082
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Metro bundler is already running on port 8081"
    METRO_PORT=8081
elif lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Metro bundler is already running on port 8082"
    METRO_PORT=8082
else
    echo "📱 Starting Metro bundler..."
    npx expo start --clear &
    sleep 5
    
    # Check which port Metro started on
    if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
        METRO_PORT=8081
    elif lsof -Pi :8082 -sTCP:LISTEN -t >/dev/null ; then
        METRO_PORT=8082
    else
        echo "❌ Failed to start Metro bundler"
        exit 1
    fi
fi

# Wait for Metro to be ready
echo "⏳ Waiting for Metro bundler to be ready on port $METRO_PORT..."
until curl -s http://localhost:$METRO_PORT/status >/dev/null 2>&1; do
    sleep 1
done

echo "✅ Metro bundler is ready on port $METRO_PORT!"

# Open iOS Simulator
echo "📱 Opening iOS Simulator..."
open -a Simulator

# Wait a moment for simulator to open
sleep 3

echo "🎯 Development environment is ready!"
echo "📱 You can now run your app in Xcode or use: npm run ios"
echo "🌐 Metro bundler is running at: http://localhost:$METRO_PORT"
echo "📱 Expo DevTools: http://localhost:$METRO_PORT"
echo ""
echo "💡 If you're still seeing connection errors in Xcode:"
echo "   1. Make sure you're using the .xcworkspace file (not .xcodeproj)"
echo "   2. Clean the build folder in Xcode (Product → Clean Build Folder)"
echo "   3. Build and run again (⌘+R)" 