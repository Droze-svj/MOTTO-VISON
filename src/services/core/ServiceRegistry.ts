/**
 * Service Registry - Dependency Injection Container
 * Manages all services and their dependencies
 */

import CoreAIService from './CoreAIService';
import DataService from './DataService';
import MonitoringService from './MonitoringService';
import VoiceService from './VoiceService';
import SecurityService from './SecurityService';
import NotificationService from './NotificationService';
import UserLearningService from './UserLearningService';
import RealtimeService from './RealtimeService';
import MultilingualService from './MultilingualService';
import ResponseVarietyService from './ResponseVarietyService';
import ContextMemoryService from './ContextMemoryService';
import EnhancedContextService from './EnhancedContextService';
import PerformanceService from './PerformanceService';
import SmartCacheService from './SmartCacheService';
import ErrorHandlingService from './ErrorHandlingService';
import VoiceIntegrationService from './VoiceIntegrationService';
import PlatformAdaptationService from './PlatformAdaptationService';
import DrezyRecognitionService from './DrezyRecognitionService';

type ServiceName = 
  | 'ai'
  | 'data'
  | 'monitoring'
  | 'voice'
  | 'security'
  | 'notification'
  | 'learning'
  | 'realtime'
  | 'multilingual'
  | 'variety'
  | 'context'
  | 'enhancedContext'
  | 'performance'
  | 'cache'
  | 'errorHandling'
  | 'voiceIntegration'
  | 'platform'
  | 'drezyRecognition';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<ServiceName, any>;

  private constructor() {
    this.services = new Map();
    this.registerServices();
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  private registerServices(): void {
    this.services.set('ai', CoreAIService);
    this.services.set('data', DataService);
    this.services.set('monitoring', MonitoringService);
    this.services.set('voice', VoiceService);
    this.services.set('security', SecurityService);
    this.services.set('notification', NotificationService);
    this.services.set('learning', UserLearningService);
    this.services.set('realtime', RealtimeService);
    this.services.set('multilingual', MultilingualService);
    this.services.set('variety', ResponseVarietyService);
    this.services.set('context', ContextMemoryService);
    this.services.set('enhancedContext', EnhancedContextService);
    this.services.set('performance', PerformanceService);
    this.services.set('cache', SmartCacheService);
    this.services.set('errorHandling', ErrorHandlingService);
    this.services.set('voiceIntegration', VoiceIntegrationService);
    this.services.set('platform', PlatformAdaptationService);
    this.services.set('drezyRecognition', DrezyRecognitionService);
  }

  get<T>(serviceName: ServiceName): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    return service as T;
  }

  getAll(): Record<ServiceName, any> {
    const all: any = {};
    this.services.forEach((service, name) => {
      all[name] = service;
    });
    return all;
  }
}

// Export convenience accessors
export const services = {
  ai: CoreAIService,
  data: DataService,
  monitoring: MonitoringService,
  voice: VoiceService,
  security: SecurityService,
  notification: NotificationService,
  learning: UserLearningService,
  realtime: RealtimeService,
  multilingual: MultilingualService,
  variety: ResponseVarietyService,
  context: ContextMemoryService,
  enhancedContext: EnhancedContextService,
  performance: PerformanceService,
  cache: SmartCacheService,
  errorHandling: ErrorHandlingService,
  voiceIntegration: VoiceIntegrationService,
  platform: PlatformAdaptationService,
  drezyRecognition: DrezyRecognitionService
};

export default ServiceRegistry.getInstance();

