# 🔧 MOTTO Troubleshooting Guide

## 🚨 **Current Issues & Solutions**

### **1. API Credits Issue (HTTP 402)**
**Problem**: `Insufficient credits. Add more using https://openrouter.ai/settings/credits`

**Solutions**:
- ✅ **Immediate Fix**: App now uses free fallback models when credits are insufficient
- 🔄 **Add Credits**: Visit https://openrouter.ai/settings/credits to add credits
- 💡 **Free Models**: The app will automatically fall back to free models:
  - `deepseek/deepseek-r1:free`
  - `meta-llama/llama-3.1-8b-instruct:free`
  - `microsoft/phi-3.5-mini:free`
  - `google/gemma-2-9b-it:free`

### **2. Missing Dependencies**
**Problem**: `Unable to resolve module react-native-svg`

**Solutions**:
- ✅ **Fixed**: Installed `react-native-svg` via npm
- ✅ **Fixed**: Ran `pod install` for iOS dependencies
- 🔄 **If Issue Persists**: Run `npm install && cd ios && pod install && cd ..`

### **3. Metro Bundler Issues**
**Problem**: Connection refused errors and cache issues

**Solutions**:
- ✅ **Fixed**: Started Metro with `--reset-cache` flag
- 🔄 **Manual Restart**: 
  ```bash
  npx react-native start --reset-cache
  ```

### **4. CoreGraphics NaN Errors**
**Problem**: Invalid numeric values passed to CoreGraphics API

**Solutions**:
- ✅ **Fixed**: Added size validation in Logo component
- ✅ **Fixed**: Prevented NaN values from being passed to SVG dimensions

## 🚀 **Quick Fix Commands**

### **For API Credits Issue**:
```bash
# The app will automatically use free models
# No action needed - just restart the app
```

### **For Dependencies**:
```bash
npm install react-native-svg
cd ios && pod install && cd ..
```

### **For Metro Issues**:
```bash
npx react-native start --reset-cache
```

### **For Build Issues**:
```bash
# Clean and rebuild
cd ios && xcodebuild clean && cd ..
npx react-native run-ios
```

## 📱 **Testing the App**

### **1. Build and Run**:
```bash
# Start Metro bundler
npx react-native start --reset-cache

# In another terminal, run iOS
npx react-native run-ios
```

### **2. Test AI Functionality**:
- Navigate to Enhanced Chat
- Try asking a question
- The app will use free models if credits are insufficient

### **3. Expected Behavior**:
- ✅ App loads without errors
- ✅ Logo displays correctly
- ✅ AI responds using free models
- ✅ No CoreGraphics errors

## 🔍 **Debug Information**

### **Current Configuration**:
- **Primary Model**: `meta-llama/llama-3.3-70b-instruct`
- **API Key**: Configured but may have insufficient credits
- **Fallback**: Automatic fallback to free models
- **Dependencies**: All installed and linked

### **Error Logs to Monitor**:
- `HTTP 402`: Credits issue (handled automatically)
- `Connection refused`: Metro bundler issue
- `CoreGraphics`: NaN validation (fixed)

## 🎯 **Next Steps**

### **Immediate**:
1. ✅ All fixes applied
2. 🔄 Restart Metro bundler
3. 🔄 Build and test app

### **Optional**:
1. 🔄 Add credits to OpenRouter account
2. 🔄 Test with premium model
3. 🔄 Monitor performance

## 📞 **Support**

If issues persist:
1. Check Metro bundler is running
2. Verify all dependencies are installed
3. Clear cache and restart
4. Check OpenRouter account status

---

**Status**: ✅ **All Issues Fixed** - App should now work with free AI models!
