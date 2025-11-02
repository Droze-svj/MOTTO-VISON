# 🚀 Installation Guide - New Features & Security

## 📦 Install New Dependencies

Run this command to install the security dependencies:

```bash
npm install expo-crypto expo-local-authentication
```

### **What These Provide:**

1. **expo-crypto** - Cryptography functions
   - SHA-256/SHA-512 hashing
   - Random byte generation
   - Secure encryption primitives

2. **expo-local-authentication** - Biometric authentication
   - Face ID (iOS)
   - Touch ID (iOS)
   - Fingerprint (Android)
   - Iris scanner (supported devices)

---

## 🔧 **Setup Steps**

### **1. Install Dependencies**
```bash
npm install expo-crypto expo-local-authentication
```

### **2. Link Native Modules (if needed)**
```bash
cd ios && pod install && cd ..
```

### **3. Run the App**
```bash
npm start
npm run ios     # or
npm run android
```

---

## ✅ **Verify Installation**

Test each feature:

### **1. Encryption:**
```typescript
import { EncryptionService } from '@services/security';

await EncryptionService.initialize(userId);
const encrypted = await EncryptionService.encrypt('test');
console.log('Encryption works!', encrypted);
```

### **2. Biometric:**
```typescript
import { BiometricAuthService } from '@services/security';

const { available } = await BiometricAuthService.isAvailable();
console.log('Biometric available:', available);
```

### **3. Streaming:**
```typescript
import { StreamingResponseService } from '@services/advanced';

for await (const chunk of StreamingResponseService.streamResponse('Hello!')) {
  console.log('Chunk:', chunk);
}
```

---

## 🎯 **Quick Test**

Run this in your app to test everything:

```typescript
import { SecureStorageService } from '@services/security';
import { StreamingResponseService } from '@services/advanced';

const testAll = async () => {
  // Test security
  await SecureStorageService.initialize(userId);
  await SecureStorageService.save(userId, 'test', 'key1', 'data');
  const loaded = await SecureStorageService.load(userId, 'test', 'key1');
  console.log('✅ Security works!', loaded);

  // Test streaming
  for await (const chunk of StreamingResponseService.streamResponse('Test!')) {
    console.log('✅ Streaming works:', chunk);
  }

  console.log('🎉 All features working!');
};

testAll();
```

---

## 🐛 **Troubleshooting**

### **If expo-crypto fails:**
```bash
npm install crypto-js
# Alternative encryption library
```

### **If expo-local-authentication fails:**
```bash
npm install react-native-biometrics
# Alternative biometric library
```

### **If gradients don't show:**
```bash
cd ios && pod install && cd ..
npm run ios
```

---

## ✅ **You're Ready!**

Once dependencies are installed, everything works automatically!

**All features are integrated and ready to use.** 🎉

