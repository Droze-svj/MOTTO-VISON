/**
 * Core Services Export
 * Single import point for all core services
 */

export {CoreAIService} from './CoreAIService';
export {DataService} from './DataService';
export {MonitoringService} from './MonitoringService';
export {VoiceService} from './VoiceService';
export {SecurityService} from './SecurityService';
export {NotificationService} from './NotificationService';
export {UserLearningService} from './UserLearningService';
export {ServiceRegistry, services} from './ServiceRegistry';

// Default exports for convenience
import CoreAIService from './CoreAIService';
import DataService from './DataService';
import MonitoringService from './MonitoringService';
import VoiceService from './VoiceService';
import SecurityService from './SecurityService';
import NotificationService from './NotificationService';
import UserLearningService from './UserLearningService';

export default {
  ai: CoreAIService,
  data: DataService,
  monitoring: MonitoringService,
  voice: VoiceService,
  security: SecurityService,
  notification: NotificationService,
  learning: UserLearningService
};

