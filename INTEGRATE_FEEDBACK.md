# 🔗 Integrate Feedback & Updates - Quick Guide

## Add Feedback Button to Your App

### Option 1: Add to Settings/Profile Screen

```typescript
// In your Settings or Profile screen
import { FeedbackModal } from '../components/FeedbackModal';
import { useState } from 'react';

function SettingsScreen() {
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity 
        onPress={() => setFeedbackVisible(true)}
        style={styles.feedbackButton}
      >
        <Text>📝 Send Feedback</Text>
      </TouchableOpacity>
      
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
      />
    </View>
  );
}
```

### Option 2: Add to Chat Screen Header

```typescript
// In your ChatScreen.tsx
import { FeedbackModal } from '../components/FeedbackModal';

function ChatScreen() {
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  return (
    <View>
      <View style={styles.header}>
        <Text>MOTTO</Text>
        <TouchableOpacity onPress={() => setFeedbackVisible(true)}>
          <Text>💬</Text>
        </TouchableOpacity>
      </View>
      
      {/* Your chat content */}
      
      <FeedbackModal
        visible={feedbackVisible}
        onClose={() => setFeedbackVisible(false)}
        initialCategory="other"
      />
    </View>
  );
}
```

### Option 3: Quick Feedback from Error

```typescript
// Report bugs directly
import { feedbackService } from '../services/FeedbackService';

try {
  // Your code
} catch (error) {
  // Report bug automatically
  feedbackService.submitBugReport(
    `Error occurred: ${error.message}`,
    'Steps to reproduce...'
  );
}
```

---

## Add Update Checking

### In App.tsx

```typescript
import { useEffect } from 'react';
import { updateService } from './services/UpdateService';

function App() {
  useEffect(() => {
    // Check for updates on app start
    updateService.checkAndNotify();
    
    // Check periodically (every 24 hours)
    const interval = setInterval(() => {
      updateService.checkAndNotify();
    }, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    // Your app content
  );
}
```

---

## Add to Backend

### Update main_improved.py

```python
from fastapi import FastAPI
from feedback_endpoint import router as feedback_router
from updates_endpoint import router as updates_router

app = FastAPI()

# Add routers
app.include_router(feedback_router)
app.include_router(updates_router)

# ... rest of your app
```

### Update TestFlight URL

Edit `backend/updates_endpoint.py`:
```python
TESTFLIGHT_URL = "https://testflight.apple.com/join/XXXXXXXX"  # Your link
```

---

## Test Locally

```bash
# Test feedback endpoint
curl -X POST http://localhost:8000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "message": "Test feedback",
    "category": "other",
    "deviceInfo": {
      "platform": "ios",
      "osVersion": "16.0",
      "appVersion": "1.0.0"
    }
  }'

# Test updates endpoint
curl "http://localhost:8000/api/updates/check?platform=ios&version=1.0.0&build=1"
```

---

**That's it! Feedback and updates are now integrated!** 🎉

