import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';

class ErrorRecoveryService {
  constructor() {
    this.circuitBreakers = new Map();
    this.retryStrategies = new Map();
    this.fallbackResponses = new Map();
    this.offlineCache = new Map();
    this.isInitialized = false;
    
    // Circuit breaker configuration
    this.circuitBreakerConfig = {
      failureThreshold: 5,
      recoveryTimeout: 30000, // 30 seconds
      halfOpenMaxCalls: 3,
      successThreshold: 2
    };
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true
    };
    
    // Offline cache configuration
    this.cacheConfig = {
      maxCacheSize: 1000,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      compressionEnabled: true
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load circuit breaker states
      await this.loadCircuitBreakerStates();
      
      // Load offline cache
      await this.loadOfflineCache();
      
      // Initialize fallback responses
      this.initializeFallbackResponses();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing ErrorRecoveryService:', error);
    }
  }

  async executeWithRecovery(operation, context = {}) {
    await this.initialize();
    
    const operationId = this.generateOperationId();
    const startTime = Date.now();
    
    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(operation.service)) {
        return await this.handleCircuitBreakerOpen(operation, context);
      }
      
      // Execute operation with retry
      const result = await this.executeWithRetry(operation, context, operationId);
      
      // Record success
      this.recordSuccess(operation.service);
      
      // Log success
      await MetricsService.log('operation_success', {
        operationId,
        service: operation.service,
        duration: Date.now() - startTime,
        retryCount: result.retryCount || 0
      });
      
      return result.data;
      
    } catch (error) {
      // Record failure
      this.recordFailure(operation.service, error);
      
      // Log error
      await MetricsService.log('operation_error', {
        operationId,
        service: operation.service,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      // Try fallback
      return await this.handleFallback(operation, context, error);
    }
  }

  async executeWithRetry(operation, context, operationId) {
    let lastError;
    let retryCount = 0;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation.execute(context);
        
        if (attempt > 0) {
          await MetricsService.log('operation_retry_success', {
            operationId,
            service: operation.service,
            attempt,
            retryCount: attempt
          });
        }
        
        return { data: result, retryCount: attempt };
        
      } catch (error) {
        lastError = error;
        retryCount = attempt;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }
        
        // Calculate delay
        const delay = this.calculateRetryDelay(attempt);
        
        // Log retry attempt
        await MetricsService.log('operation_retry', {
          operationId,
          service: operation.service,
          attempt: attempt + 1,
          error: error.message,
          delay
        });
        
        // Wait before retry
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  calculateRetryDelay(attempt) {
    let delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    
    // Cap at max delay
    delay = Math.min(delay, this.retryConfig.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (this.retryConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  isNonRetryableError(error) {
    const nonRetryableErrors = [
      'Invalid API key',
      'Authentication failed',
      'Permission denied',
      'Rate limit exceeded',
      'Invalid request format'
    ];
    
    return nonRetryableErrors.some(msg => error.message.includes(msg));
  }

  async handleFallback(operation, context, error) {
    // Try cached response first
    const cachedResponse = await this.getCachedResponse(operation, context);
    if (cachedResponse) {
      await MetricsService.log('fallback_cache_hit', {
        service: operation.service,
        cacheAge: Date.now() - cachedResponse.timestamp
      });
      return cachedResponse.data;
    }
    
    // Try fallback response
    const fallbackResponse = this.getFallbackResponse(operation, context, error);
    if (fallbackResponse) {
      await MetricsService.log('fallback_response_used', {
        service: operation.service,
        error: error.message
      });
      return fallbackResponse;
    }
    
    // Return generic error response
    return this.getGenericErrorResponse(operation, error);
  }

  async getCachedResponse(operation, context) {
    const cacheKey = this.generateCacheKey(operation, context);
    const cached = this.offlineCache.get(cacheKey);
    
    if (!cached) return null;
    
    // Check TTL
    if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
      this.offlineCache.delete(cacheKey);
      return null;
    }
    
    return cached;
  }

  async setCachedResponse(operation, context, data) {
    const cacheKey = this.generateCacheKey(operation, context);
    
    // Maintain cache size
    if (this.offlineCache.size >= this.cacheConfig.maxCacheSize) {
      const oldestKey = this.offlineCache.keys().next().value;
      this.offlineCache.delete(oldestKey);
    }
    
    this.offlineCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      service: operation.service
    });
    
    // Persist to storage
    await this.persistOfflineCache();
  }

  getFallbackResponse(operation, context, error) {
    const fallbackKey = `${operation.service}_${error.message}`;
    return this.fallbackResponses.get(fallbackKey);
  }

  getGenericErrorResponse(operation, error) {
    return {
      success: false,
      error: error.message,
      fallback: true,
      timestamp: new Date().toISOString(),
      service: operation.service
    };
  }

  // Circuit Breaker Implementation
  isCircuitBreakerOpen(service) {
    const breaker = this.circuitBreakers.get(service);
    if (!breaker) return false;
    
    const now = Date.now();
    
    switch (breaker.state) {
      case 'CLOSED':
        return false;
        
      case 'OPEN':
        if (now - breaker.lastFailureTime > this.circuitBreakerConfig.recoveryTimeout) {
          breaker.state = 'HALF_OPEN';
          breaker.halfOpenCalls = 0;
          return false;
        }
        return true;
        
      case 'HALF_OPEN':
        if (breaker.halfOpenCalls >= this.circuitBreakerConfig.halfOpenMaxCalls) {
          return true;
        }
        breaker.halfOpenCalls++;
        return false;
        
      default:
        return false;
    }
  }

  recordSuccess(service) {
    const breaker = this.circuitBreakers.get(service);
    if (!breaker) return;
    
    if (breaker.state === 'HALF_OPEN') {
      breaker.halfOpenSuccesses = (breaker.halfOpenSuccesses || 0) + 1;
      
      if (breaker.halfOpenSuccesses >= this.circuitBreakerConfig.successThreshold) {
        breaker.state = 'CLOSED';
        breaker.failureCount = 0;
        breaker.halfOpenSuccesses = 0;
      }
    }
  }

  recordFailure(service, error) {
    let breaker = this.circuitBreakers.get(service);
    
    if (!breaker) {
      breaker = {
        state: 'CLOSED',
        failureCount: 0,
        lastFailureTime: 0,
        halfOpenCalls: 0,
        halfOpenSuccesses: 0
      };
      this.circuitBreakers.set(service, breaker);
    }
    
    breaker.failureCount++;
    breaker.lastFailureTime = Date.now();
    
    if (breaker.state === 'HALF_OPEN') {
      breaker.state = 'OPEN';
      breaker.halfOpenCalls = 0;
      breaker.halfOpenSuccesses = 0;
    } else if (breaker.failureCount >= this.circuitBreakerConfig.failureThreshold) {
      breaker.state = 'OPEN';
    }
    
    // Persist circuit breaker state
    this.persistCircuitBreakerStates();
  }

  async handleCircuitBreakerOpen(operation, context) {
    await MetricsService.log('circuit_breaker_open', {
      service: operation.service,
      failureCount: this.circuitBreakers.get(operation.service)?.failureCount || 0
    });
    
    // Try cached response
    const cachedResponse = await this.getCachedResponse(operation, context);
    if (cachedResponse) {
      return cachedResponse.data;
    }
    
    // Return circuit breaker error
    return {
      success: false,
      error: 'Service temporarily unavailable',
      circuitBreakerOpen: true,
      service: operation.service,
      timestamp: new Date().toISOString()
    };
  }

  // Offline Mode Support
  async enableOfflineMode() {
    await this.initialize();
    
    // Cache current responses
    await this.cacheCurrentResponses();
    
    // Disable network operations
    this.offlineMode = true;
    
    await MetricsService.log('offline_mode_enabled', {
      cacheSize: this.offlineCache.size,
      timestamp: Date.now()
    });
  }

  async disableOfflineMode() {
    this.offlineMode = false;
    
    await MetricsService.log('offline_mode_disabled', {
      timestamp: Date.now()
    });
  }

  async cacheCurrentResponses() {
    // This would cache current AI responses for offline use
    // Implementation depends on specific use cases
  }

  // Utility Methods
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCacheKey(operation, context) {
    const contextStr = JSON.stringify(context);
    return `${operation.service}_${this.simpleHash(contextStr)}`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Persistence Methods
  async loadCircuitBreakerStates() {
    try {
      const stored = await AsyncStorage.getItem('circuit_breaker_states');
      if (stored) {
        const states = JSON.parse(stored);
        this.circuitBreakers = new Map(states);
      }
    } catch (error) {
      console.error('Error loading circuit breaker states:', error);
    }
  }

  async persistCircuitBreakerStates() {
    try {
      const states = Array.from(this.circuitBreakers.entries());
      await AsyncStorage.setItem('circuit_breaker_states', JSON.stringify(states));
    } catch (error) {
      console.error('Error persisting circuit breaker states:', error);
    }
  }

  async loadOfflineCache() {
    try {
      const stored = await AsyncStorage.getItem('offline_cache');
      if (stored) {
        const cache = JSON.parse(stored);
        this.offlineCache = new Map(cache);
      }
    } catch (error) {
      console.error('Error loading offline cache:', error);
    }
  }

  async persistOfflineCache() {
    try {
      const cache = Array.from(this.offlineCache.entries());
      await AsyncStorage.setItem('offline_cache', JSON.stringify(cache));
    } catch (error) {
      console.error('Error persisting offline cache:', error);
    }
  }

  initializeFallbackResponses() {
    // AI-specific fallback responses
    this.fallbackResponses.set('ai_call_Network error', {
      success: false,
      response: "I'm having trouble connecting right now. Please check your internet connection and try again.",
      fallback: true
    });
    
    this.fallbackResponses.set('ai_call_API error', {
      success: false,
      response: "I'm experiencing some technical difficulties. Please try again in a moment.",
      fallback: true
    });
    
    this.fallbackResponses.set('ai_call_Timeout', {
      success: false,
      response: "I'm taking longer than usual to respond. Please try again with a simpler question.",
      fallback: true
    });
  }

  // Health Check
  async getHealthStatus() {
    const status = {
      circuitBreakers: {},
      cacheSize: this.offlineCache.size,
      offlineMode: this.offlineMode || false,
      timestamp: Date.now()
    };
    
    for (const [service, breaker] of this.circuitBreakers.entries()) {
      status.circuitBreakers[service] = {
        state: breaker.state,
        failureCount: breaker.failureCount,
        lastFailureTime: breaker.lastFailureTime
      };
    }
    
    return status;
  }

  // Cleanup
  async cleanup() {
    // Clean expired cache entries
    const now = Date.now();
    for (const [key, value] of this.offlineCache.entries()) {
      if (now - value.timestamp > this.cacheConfig.ttl) {
        this.offlineCache.delete(key);
      }
    }
    
    // Persist cleaned cache
    await this.persistOfflineCache();
  }
}

export default new ErrorRecoveryService();
