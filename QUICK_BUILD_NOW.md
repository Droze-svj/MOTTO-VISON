# ⚡ Quick Build Guide - Step 4

## 🎯 Run This Now:

```bash
cd "/Users/orlandhino/Library/Mobile Documents/com~apple~CloudDocs/MOTTO-VISON"
./scripts/build-ios-ipa.sh
```

---

## ⏱️ What to Expect

### Build Process (5-10 minutes):

1. **Clean** - 10 seconds ✅
2. **Pod Install** - 2-5 minutes ⏳ **DON'T CANCEL HERE!**
3. **Bundle JS** - 30 seconds ✅
4. **Archive** - 2-3 minutes ⏳
5. **Export IPA** - 1 minute ✅

**Total: ~5-10 minutes**

---

## ⚠️ Important: Don't Cancel!

**During pod install:**
- It's downloading iOS dependencies
- Can take 2-5 minutes (first time)
- **Let it finish!** Don't cancel
- Progress will show eventually

**You'll see:**
```
Installing CocoaPods dependencies...
Analyzing dependencies
Downloading dependencies
Installing [package names]
```

**Be patient!** ⏳

---

## ✅ Success Looks Like:

```
✅ Build complete!

📦 IPA File:
   ios/build/export/MOTTOVISON.ipa
   Size: XX.X MB
```

---

## 🐛 If Build Fails

### Common Issues:

1. **"pod: command not found"**
   ```bash
   sudo gem install cocoapods
   ```

2. **"Archive failed"** 
   - Open Xcode: `open ios/MOTTOVISON.xcworkspace`
   - Check Signing & Capabilities
   - Select your team

3. **Stuck on pod install**
   - Check internet connection
   - Wait longer (first time is slow)
   - Try: `cd ios && pod install --repo-update`

---

## 🚀 After Build:

Once you see "✅ Build complete!", run:

```bash
./scripts/upload-to-firebase.sh
```

**That's Step 5!** 🎉

---

## 💡 Remember

- **First build is slowest** (10-15 min)
- **Don't cancel during pod install**
- **Subsequent builds are faster** (5-10 min)
- **Check output for errors**

**Ready? Run the build script now!** 🚀

