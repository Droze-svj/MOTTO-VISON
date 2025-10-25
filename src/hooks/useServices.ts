/**
 * React Hook for All Services
 * Centralized access to all MOTTO services
 */

import { useMemo } from 'react';
import ServiceRegistry from '../services/core/ServiceRegistry';
import MasterAIService from '../services/core/MasterAIService';
import ContextMemoryService from '../services/core/ContextMemoryService';
import EnhancedContextService from '../services/core/EnhancedContextService';
import MultilingualService from '../services/core/MultilingualService';
import ResponseVarietyService from '../services/core/ResponseVarietyService';
import SmartCacheService from '../services/core/SmartCacheService';
import ErrorHandlingService from '../services/core/ErrorHandlingService';
import PerformanceService from '../services/core/PerformanceService';
import VoiceIntegrationService from '../services/core/VoiceIntegrationService';
import PlatformAdaptationService from '../services/core/PlatformAdaptationService';
import UserLearningService from '../services/core/UserLearningService';

interface Services {
  masterAI: typeof MasterAIService;
  context: typeof ContextMemoryService;
  enhancedContext: typeof EnhancedContextService;
  multilingual: typeof MultilingualService;
  variety: typeof ResponseVarietyService;
  cache: typeof SmartCacheService;
  errorHandling: typeof ErrorHandlingService;
  performance: typeof PerformanceService;
  voice: typeof VoiceIntegrationService;
  platform: typeof PlatformAdaptationService;
  learning: typeof UserLearningService;
  registry: typeof ServiceRegistry;
}

/**
 * Hook to access all MOTTO services
 * 
 * @example
 * const { masterAI, context, multilingual } = useServices();
 * 
 * // Use master AI
 * const response = await masterAI.masterChat(userId, 'Hello');
 * 
 * // Use multilingual
 * const detected = await multilingual.detectLanguage('Hola');
 */
export const useServices = (): Services => {
  const services = useMemo(() => ({
    masterAI: MasterAIService,
    context: ContextMemoryService,
    enhancedContext: EnhancedContextService,
    multilingual: MultilingualService,
    variety: ResponseVarietyService,
    cache: SmartCacheService,
    errorHandling: ErrorHandlingService,
    performance: PerformanceService,
    voice: VoiceIntegrationService,
    platform: PlatformAdaptationService,
    learning: UserLearningService,
    registry: ServiceRegistry,
  }), []);

  return services;
};

export default useServices;
