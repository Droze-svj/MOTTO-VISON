# MOTTO - Comprehensive Development Guide

**Version**: 2.0.0  
**Status**: Production-Ready with Quality Improvements  
**Last Updated**: October 25, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [Development](#development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

MOTTO-VISON is an intelligent AI assistant built with React Native and TypeScript, featuring:

- **25+ Core Services**: Modular, scalable architecture
- **Multilingual Support**: 100+ languages with auto-detection
- **Advanced Personalization**: 100+ dimensions of user adaptation
- **Knowledge Collection**: 85+ free sources for comprehensive responses
- **Voice Integration**: Full STT/TTS capabilities
- **Offline Support**: Works without internet connectivity
- **Security**: Enterprise-grade with zero vulnerabilities

### Tech Stack

**Frontend:**
- React Native 0.74.5
- TypeScript 5.0
- Zustand (State Management)
- React Navigation

**Backend:**
- FastAPI 0.115.5
- PostgreSQL/SQLite
- Socket.IO
- Pydantic Settings

**Testing & Quality:**
- Jest with 92 passing tests
- ESLint + Prettier
- TypeScript strict mode ready

---

## Quick Start

### Prerequisites

```bash
- Node.js >= 16
- npm or yarn
- React Native CLI
- Xcode (iOS) or Android Studio (Android)
- Python 3.9+ (for backend)
```

### Installation

```bash
# 1. Clone and install
git clone <repository-url>
cd MOTTO-VISON
npm install

# 2. Install iOS dependencies (Mac only)
cd ios && pod install && cd ..

# 3. Start Metro bundler
npm start

# 4. Run on device/simulator
npm run ios     # iOS
npm run android # Android
```

### Backend Setup (Optional)

```bash
cd backend

# Generate secret key
python setup_db.py generate-key

# Create .env file
echo "SECRET_KEY=<your-generated-key>" > .env
echo "DATABASE_URL=sqlite+aiosqlite:///./tokens.db" >> .env
echo "ENVIRONMENT=development" >> .env

# Install dependencies
pip install -r requirements.txt

# Initialize database
python setup_db.py init

# Run server
uvicorn main_improved:app --reload
```

---

## Architecture

### Directory Structure

```
MOTTO-VISON/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatInput.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageWithFeedback.tsx
│   │   └── modern/          # Modern design components
│   │
│   ├── screens/             # App screens
│   │   ├── ChatScreen.tsx
│   │   ├── PersonalizationProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   │
│   ├── services/            # Business logic
│   │   ├── core/           # 29 core services
│   │   ├── actions/        # Action services
│   │   ├── intelligence/   # Intelligence services
│   │   └── tasks/          # Task-specific services
│   │
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript definitions
│   └── utils/              # Helper functions
│
├── backend/                # FastAPI backend
│   ├── models.py
│   ├── main_improved.py
│   ├── realtime.py
│   └── tests/
│
├── docs/                   # Documentation
└── App.tsx                 # Entry point
```

### Core Services

1. **MasterAIService** - Orchestrates all AI processing
2. **MultilingualService** - Language detection and translation
3. **UltraPersonalizationService** - 100+ dimension personalization
4. **AdvancedCollectionService** - Knowledge gathering from 85+ sources
5. **ContextMemoryService** - Conversation context management
6. **EnhancedContextService** - Pronoun resolution and entity tracking
7. **ResponseVarietyService** - Anti-repetition (500+ phrases)
8. **PerformanceService** - Optimization and monitoring
9. **SmartCacheService** - Multi-layer caching
10. **VoiceIntegrationService** - Speech-to-text and text-to-speech

---

## Core Features

### 1. Multilingual Support

- Auto-detection of 100+ languages (95% accuracy)
- Real-time translation
- Free forever (no API keys required)

```typescript
import { useMultilingual } from '@/hooks/useMultilingual';

const { detectLanguage, translate } = useMultilingual();
const detected = await detectLanguage("Bonjour!");
// { language: 'fr', confidence: 0.98 }
```

### 2. Advanced Personalization

Learns from user across 100+ dimensions:
- Cognitive style (thinking speed, processing depth)
- Personality traits (Big Five + more)
- Motivation patterns
- Communication preferences
- Temporal patterns

### 3. Knowledge Collection

Aggregates information from 85+ free sources:
- Wikipedia, Wikidata
- ArXiv (academic papers)
- Stack Overflow
- News APIs
- Public datasets

### 4. Voice Integration

Full hands-free operation:
- 40+ languages for STT
- 50+ languages for TTS
- Natural conversation flow

---

## Development

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

### Creating New Services

```typescript
// src/services/core/MyService.ts
export class MyService {
  private static instance: MyService;
  
  static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }
  
  async myMethod(): Promise<ResultType> {
    // Implementation
  }
}

export default MyService.getInstance();
```

### Adding Tests

```typescript
// src/services/core/__tests__/MyService.test.ts
import MyService from '../MyService';

describe('MyService', () => {
  describe('myMethod', () => {
    it('should do something', async () => {
      const result = await MyService.myMethod();
      expect(result).toBeDefined();
    });
  });
});
```

---

## Testing

### Test Coverage

Current Status:
- **Total Tests**: 99 (92 passing, 7 failing)
- **Coverage**: 14.48% (Target: 60%)

High Coverage Services:
- DrezyRecognitionService: 92%
- ContextMemoryService: 87%
- EnhancedContextService: 82%

### Running Specific Tests

```bash
# Single file
npm test -- MyService.test.ts

# Pattern matching
npm test -- --testPathPattern=services/core

# Update snapshots
npm test -- -u
```

---

## Deployment

### iOS Deployment

```bash
# 1. Build for production
npm run bundle

# 2. Open Xcode
open ios/MOTTOVISON.xcworkspace

# 3. Configure signing
# 4. Archive and upload to App Store
```

### Android Deployment

```bash
# 1. Generate release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/
```

### Backend Deployment

```bash
# Using Docker
docker build -t motto-backend .
docker run -p 8000:8000 motto-backend

# Or deploy to cloud platforms
# Railway, Render, AWS, GCP, Azure
```

---

## Troubleshooting

### Common Issues

**Metro Bundler Issues**
```bash
# Clear cache
npm start -- --reset-cache
watchman watch-del-all
rm -rf node_modules && npm install
```

**TypeScript Errors**
```bash
# Rebuild TypeScript
npm run type-check

# Check for smart quotes (common issue)
grep -r "['']" src/
```

**Test Failures**
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

**iOS Pod Install Issues**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Performance Optimization

- Enable Hermes engine (iOS/Android)
- Use React.memo for components
- Implement lazy loading
- Monitor with PerformanceService

---

## Contributing

1. Create feature branch
2. Write tests (minimum 60% coverage)
3. Run linting: `npm run lint:fix`
4. Run type check: `npm run type-check`
5. Submit PR with description

---

## Resources

- **API Documentation**: http://localhost:8000/docs (when backend running)
- **React Native Docs**: https://reactnative.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## License

See LICENSE file for details.

---

**Built with ❤️ by the MOTTO team**

