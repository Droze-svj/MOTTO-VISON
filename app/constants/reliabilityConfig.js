/**
 * Reliability Configuration for MOTTO
 * Enhanced stability, performance, and error handling
 */

// Metro Bundler Configuration
export const METRO_CONFIG = {
  // Port management
  defaultPort: 8081,
  fallbackPorts: [8082, 8083, 8084, 8085],
  
  // Cache management
  cacheResetInterval: 300000, // 5 minutes
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  
  // Connection settings
  connectionTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 2000, // 2 seconds
  
  // Stability settings
  autoRestart: true,
  healthCheckInterval: 60000, // 1 minute
  maxRestartAttempts: 5,
};

// API Reliability Configuration
export const API_RELIABILITY_CONFIG = {
  // Connection pooling
  maxConnections: 10,
  connectionTimeout: 15000, // 15 seconds
  keepAlive: true,
  keepAliveTimeout: 30000, // 30 seconds
  
  // Retry logic
  maxRetries: 5,
  retryDelay: 1000, // 1 second
  exponentialBackoff: true,
  backoffMultiplier: 2,
  
  // Circuit breaker
  circuitBreakerEnabled: true,
  failureThreshold: 5,
  recoveryTimeout: 60000, // 1 minute
  halfOpenState: true,
  
  // Load balancing
  loadBalancing: true,
  healthCheckInterval: 30000, // 30 seconds
  failoverEnabled: true,
};

// Error Handling Configuration
export const ERROR_HANDLING_CONFIG = {
  // Error logging
  logErrors: true,
  logLevel: 'warn', // 'debug', 'info', 'warn', 'error'
  maxLogSize: 10 * 1024 * 1024, // 10MB
  
  // Error recovery
  autoRecovery: true,
  recoveryTimeout: 5000, // 5 seconds
  maxRecoveryAttempts: 3,
  
  // User feedback
  showUserFriendlyErrors: true,
  errorMessageTimeout: 5000, // 5 seconds
  
  // Crash prevention
  preventCrashes: true,
  errorBoundaryEnabled: true,
  gracefulDegradation: true,
};

// Performance Optimization Configuration
export const PERFORMANCE_CONFIG = {
  // Memory management
  maxMemoryUsage: 512 * 1024 * 1024, // 512MB
  garbageCollectionInterval: 30000, // 30 seconds
  memoryLeakDetection: true,
  
  // Rendering optimization
  virtualScrolling: true,
  lazyLoading: true,
  imageOptimization: true,
  animationOptimization: true,
  
  // Network optimization
  requestBatching: true,
  responseCaching: true,
  cacheExpiry: 300000, // 5 minutes
  compression: true,
  
  // UI responsiveness
  frameRateTarget: 60,
  inputThrottling: true,
  backgroundProcessing: true,
};

// Data Persistence Configuration
export const PERSISTENCE_CONFIG = {
  // Storage management
  maxStorageSize: 100 * 1024 * 1024, // 100MB
  autoCleanup: true,
  cleanupInterval: 86400000, // 24 hours
  
  // Data integrity
  dataValidation: true,
  backupEnabled: true,
  backupInterval: 3600000, // 1 hour
  
  // Sync settings
  autoSync: true,
  syncInterval: 300000, // 5 minutes
  conflictResolution: 'last-write-wins',
};

// Security Configuration
export const SECURITY_CONFIG = {
  // API security
  apiKeyEncryption: true,
  requestSigning: true,
  rateLimiting: true,
  maxRequestsPerMinute: 100,
  
  // Data security
  dataEncryption: true,
  secureStorage: true,
  certificatePinning: true,
  
  // Input validation
  inputSanitization: true,
  sqlInjectionProtection: true,
  xssProtection: true,
};

// Monitoring Configuration
export const MONITORING_CONFIG = {
  // Performance monitoring
  performanceTracking: true,
  metricsCollection: true,
  alertThresholds: {
    responseTime: 5000, // 5 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.8, // 80%
  },
  
  // Health checks
  healthCheckEnabled: true,
  healthCheckInterval: 30000, // 30 seconds
  healthCheckTimeout: 5000, // 5 seconds
  
  // Analytics
  analyticsEnabled: true,
  crashReporting: true,
  userBehaviorTracking: true,
};

// Fallback Configuration
export const FALLBACK_CONFIG = {
  // Model fallback
  modelFallbackEnabled: true,
  fallbackModels: [
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'microsoft/phi-3.5-mini:free',
    'google/gemma-2-9b-it:free',
    'mistralai/mistral-7b-instruct:free',
    'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free',
    'openchat/openchat-3.5:free',
    'anthropic/claude-3-haiku:free',
  ],
  
  // Service fallback
  serviceFallbackEnabled: true,
  fallbackServices: [
    'openrouter',
    'deepseek',
    'openai',
    'anthropic',
  ],
  
  // Feature fallback
  featureFallbackEnabled: true,
  gracefulDegradation: true,
  offlineMode: true,
};

// Default export
export default {
  METRO_CONFIG,
  API_RELIABILITY_CONFIG,
  ERROR_HANDLING_CONFIG,
  PERFORMANCE_CONFIG,
  PERSISTENCE_CONFIG,
  SECURITY_CONFIG,
  MONITORING_CONFIG,
  FALLBACK_CONFIG,
};
