# 🔧 Transporter Login Issues - Solutions

## Common Login Problems & Fixes

### Issue 1: Wrong Account Type

**Problem:** Using personal Apple ID instead of Developer account

**Solution:**
- Use the **exact email** that's registered with your **Apple Developer Program**
- This might be different from your personal Apple ID
- Check: https://developer.apple.com/account → See which email is registered

---

### Issue 2: Two-Factor Authentication

**Problem:** 2FA not working or not enabled

**Solution:**
1. Make sure 2FA is enabled on your Apple ID
2. When prompted, use your trusted device to approve
3. Or use app-specific password if available
4. Try signing in on a different device first (like iPhone) to authenticate

---

### Issue 3: Account Permissions

**Problem:** Account doesn't have App Store Connect access

**Solution:**
1. Go to https://appstoreconnect.apple.com
2. Make sure you can log in there first
3. Check your role has "Admin" or "App Manager" permissions
4. If you're part of an organization, ask admin to grant access

---

### Issue 4: Session/Cache Issues

**Problem:** Stale session or cached credentials

**Solution:**
1. Quit Transporter completely
2. Clear keychain:
   ```bash
   # Open Keychain Access
   # Search for "Transporter" or "itunes"
   # Delete related entries
   ```
3. Restart Transporter
4. Try logging in again

---

### Issue 5: Network/API Issues

**Problem:** Apple's servers having issues

**Solution:**
1. Check Apple System Status: https://www.apple.com/support/systemstatus/
2. Try again in a few minutes
3. Check firewall isn't blocking connections

---

## ✅ Alternative: Command Line Upload (No Login Needed!)

Instead of Transporter, use command line with API keys!

### Method A: Using API Keys (Recommended)

**Step 1: Create API Key in App Store Connect**

1. Go to https://appstoreconnect.apple.com
2. Click your name (top right) → **"Users and Access"**
3. Go to **"Keys"** tab
4. Click **"+"** (Generate API Key)
5. Name: "TestFlight Upload"
6. Access: **"App Manager"**
7. Click **"Generate"**
8. **Download the `.p8` key file** (you can only download once!)
9. Note:
   - **Key ID** (e.g., ABC123DEFG)
   - **Issuer ID** (e.g., 12345678-1234-1234-1234-123456789012)

**Step 2: Set Environment Variables**

```bash
export APP_STORE_CONNECT_KEY_ID="ABC123DEFG"
export APP_STORE_CONNECT_ISSUER_ID="12345678-1234-1234-1234-123456789012"
export APP_STORE_CONNECT_KEY_FILE="./AuthKey_ABC123DEFG.p8"
```

**Step 3: Upload via Script**

```bash
./scripts/upload-to-testflight.sh ios/build/export/MOTTOVISON.ipa
```

---

### Method B: Using App-Specific Password

**Step 1: Create App-Specific Password**

1. Go to https://appleid.apple.com
2. Sign in
3. **Security** section → **App-Specific Passwords**
4. Click **"Generate Password"**
5. Label: "Transporter Upload"
6. Copy the password (it's shown once!)

**Step 2: Use in Command Line**

```bash
export APP_STORE_CONNECT_USERNAME="your-email@example.com"
export APP_STORE_CONNECT_PASSWORD="abcd-efgh-ijkl-mnop"  # App-specific password

./scripts/upload-to-testflight.sh ios/build/export/MOTTOVISON.ipa
```

---

## 🎯 Quick Fix: Try These in Order

### 1. Verify Account Access
```bash
# Can you log into App Store Connect?
open https://appstoreconnect.apple.com
```
If yes → Use API key method (easier!)  
If no → Fix account access first

### 2. Use API Key Method (Easiest)
- No Transporter login needed
- More reliable
- Better for automation

### 3. Try App-Specific Password
- More secure than regular password
- Often works when regular login doesn't

---

## 🚀 Recommended: Skip Transporter Entirely!

**Use API Key method instead:**

1. **Get API Key** from App Store Connect (2 min)
2. **Set environment variables** (1 min)
3. **Upload via script** (automatic)

**Much easier than Transporter!** ✅

---

## 📋 Step-by-Step: API Key Method

### Step 1: Get API Key

1. https://appstoreconnect.apple.com
2. Your name → Users and Access → Keys
3. Generate new key
4. Download `.p8` file
5. Note Key ID and Issuer ID

### Step 2: Save Key File

```bash
# Save the .p8 file in your project root
# Example: AuthKey_ABC123DEFG.p8
```

### Step 3: Set Variables

```bash
export APP_STORE_CONNECT_KEY_ID="your-key-id"
export APP_STORE_CONNECT_ISSUER_ID="your-issuer-id"
export APP_STORE_CONNECT_KEY_FILE="./AuthKey_ABC123DEFG.p8"
```

### Step 4: Upload

```bash
./scripts/upload-to-testflight.sh ios/build/export/MOTTOVISON.ipa
```

---

## 🔍 Debugging Steps

### Check What's Happening

```bash
# Try logging in to App Store Connect first
open https://appstoreconnect.apple.com

# If that works, the issue is with Transporter specifically
# Use API key method instead
```

### Check Keychain

Sometimes old credentials cause issues:

```bash
# Open Keychain Access
open -a "Keychain Access"

# Search for:
# - "Transporter"
# - "itunes"
# - "appstoreconnect"

# Delete old entries and try again
```

---

## ✅ Solution Summary

**Best Option:** Use API Key method
- ✅ No login issues
- ✅ More reliable
- ✅ Better for automation
- ✅ Works every time

**Next Steps:**
1. Get API key from App Store Connect
2. Set environment variables
3. Use upload script

**Need help with API key setup?** I can guide you through it!

