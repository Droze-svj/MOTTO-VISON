# 🔍 Debug Build Error - Exit Code 70

## ⚠️ Build Failed with Exit Code 70

This is a **real build error** (not deprecation issue).

Exit code 70 usually means:
- CocoaPods installation issue
- Xcode build error
- Missing files
- Configuration problem

---

## 🎯 Find the Error:

1. **Go to:** https://github.com/Droze-svj/MOTTO-VISON/actions
2. **Click on:** "Update to actions/upload-artifact@v4..." workflow
3. **Click on:** "build-ios" job
4. **Expand the failed step** (the one with red X)
5. **Scroll to find the error** (usually red text at the bottom)

---

## 🔍 What to Look For:

### Common Errors:

**Error 1: "pod install failed"**
```
Error: pod install failed
```
**Solution:** Podfile or dependency issue

**Error 2: "No such file or directory"**
```
Error: No such file or directory: 'ios/MOTTOVISON.xcworkspace'
```
**Solution:** Wrong project name or path

**Error 3: "Code signing failed"**
```
Error: Code signing is required
```
**Solution:** Adjust build settings

**Error 4: "Command PhaseScriptExecution failed"**
```
Error: Command PhaseScriptExecution failed with exit code 70
```
**Solution:** Script error in Xcode project

---

## 📋 Share the Error:

**Please copy and paste:**
1. The name of the failed step
2. The last ~20 lines of the error output
3. Any red error messages

**I'll tell you exactly how to fix it!**

---

## 🔗 Quick Link:

**Check the build:** https://github.com/Droze-svj/MOTTO-VISON/actions

**Click on the failed workflow → build-ios → expand the red X step**

---

**What does the error message say?**

