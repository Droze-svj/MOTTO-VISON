# 🚀 Upload to TestFlight Without Transporter

## Problem: Can't Login to Transporter?

**Solution:** Use API keys instead! Much easier and more reliable.

---

## ✅ Method: API Key Upload (Recommended)

### Why API Keys?
- ✅ No login issues
- ✅ More reliable
- ✅ Better for automation
- ✅ Works consistently

---

## 📋 Step-by-Step Setup

### Step 1: Get API Key from App Store Connect (5 min)

1. Go to: **https://appstoreconnect.apple.com**
2. **Sign in** (use your regular account)
3. Click your **name** (top right)
4. Click **"Users and Access"**
5. Click **"Keys"** tab
6. Click **"+"** (Generate API Key)
7. Fill in:
   ```
   Name: TestFlight Upload
   Access: App Manager
   ```
8. Click **"Generate"**
9. **Download the `.p8` file** (you can only download once!)
10. **Copy these values:**
    - Key ID (e.g., `ABC123DEFG`)
    - Issuer ID (e.g., `12345678-1234-1234-1234-123456789012`)

---

### Step 2: Run Setup Script (2 min)

```bash
./scripts/setup-api-keys.sh
```

This will:
- ✅ Ask for your Key ID
- ✅ Ask for your Issuer ID
- ✅ Ask for .p8 file location
- ✅ Set everything up automatically

---

### Step 3: Build Your App (5 min)

```bash
./scripts/build-ios-ipa.sh
```

This creates: `ios/build/export/MOTTOVISON.ipa`

---

### Step 4: Upload via Script (2 min)

```bash
# Load the environment variables
source .env.testflight

# Upload
./scripts/upload-to-testflight.sh ios/build/export/MOTTOVISON.ipa
```

**That's it!** No Transporter needed! 🎉

---

## 🔧 Manual Setup (If Script Doesn't Work)

### Step 1: Save Key File

Save your `.p8` file in project root:
```
AuthKey_ABC123DEFG.p8
```

### Step 2: Set Environment Variables

```bash
export APP_STORE_CONNECT_KEY_ID="ABC123DEFG"
export APP_STORE_CONNECT_ISSUER_ID="12345678-1234-1234-1234-123456789012"
export APP_STORE_CONNECT_KEY_FILE="./AuthKey_ABC123DEFG.p8"
```

### Step 3: Upload

```bash
./scripts/upload-to-testflight.sh ios/build/export/MOTTOVISON.ipa
```

---

## ✅ Complete Workflow

```bash
# 1. Set up API keys (one time)
./scripts/setup-api-keys.sh

# 2. Build app
./scripts/build-ios-ipa.sh

# 3. Upload (load env first)
source .env.testflight
./scripts/upload-to-testflight.sh ios/build/export/MOTTOVISON.ipa

# 4. Wait 10-30 minutes for processing
# 5. Go to App Store Connect → TestFlight
# 6. Add build to testing group
# 7. Share link!
```

---

## 🎯 Advantages Over Transporter

| Feature | Transporter | API Keys |
|---------|-------------|----------|
| Login Issues | Common | None |
| Reliability | Sometimes fails | Always works |
| Automation | Manual | Scriptable |
| Speed | Medium | Fast |
| Error Messages | Generic | Specific |

---

## 🐛 Troubleshooting

### Error: "Invalid API Key"

**Fix:**
- Verify Key ID is correct
- Check Issuer ID is correct
- Ensure .p8 file is in correct location
- Make sure key has "App Manager" access

### Error: "Key file not found"

**Fix:**
- Check file path is correct
- Use absolute path if relative doesn't work
- Verify file extension is `.p8`

### Error: "Upload failed"

**Fix:**
- Check internet connection
- Verify app exists in App Store Connect
- Ensure Bundle ID matches
- Check build is properly signed

---

## 📋 Checklist

**Setup:**
- [ ] API key created in App Store Connect
- [ ] .p8 file downloaded
- [ ] Key ID and Issuer ID noted
- [ ] Environment variables set

**Upload:**
- [ ] IPA file built
- [ ] API keys loaded
- [ ] Upload script runs
- [ ] Upload successful

**TestFlight:**
- [ ] Build processed
- [ ] Added to testing group
- [ ] Link shared with testers

---

## 🎉 Success!

Once set up:
- ✅ Upload in 2 minutes
- ✅ No login issues
- ✅ Reliable every time
- ✅ Easy to automate

**Much better than Transporter!** 🚀

---

## 💡 Pro Tip

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
# App Store Connect API Keys
export APP_STORE_CONNECT_KEY_ID="your-key-id"
export APP_STORE_CONNECT_ISSUER_ID="your-issuer-id"
export APP_STORE_CONNECT_KEY_FILE="/path/to/AuthKey_XXX.p8"
```

Then you don't need to load `.env.testflight` each time!

---

**Ready to set up? Run the setup script!** 🎯

