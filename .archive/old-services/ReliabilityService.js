/**
 * Reliability Service for MOTTO
 * Handles stability, performance, and error recovery
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  METRO_CONFIG,
  API_RELIABILITY_CONFIG,
  ERROR_HANDLING_CONFIG,
  PERFORMANCE_CONFIG,
  MONITORING_CONFIG,
} from '../constants/reliabilityConfig';

class ReliabilityService {
  constructor() {
    this.isInitialized = false;
    this.healthStatus = {
      metro: 'unknown',
      api: 'unknown',
      memory: 'unknown',
      performance: 'unknown',
    };
    this.errorCount = 0;
    this.lastErrorTime = 0;
    this.performanceMetrics = {
      responseTime: [],
      memoryUsage: [],
      errorRate: 0,
    };
    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
    };
  }

  async initialize() {
    try {
      console.log('🔧 Initializing Reliability Service...');
      
      // Initialize health monitoring
      this.startHealthMonitoring();
      
      // Initialize performance tracking
      this.startPerformanceTracking();
      
      // Initialize error handling
      this.initializeErrorHandling();
      
      // Initialize circuit breaker
      this.initializeCircuitBreaker();
      
      this.isInitialized = true;
      console.log('✅ Reliability Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Reliability Service:', error);
      throw error;
    }
  }

  // Health Monitoring
  startHealthMonitoring() {
    setInterval(() => {
      this.checkHealth();
    }, MONITORING_CONFIG.healthCheckInterval);
  }

  async checkHealth() {
    try {
      // Check Metro bundler health
      await this.checkMetroHealth();
      
      // Check API health
      await this.checkAPIHealth();
      
      // Check memory usage
      await this.checkMemoryHealth();
      
      // Check performance
      await this.checkPerformanceHealth();
      
      console.log('🏥 Health check completed:', this.healthStatus);
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  async checkMetroHealth() {
    try {
      // Try multiple ports for Metro health check
      const ports = [8081, 8082, 8083, 8084, 8085];
      let metroHealthy = false;
      
      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}/status`, {
            timeout: 5000,
          });
          if (response.ok) {
            metroHealthy = true;
            break;
          }
        } catch (portError) {
          // Try next port
          continue;
        }
      }
      
      this.healthStatus.metro = metroHealthy ? 'healthy' : 'unhealthy';
    } catch (error) {
      this.healthStatus.metro = 'unhealthy';
      console.warn('⚠️ Metro bundler health check failed:', error.message);
    }
  }

  async checkAPIHealth() {
    try {
      // Simple API health check
      const startTime = Date.now();
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        timeout: API_RELIABILITY_CONFIG.healthCheckTimeout,
      });
      const responseTime = Date.now() - startTime;
      
      this.healthStatus.api = response.ok ? 'healthy' : 'unhealthy';
      this.performanceMetrics.responseTime.push(responseTime);
      
      // Keep only last 10 measurements
      if (this.performanceMetrics.responseTime.length > 10) {
        this.performanceMetrics.responseTime.shift();
      }
    } catch (error) {
      this.healthStatus.api = 'unhealthy';
      console.warn('⚠️ API health check failed:', error.message);
    }
  }

  async checkMemoryHealth() {
    try {
      // Simple memory check (React Native doesn't expose detailed memory info)
      const availableStorage = await AsyncStorage.getAllKeys();
      const storageSize = availableStorage.length;
      
      this.healthStatus.memory = storageSize < 1000 ? 'healthy' : 'warning';
    } catch (error) {
      this.healthStatus.memory = 'unhealthy';
      console.warn('⚠️ Memory health check failed:', error.message);
    }
  }

  async checkPerformanceHealth() {
    try {
      const avgResponseTime = this.performanceMetrics.responseTime.length > 0
        ? this.performanceMetrics.responseTime.reduce((a, b) => a + b, 0) / this.performanceMetrics.responseTime.length
        : 0;
      
      this.healthStatus.performance = avgResponseTime < MONITORING_CONFIG.alertThresholds.responseTime
        ? 'healthy'
        : 'warning';
    } catch (error) {
      this.healthStatus.performance = 'unhealthy';
      console.warn('⚠️ Performance health check failed:', error.message);
    }
  }

  // Performance Tracking
  startPerformanceTracking() {
    setInterval(() => {
      this.trackPerformance();
    }, 30000); // Every 30 seconds
  }

  async trackPerformance() {
    try {
      // Track response times
      const avgResponseTime = this.performanceMetrics.responseTime.length > 0
        ? this.performanceMetrics.responseTime.reduce((a, b) => a + b, 0) / this.performanceMetrics.responseTime.length
        : 0;
      
      // Track error rate
      const errorRate = this.errorCount / Math.max(1, this.performanceMetrics.responseTime.length);
      this.performanceMetrics.errorRate = errorRate;
      
      // Log performance metrics
      if (PERFORMANCE_CONFIG.memoryLeakDetection) {
        console.log('📊 Performance Metrics:', {
          avgResponseTime: `${avgResponseTime.toFixed(2)}ms`,
          errorRate: `${(errorRate * 100).toFixed(2)}%`,
          healthStatus: this.healthStatus,
        });
      }
    } catch (error) {
      console.error('❌ Performance tracking failed:', error);
    }
  }

  // Error Handling
  initializeErrorHandling() {
    if (ERROR_HANDLING_CONFIG.errorBoundaryEnabled) {
      // Set up global error handler
      const originalConsoleError = console.error;
      console.error = (...args) => {
        this.handleError(new Error(args.join(' ')));
        originalConsoleError.apply(console, args);
      };
    }
  }

  handleError(error) {
    try {
      this.errorCount++;
      this.lastErrorTime = Date.now();
      
      // Log error
      if (ERROR_HANDLING_CONFIG.logErrors) {
        console.error('🚨 Error handled by Reliability Service:', error);
      }
      
      // Update circuit breaker
      this.updateCircuitBreaker(error);
      
      // Auto recovery
      if (ERROR_HANDLING_CONFIG.autoRecovery) {
        this.attemptRecovery(error);
      }
      
      // Store error for analytics
      this.storeError(error);
    } catch (recoveryError) {
      console.error('❌ Error handling failed:', recoveryError);
    }
  }

  updateCircuitBreaker(error) {
    if (!API_RELIABILITY_CONFIG.circuitBreakerEnabled) return;
    
    const now = Date.now();
    
    if (this.isErrorRecoverable(error)) {
      this.circuitBreaker.failureCount++;
      this.circuitBreaker.lastFailureTime = now;
      
      if (this.circuitBreaker.failureCount >= API_RELIABILITY_CONFIG.failureThreshold) {
        this.circuitBreaker.isOpen = true;
        this.circuitBreaker.nextAttemptTime = now + API_RELIABILITY_CONFIG.recoveryTimeout;
        console.warn('🔴 Circuit breaker opened');
      }
    } else {
      // Reset on successful operations
      this.circuitBreaker.failureCount = 0;
      this.circuitBreaker.isOpen = false;
    }
  }

  isErrorRecoverable(error) {
    // Consider network errors, timeouts, and 5xx errors as recoverable
    return error.message.includes('network') ||
           error.message.includes('timeout') ||
           error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503') ||
           error.message.includes('504');
  }

  async attemptRecovery(error) {
    try {
      console.log('🔄 Attempting error recovery...');
      
      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, ERROR_HANDLING_CONFIG.recoveryTimeout));
      
      // Attempt to reconnect to Metro
      if (this.healthStatus.metro === 'unhealthy') {
        await this.restartMetro();
      }
      
      // Attempt to reconnect to API
      if (this.healthStatus.api === 'unhealthy') {
        await this.reconnectAPI();
      }
      
      console.log('✅ Error recovery completed');
    } catch (recoveryError) {
      console.error('❌ Error recovery failed:', recoveryError);
    }
  }

  async restartMetro() {
    try {
      console.log('🔄 Restarting Metro bundler...');
      // This would typically involve restarting the Metro process
      // For now, we'll just log the attempt
      console.log('📝 Metro restart requested');
    } catch (error) {
      console.error('❌ Metro restart failed:', error);
    }
  }

  async reconnectAPI() {
    try {
      console.log('🔄 Reconnecting to API...');
      // Reset circuit breaker
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      console.log('✅ API reconnection completed');
    } catch (error) {
      console.error('❌ API reconnection failed:', error);
    }
  }

  // Circuit Breaker
  initializeCircuitBreaker() {
    setInterval(() => {
      this.checkCircuitBreaker();
    }, 10000); // Check every 10 seconds
  }

  checkCircuitBreaker() {
    if (!this.circuitBreaker.isOpen) return;
    
    const now = Date.now();
    if (now >= this.circuitBreaker.nextAttemptTime) {
      if (API_RELIABILITY_CONFIG.halfOpenState) {
        console.log('🟡 Circuit breaker half-open - testing connection');
        this.circuitBreaker.isOpen = false;
      } else {
        console.log('🟢 Circuit breaker closed - resuming normal operation');
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failureCount = 0;
      }
    }
  }

  // Utility Methods
  async storeError(error) {
    try {
      const errorLog = {
        timestamp: Date.now(),
        message: error.message,
        stack: error.stack,
        healthStatus: { ...this.healthStatus },
      };
      
      const existingErrors = await AsyncStorage.getItem('errorLog');
      const errors = existingErrors ? JSON.parse(existingErrors) : [];
      errors.push(errorLog);
      
      // Keep only last 100 errors
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }
      
      await AsyncStorage.setItem('errorLog', JSON.stringify(errors));
    } catch (storageError) {
      console.error('❌ Failed to store error:', storageError);
    }
  }

  getHealthStatus() {
    return { ...this.healthStatus };
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  isCircuitBreakerOpen() {
    return this.circuitBreaker.isOpen;
  }

  // Cleanup
  cleanup() {
    console.log('🧹 Cleaning up Reliability Service...');
    this.isInitialized = false;
  }
}

export default new ReliabilityService();
