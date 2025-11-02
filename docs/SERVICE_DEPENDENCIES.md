# Service Dependencies Documentation

## Overview

This document outlines the service architecture, dependencies, and how services interact within the MOTTO application.

## Service Registry

All services are managed through the `ServiceRegistry` (Dependency Injection Container) located at:
```
src/services/core/ServiceRegistry.ts
```

## Core Services

### 1. CoreAIService
**Location**: `src/services/core/CoreAIService.ts`  
**Purpose**: Core AI processing and response generation  
**Dependencies**: 
- ContextMemoryService (for context-aware responses)
- UserLearningService (for personalization)

**Usage**:
```typescript
import { services } from '../services/core/ServiceRegistry';
const aiService = services.ai;
```

---

### 2. DataService
**Location**: `src/services/core/DataService.ts`  
**Purpose**: Data persistence and storage management  
**Dependencies**: None (base service)  
**Used By**: 
- UserLearningService
- ContextMemoryService
- All services requiring data persistence

---

### 3. MonitoringService
**Location**: `src/services/core/MonitoringService.ts`  
**Purpose**: System monitoring and analytics  
**Dependencies**: DataService  
**Used By**: All services for logging and metrics

---

### 4. VoiceService
**Location**: `src/services/core/VoiceService.ts`  
**Purpose**: Voice input/output processing  
**Dependencies**: None  
**Used By**: VoiceIntegrationService

---

### 5. SecurityService
**Location**: `src/services/core/SecurityService.ts`  
**Purpose**: Security and encryption  
**Dependencies**: DataService  
**Used By**: All services requiring secure data handling

---

### 6. NotificationService
**Location**: `src/services/core/NotificationService.ts`  
**Purpose**: Push notifications and alerts  
**Dependencies**: MonitoringService  
**Used By**: CoreAIService, UserLearningService

---

### 7. UserLearningService
**Location**: `src/services/core/UserLearningService.ts`  
**Purpose**: Adaptive learning and user profiling  
**Dependencies**: 
- DataService
- ContextMemoryService
- MonitoringService

**Used By**: 
- CoreAIService
- EnhancedContextService

---

### 8. RealtimeService
**Location**: `src/services/core/RealtimeService.ts`  
**Purpose**: WebSocket communication and real-time updates  
**Dependencies**: MonitoringService  
**Used By**: CoreAIService, ChatScreen

---

### 9. MultilingualService
**Location**: `src/services/core/MultilingualService.ts`  
**Purpose**: Multi-language support and translation  
**Dependencies**: None  
**Used By**: CoreAIService, ChatScreen

---

### 10. ResponseVarietyService
**Location**: `src/services/core/ResponseVarietyService.ts`  
**Purpose**: Response variety and natural conversation patterns  
**Dependencies**: UserLearningService  
**Used By**: CoreAIService

---

### 11. ContextMemoryService
**Location**: `src/services/core/ContextMemoryService.ts`  
**Purpose**: Conversation context and memory management  
**Dependencies**: DataService  
**Used By**: 
- CoreAIService
- UserLearningService
- EnhancedContextService

---

### 12. EnhancedContextService
**Location**: `src/services/core/EnhancedContextService.ts`  
**Purpose**: Advanced context understanding and analysis  
**Dependencies**: 
- ContextMemoryService
- UserLearningService
- DataService

**Used By**: CoreAIService

---

### 13. PerformanceService
**Location**: `src/services/core/PerformanceService.ts`  
**Purpose**: Performance monitoring and optimization  
**Dependencies**: MonitoringService  
**Used By**: All services for performance tracking

---

### 14. SmartCacheService
**Location**: `src/services/core/SmartCacheService.ts`  
**Purpose**: Intelligent caching and data management  
**Dependencies**: DataService  
**Used By**: CoreAIService, ContextMemoryService

---

