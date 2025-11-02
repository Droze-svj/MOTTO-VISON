# ⚡ Diawi Quick Start - Test iOS App in 2 Minutes

## What is Diawi?

**Diawi** is a free service that lets you share iOS apps directly with testers. No accounts, no setup, just upload and share!

---

## ✅ Why Diawi?

- ⚡ **2 minutes** to share
- ✅ **Free** (up to 500MB)
- ✅ **No registration** needed
- ✅ **QR code** for easy install
- ✅ **Works immediately**
- ✅ **No App Store Connect** required

---

## 🚀 Complete Setup (2 Minutes)

### Step 1: Build Your IPA (1 min)

```bash
./scripts/build-ios-ipa.sh
```

**IPA location:**
```
ios/build/export/MOTTOVISON.ipa
```

### Step 2: Upload to Diawi (30 sec)

1. **Go to:** https://www.diawi.com
2. **Click:** Upload area (or drag & drop)
3. **Select:** `ios/build/export/MOTTOVISON.ipa`
4. **Click:** "Send"
5. **Wait:** 30 seconds for processing

### Step 3: Share Link (30 sec)

**You get:**
- 📱 **Install link** (copy this!)
- 🔲 **QR code** (for scanning)

**Share with testers:**
```
Hey! Want to test MOTTO?

1. Open this link on your iPhone: https://i.diawi.com/XXXXXXXX
2. Tap "Install"
3. Go to Settings → General → VPN & Device Management
4. Trust the developer
5. Open MOTTO app!

Let me know what you think!
```

---

## 📱 For Testers: How to Install

### Step 1: Click Link

Open the Diawi link on **iPhone** (not iPad, not Mac)

### Step 2: Install

1. Tap **"Install"** button
2. Wait for download
3. Tap **"Install"** again (confirmation)

### Step 3: Trust Developer

**Important for first install:**

1. Go to **Settings** → **General**
2. Scroll to **"VPN & Device Management"** (or **"Device Management"**)
3. Tap your developer name
4. Tap **"Trust [Developer Name]"**
5. Tap **"Trust"** again

### Step 4: Open App

Now you can open MOTTO from your home screen!

---

## 🔄 Updating the App

### When You Make Changes:

1. **Build new IPA:**
   ```bash
   ./scripts/build-ios-ipa.sh
   ```

2. **Upload to Diawi again:**
   - Get new link
   - Share with testers

3. **Testers:**
   - Click new link
   - Install update (replaces old version)

**Note:** Diawi links don't auto-update, so share new link each time.

---

## 🎯 Features

### Free Tier:
- ✅ Up to **500MB** file size
- ✅ **Unlimited** downloads
- ✅ **QR code** included
- ✅ **7 days** link expiration (free tier)
- ✅ No account needed

### Password Protection:
- Optional password on link
- Testers enter password before install

### Analytics:
- View download count
- See device types
- Check iOS versions

---

## 📋 Quick Checklist

**Setup:**
- [ ] IPA file built
- [ ] Uploaded to Diawi
- [ ] Link copied

**Sharing:**
- [ ] Link shared with testers
- [ ] Instructions provided
- [ ] QR code shared (optional)

**Testing:**
- [ ] Testers can access link
- [ ] Installation works
- [ ] App runs correctly

---

## 🐛 Troubleshooting

### Link Doesn't Work

**Problem:** Link expired or invalid

**Fix:**
- Upload again to get new link
- Free links expire after 7 days
- Re-upload for new link

### Can't Install on iPhone

**Problem:** "Untrusted Developer" error

**Fix:**
1. Settings → General → VPN & Device Management
2. Trust the developer
3. Try installing again

### Build Fails

**Problem:** IPA file not found

**Fix:**
```bash
# Check if build succeeded
ls -la ios/build/export/

# Rebuild if needed
./scripts/build-ios-ipa.sh
```

---

## 🎉 Success!

**You now have:**
- ✅ App distributed to testers
- ✅ No App Store Connect needed
- ✅ No Transporter needed
- ✅ Quick and easy!

**Share the link and start testing!** 🚀

---

## 💡 Pro Tips

1. **QR Code:** Print or share QR code for easy install
2. **Password:** Add password for private testing
3. **Instructions:** Include "Trust Developer" steps in email
4. **Updates:** Re-upload for each new version

---

## 🔗 Next Steps

- **Testing?** → Share link with testers
- **Want automation?** → Try Firebase App Distribution
- **Need more features?** → See `IOS_TESTING_ALTERNATIVES.md`

**Ready to test? Upload your IPA now!** ⚡

