#!/bin/bash
# Quick MOTTO Testing Script

echo "🧪 MOTTO Testing - Quick Start"
echo "================================"
echo ""

# Test Backend
echo "1️⃣ Testing Backend Health..."
curl -s https://motto-backend.onrender.com/health | head -5
echo ""
echo ""

# Check configuration
echo "2️⃣ Checking Configuration..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    grep "API_BASE_URL" .env | head -1
else
    echo "⚠️  .env file not found"
fi
echo ""

# Ready to test
echo "3️⃣ Ready to Test Mobile Apps!"
echo ""
echo "📱 Test iOS:"
echo "   npm run ios"
echo ""
echo "🤖 Test Android:"
echo "   npm run android"
echo ""
echo "🌐 Test Backend:"
echo "   curl https://motto-backend.onrender.com/health"
echo "   open https://motto-backend.onrender.com/docs"
echo ""

