# MOTTO API Reference

## Core Services API

### MasterAIService

The main orchestrator for all AI interactions.

```typescript
import MasterAIService from '@/services/core/MasterAIService';

// Process user input with full context
const response = await MasterAIService.masterChat(
  userId: string,
  userInput: string,
  context?: {
    conversationLength?: number;
    isFollowUp?: boolean;
    recentContext?: string;
    currentTopics?: string[];
  }
);

// Response type
interface MasterResponse {
  text: string;
  sources: string[];
  personalizationApplied: string[];
  confidence: number;
  adaptations: {
    cognitive: string[];
    personality: string[];
    motivation: string[];
    expertise: string[];
  };
  learnedFrom: boolean;
  responseTime: number;
  suggestions?: string[];
}
```

### MultilingualService

Language detection and translation.

```typescript
import MultilingualService from '@/services/core/MultilingualService';

// Detect language
const detected = await MultilingualService.detectLanguage(text: string);
// Returns: { language: string, confidence: number }

// Translate text
const translated = await MultilingualService.translate(
  text: string,
  fromLang: string,
  toLang: string
);
// Returns: { translatedText: string, fromLanguage: string, toLanguage: string }

// Get supported languages
const languages = MultilingualService.getSupportedLanguages();
// Returns: Array<{ code: string, name: string, nativeName: string }>
```

### ContextMemoryService

Manages conversation context and history.

```typescript
import ContextMemoryService from '@/services/core/ContextMemoryService';

// Add message to history
ContextMemoryService.addMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: any
);

// Get context for user
const context = ContextMemoryService.getContext(userId: string);
// Returns: {
//   relevantContext: string,
//   currentTopics: string[],
//   recentMessages: Message[],
//   conversationSummary: string
// }

// Get statistics
const stats = ContextMemoryService.getStats(userId: string);
// Returns: {
//   totalMessages: number,
//   topicCount: number,
//   averageMessageLength: number
// }
```

### UserLearningService

Tracks user preferences and behavior.

```typescript
import UserLearningService from '@/services/core/UserLearningService';

// Get user profile
const profile = await UserLearningService.getProfile(userId: string);

// Record feedback
await UserLearningService.recordFeedback(
  userId: string,
  userInput: string,
  botResponse: string,
  reaction: 'positive' | 'negative' | 'neutral'
);

// Get suggested topics
const topics = UserLearningService.getSuggestedTopics(userId: string);

// Export user data
const data = await UserLearningService.exportData(userId: string);
```

## React Hooks

### useMultilingual

```typescript
import { useMultilingual } from '@/hooks/useMultilingual';

const {
  languageProfile,
  isLoading,
  error,
  supportedLanguages,
  detectLanguage,
  translate,
  setUserLanguage,
  getUserLanguage,
} = useMultilingual();
```

### useUserLearning

```typescript
import { useUserLearning } from '@/hooks/useUserLearning';

const {
  insights,
  loading,
  suggestedTopics,
  recordFeedback,
  resetLearning,
  exportData,
  getSuggestions,
  refresh,
} = useUserLearning(userId);
```

### useMasterAI

```typescript
import { useMasterAI } from '@/hooks/useMasterAI';

const {
  chat,
  lastResponse,
  isProcessing,
  error,
} = useMasterAI(userId);

// Use chat function
const response = await chat(userInput, context);
```

## Backend API

Base URL: `http://localhost:8000`

### Authentication

```bash
POST /api/auth/register
{
  "username": "string",
  "email": "string",
  "password": "string"
}

POST /api/auth/login
{
  "username": "string",
  "password": "string"
}
```

### Chat Endpoints

```bash
POST /api/chat
{
  "userId": "string",
  "message": "string",
  "context": {}
}

GET /api/chat/history/:userId
```

### User Endpoints

```bash
GET /api/users/:userId/profile
PUT /api/users/:userId/preferences
DELETE /api/users/:userId/data
```

## WebSocket Events

```typescript
// Connect to realtime service
import RealtimeService from '@/services/core/RealtimeService';

await RealtimeService.connect(userId: string);

// Listen for events
RealtimeService.on('message', (data) => {
  console.log('New message:', data);
});

RealtimeService.on('typing', (isTyping: boolean) => {
  console.log('Assistant typing:', isTyping);
});

// Emit events
RealtimeService.emit('user_typing', { userId, isTyping: true });
```

## Error Handling

All services throw errors with consistent structure:

```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

try {
  const response = await MasterAIService.masterChat(userId, input);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
  } else if (error.code === 'RATE_LIMIT') {
    // Handle rate limiting
  }
}
```

## Configuration

### Environment Variables

```bash
# Backend
SECRET_KEY=<your-secret-key>
DATABASE_URL=postgresql://user:pass@localhost/motto
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:8081

# Frontend (optional)
API_BASE_URL=http://localhost:8000
ENABLE_ANALYTICS=false
```

## Performance Best Practices

1. **Batch Requests**: Use batch APIs when possible
2. **Cache Results**: Leverage SmartCacheService
3. **Lazy Load**: Import services only when needed
4. **Optimize Re-renders**: Use React.memo and useMemo
5. **Monitor Performance**: Use PerformanceService

```typescript
import PerformanceService from '@/services/core/PerformanceService';

PerformanceService.startMeasure('myOperation');
// ... do work
PerformanceService.endMeasure('myOperation');

const metrics = PerformanceService.getMetrics();
```

---

For complete API documentation with interactive testing, visit:
**http://localhost:8000/docs** (when backend is running)