### 15. ErrorHandlingService
**Location**: `src/services/core/ErrorHandlingService.ts`  
**Purpose**: Error handling and recovery  
**Dependencies**: MonitoringService, DataService  
**Used By**: All services (wrapped by ServiceRegistry)

---

### 16. VoiceIntegrationService
**Location**: `src/services/core/VoiceIntegrationService.ts`  
**Purpose**: Voice command integration  
**Dependencies**: VoiceService, CoreAIService  
**Used By**: ChatScreen

---

### 17. PlatformAdaptationService
**Location**: `src/services/core/PlatformAdaptationService.ts`  
**Purpose**: Platform-specific adaptations  
**Dependencies**: None  
**Used By**: All UI components

---

### 18. DrezyRecognitionService
**Location**: `src/services/core/DrezyRecognitionService.ts`  
**Purpose**: Special recognition patterns (Drezy feature)  
**Dependencies**: ContextMemoryService  
**Used By**: CoreAIService

---

## Service Dependency Graph

```
CoreAIService
├── ContextMemoryService
│   └── DataService
├── UserLearningService
│   ├── DataService
│   ├── ContextMemoryService
│   └── MonitoringService
├── ResponseVarietyService
│   └── UserLearningService
├── EnhancedContextService
│   ├── ContextMemoryService
│   ├── UserLearningService
│   └── DataService
└── SmartCacheService
    └── DataService

VoiceIntegrationService
├── VoiceService
└── CoreAIService

RealtimeService
└── MonitoringService

NotificationService
└── MonitoringService

SecurityService
└── DataService

ErrorHandlingService
├── MonitoringService
└── DataService

PerformanceService
└── MonitoringService
```

## Accessing Services

### Method 1: Through ServiceRegistry (Recommended)
```typescript
import { services } from '../services/core/ServiceRegistry';

const aiService = services.ai;
const dataService = services.data;
```

### Method 2: Direct Import
```typescript
import CoreAIService from '../services/core/CoreAIService';
import DataService from '../services/core/DataService';
```

## Service Initialization Order

Services are initialized in this order (automatically handled by ServiceRegistry):

1. **Base Services** (no dependencies):
   - DataService
   - MonitoringService
   - VoiceService
   - MultilingualService
   - PlatformAdaptationService

2. **Secondary Services** (depend on base):
   - SecurityService
   - NotificationService
   - RealtimeService
   - PerformanceService
   - ErrorHandlingService

3. **Context Services**:
   - ContextMemoryService
   - SmartCacheService

4. **Learning Services**:
   - UserLearningService
   - ResponseVarietyService
   - EnhancedContextService

5. **Integration Services**:
   - VoiceIntegrationService
   - DrezyRecognitionService

6. **Top-Level Service**:
   - CoreAIService

## Service Lifecycle

1. **Registration**: Services are registered in `ServiceRegistry.registerServices()`
2. **Initialization**: Services initialize lazily on first access
3. **Usage**: Services accessed through registry or direct imports
4. **Cleanup**: Services handle their own cleanup (no explicit teardown needed)

## Best Practices

1. **Always use ServiceRegistry** for accessing services in components
2. **Avoid circular dependencies** - services should have clear dependency hierarchy
3. **Use dependency injection** - don't create new service instances
4. **Handle service errors** - wrap service calls in try-catch blocks
5. **Monitor service usage** - use MonitoringService for tracking

## Adding New Services

1. Create service file in `src/services/core/`
2. Export service class (singleton pattern recommended)
3. Register in `ServiceRegistry.registerServices()`
4. Add type to `ServiceName` union type
5. Document dependencies in this file

## Service Health Monitoring

All services report health status through:
- `MonitoringService.getServiceHealth()`
- Error tracking via `ErrorHandlingService`
- Performance metrics via `PerformanceService`

---

**Last Updated**: $(date)  
**Total Services**: 18  
**Registry Location**: `src/services/core/ServiceRegistry.ts`

