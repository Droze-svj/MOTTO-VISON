import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';

class RateLimitingService {
  constructor() {
    this.isInitialized = false;
    
    // Rate limiting strategies
    this.rateLimitStrategies = {
      tokenBucket: true,
      slidingWindow: true,
      fixedWindow: true,
      leakyBucket: true,
      adaptive: true
    };
    
    // Rate limit configurations
    this.rateLimitConfigs = {
      // API endpoints
      api: {
        requests: 1000, // requests per window
        window: 3600, // 1 hour in seconds
        burst: 50, // burst allowance
        strategy: 'slidingWindow'
      },
      // AI requests
      ai: {
        requests: 100, // requests per window
        window: 3600, // 1 hour in seconds
        burst: 10, // burst allowance
        strategy: 'tokenBucket'
      },
      // Search requests
      search: {
        requests: 500, // requests per window
        window: 3600, // 1 hour in seconds
        burst: 25, // burst allowance
        strategy: 'slidingWindow'
      },
      // Voice processing
      voice: {
        requests: 200, // requests per window
        window: 3600, // 1 hour in seconds
        burst: 20, // burst allowance
        strategy: 'tokenBucket'
      },
      // Analytics
      analytics: {
        requests: 10000, // requests per window
        window: 3600, // 1 hour in seconds
        burst: 100, // burst allowance
        strategy: 'fixedWindow'
      },
      // Content moderation
      moderation: {
        requests: 500, // requests per window
        window: 3600, // 1 hour in seconds
        burst: 30, // burst allowance
        strategy: 'slidingWindow'
      }
    };
    
    // Rate limit storage
    this.rateLimitStore = new Map();
    this.userRateLimits = new Map();
    this.ipRateLimits = new Map();
    
    // Rate limit metrics
    this.rateLimitMetrics = {
      totalRequests: 0,
      blockedRequests: 0,
      rateLimitHits: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
    
    // Adaptive rate limiting
    this.adaptiveConfig = {
      enabled: true,
      learningPeriod: 3600, // 1 hour
      adjustmentFactor: 0.1,
      minRequests: 10,
      maxRequests: 10000
    };
    
    // Rate limit cleanup
    this.cleanupInterval = 300000; // 5 minutes
    this.cleanupTimer = null;
    
    // Rate limit alerts
    this.alertThresholds = {
      highUsage: 0.8, // 80% of limit
      criticalUsage: 0.95, // 95% of limit
      errorRate: 0.05 // 5% error rate
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await this.loadRateLimitData();
      this.startCleanup();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing RateLimitingService:', error);
    }
  }

  // Main rate limiting check
  async checkRateLimit(identifier, endpoint, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'rate_limiting',
        execute: async () => {
          return await this.performRateLimitCheck(identifier, endpoint, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { identifier, endpoint, options });
      
      // Update metrics
      this.updateRateLimitMetrics(result, Date.now() - startTime);
      
      // Log rate limit event
      await MetricsService.log('rate_limit_check', {
        identifier,
        endpoint,
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
        duration: Date.now() - startTime
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('rate_limit_error', {
        identifier,
        endpoint,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  async performRateLimitCheck(identifier, endpoint, options) {
    const config = this.getRateLimitConfig(endpoint);
    const strategy = config.strategy;
    
    // Get current rate limit state
    const currentState = await this.getRateLimitState(identifier, endpoint);
    
    // Apply rate limiting strategy
    let result;
    switch (strategy) {
      case 'tokenBucket':
        result = await this.tokenBucketCheck(identifier, endpoint, config, currentState);
        break;
      case 'slidingWindow':
        result = await this.slidingWindowCheck(identifier, endpoint, config, currentState);
        break;
      case 'fixedWindow':
        result = await this.fixedWindowCheck(identifier, endpoint, config, currentState);
        break;
      case 'leakyBucket':
        result = await this.leakyBucketCheck(identifier, endpoint, config, currentState);
        break;
      case 'adaptive':
        result = await this.adaptiveRateLimitCheck(identifier, endpoint, config, currentState);
        break;
      default:
        result = await this.slidingWindowCheck(identifier, endpoint, config, currentState);
    }
    
    // Update rate limit state
    await this.updateRateLimitState(identifier, endpoint, result);
    
    // Check for alerts
    await this.checkRateLimitAlerts(identifier, endpoint, result);
    
    return result;
  }

  // Token Bucket Algorithm
  async tokenBucketCheck(identifier, endpoint, config, currentState) {
    const now = Date.now();
    const bucket = currentState.bucket || {
      tokens: config.requests,
      lastRefill: now,
      capacity: config.requests
    };
    
    // Calculate tokens to add based on time elapsed
    const timeElapsed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = Math.floor(timeElapsed * (config.requests / config.window));
    
    // Refill bucket
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    // Check if request can be processed
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: now + (config.window * 1000),
        strategy: 'tokenBucket',
        bucket: bucket
      };
    } else {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + (config.window * 1000),
        strategy: 'tokenBucket',
        bucket: bucket,
        retryAfter: Math.ceil((1 - bucket.tokens) * (config.window / config.requests))
      };
    }
  }

  // Sliding Window Algorithm
  async slidingWindowCheck(identifier, endpoint, config, currentState) {
    const now = Date.now();
    const windowStart = now - (config.window * 1000);
    
    // Get request timestamps
    const requests = currentState.requests || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if under limit
    if (validRequests.length < config.requests) {
      // Add current request
      validRequests.push(now);
      
      return {
        allowed: true,
        remaining: config.requests - validRequests.length,
        resetTime: now + (config.window * 1000),
        strategy: 'slidingWindow',
        requests: validRequests
      };
    } else {
      // Calculate retry after time
      const oldestRequest = Math.min(...validRequests);
      const retryAfter = Math.ceil((oldestRequest + (config.window * 1000) - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + (config.window * 1000),
        strategy: 'slidingWindow',
        requests: validRequests,
        retryAfter: retryAfter
      };
    }
  }

  // Fixed Window Algorithm
  async fixedWindowCheck(identifier, endpoint, config, currentState) {
    const now = Date.now();
    const windowStart = Math.floor(now / (config.window * 1000)) * (config.window * 1000);
    const windowEnd = windowStart + (config.window * 1000);
    
    // Get current window state
    const windowState = currentState.windows || {};
    const currentWindow = windowState[windowStart] || { count: 0, start: windowStart };
    
    // Check if under limit
    if (currentWindow.count < config.requests) {
      currentWindow.count += 1;
      windowState[windowStart] = currentWindow;
      
      return {
        allowed: true,
        remaining: config.requests - currentWindow.count,
        resetTime: windowEnd,
        strategy: 'fixedWindow',
        windows: windowState
      };
    } else {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowEnd,
        strategy: 'fixedWindow',
        windows: windowState,
        retryAfter: Math.ceil((windowEnd - now) / 1000)
      };
    }
  }

  // Leaky Bucket Algorithm
  async leakyBucketCheck(identifier, endpoint, config, currentState) {
    const now = Date.now();
    const bucket = currentState.bucket || {
      level: 0,
      lastLeak: now,
      capacity: config.requests,
      leakRate: config.requests / config.window // requests per second
    };
    
    // Calculate leaked amount
    const timeElapsed = (now - bucket.lastLeak) / 1000;
    const leaked = timeElapsed * bucket.leakRate;
    
    // Update bucket level
    bucket.level = Math.max(0, bucket.level - leaked);
    bucket.lastLeak = now;
    
    // Check if request can be processed
    if (bucket.level < bucket.capacity) {
      bucket.level += 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.capacity - bucket.level),
        resetTime: now + (config.window * 1000),
        strategy: 'leakyBucket',
        bucket: bucket
      };
    } else {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + (config.window * 1000),
        strategy: 'leakyBucket',
        bucket: bucket,
        retryAfter: Math.ceil((bucket.level - bucket.capacity + 1) / bucket.leakRate)
      };
    }
  }

  // Adaptive Rate Limiting
  async adaptiveRateLimitCheck(identifier, endpoint, config, currentState) {
    if (!this.adaptiveConfig.enabled) {
      return await this.slidingWindowCheck(identifier, endpoint, config, currentState);
    }
    
    // Analyze recent performance
    const performance = await this.analyzePerformance(identifier, endpoint);
    
    // Adjust rate limit based on performance
    const adjustedConfig = this.adjustRateLimitConfig(config, performance);
    
    // Apply adjusted rate limit
    return await this.slidingWindowCheck(identifier, endpoint, adjustedConfig, currentState);
  }

  async analyzePerformance(identifier, endpoint) {
    // Analyze recent requests for this identifier/endpoint
    const recentRequests = await this.getRecentRequests(identifier, endpoint);
    
    if (recentRequests.length < 10) {
      return { errorRate: 0, responseTime: 0, throughput: 0 };
    }
    
    const errorRate = recentRequests.filter(r => r.error).length / recentRequests.length;
    const avgResponseTime = recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length;
    const throughput = recentRequests.length / (recentRequests[recentRequests.length - 1].timestamp - recentRequests[0].timestamp) * 1000;
    
    return { errorRate, responseTime: avgResponseTime, throughput };
  }

  adjustRateLimitConfig(config, performance) {
    const adjustedConfig = { ...config };
    
    // Adjust based on error rate
    if (performance.errorRate > 0.05) {
      adjustedConfig.requests = Math.max(
        this.adaptiveConfig.minRequests,
        Math.floor(config.requests * (1 - this.adaptiveConfig.adjustmentFactor))
      );
    } else if (performance.errorRate < 0.01 && performance.responseTime < 1000) {
      adjustedConfig.requests = Math.min(
        this.adaptiveConfig.maxRequests,
        Math.floor(config.requests * (1 + this.adaptiveConfig.adjustmentFactor))
      );
    }
    
    return adjustedConfig;
  }

  // Rate limit state management
  async getRateLimitState(identifier, endpoint) {
    const key = `${identifier}:${endpoint}`;
    return this.rateLimitStore.get(key) || {};
  }

  async updateRateLimitState(identifier, endpoint, result) {
    const key = `${identifier}:${endpoint}`;
    const currentState = this.rateLimitStore.get(key) || {};
    
    // Update state based on strategy
    switch (result.strategy) {
      case 'tokenBucket':
        currentState.bucket = result.bucket;
        break;
      case 'slidingWindow':
        currentState.requests = result.requests;
        break;
      case 'fixedWindow':
        currentState.windows = result.windows;
        break;
      case 'leakyBucket':
        currentState.bucket = result.bucket;
        break;
    }
    
    currentState.lastUpdate = Date.now();
    this.rateLimitStore.set(key, currentState);
  }

  // Configuration management
  getRateLimitConfig(endpoint) {
    return this.rateLimitConfigs[endpoint] || this.rateLimitConfigs.api;
  }

  async updateRateLimitConfig(endpoint, config) {
    this.rateLimitConfigs[endpoint] = { ...this.rateLimitConfigs[endpoint], ...config };
    await this.saveRateLimitConfigs();
  }

  // Rate limit alerts
  async checkRateLimitAlerts(identifier, endpoint, result) {
    const usage = 1 - (result.remaining / this.getRateLimitConfig(endpoint).requests);
    
    if (usage >= this.alertThresholds.criticalUsage) {
      await this.sendRateLimitAlert('critical', identifier, endpoint, usage);
    } else if (usage >= this.alertThresholds.highUsage) {
      await this.sendRateLimitAlert('high', identifier, endpoint, usage);
    }
  }

  async sendRateLimitAlert(level, identifier, endpoint, usage) {
    await MetricsService.log('rate_limit_alert', {
      level,
      identifier,
      endpoint,
      usage: usage * 100,
      timestamp: new Date().toISOString()
    });
  }

  // Metrics and monitoring
  updateRateLimitMetrics(result, responseTime) {
    this.rateLimitMetrics.totalRequests += 1;
    
    if (!result.allowed) {
      this.rateLimitMetrics.blockedRequests += 1;
      this.rateLimitMetrics.rateLimitHits += 1;
    }
    
    // Update average response time
    this.rateLimitMetrics.averageResponseTime = 
      (this.rateLimitMetrics.averageResponseTime * (this.rateLimitMetrics.totalRequests - 1) + responseTime) / 
      this.rateLimitMetrics.totalRequests;
    
    // Update error rate
    this.rateLimitMetrics.errorRate = this.rateLimitMetrics.blockedRequests / this.rateLimitMetrics.totalRequests;
  }

  async getRecentRequests(identifier, endpoint) {
    // Get recent requests from metrics
    const metrics = await MetricsService.getRecentMetrics('rate_limit_check', 100);
    return metrics.filter(m => 
      m.data.identifier === identifier && 
      m.data.endpoint === endpoint
    ).map(m => ({
      timestamp: m.timestamp,
      error: !m.data.allowed,
      responseTime: m.data.duration || 0
    }));
  }

  // Cleanup and maintenance
  startCleanup() {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupExpiredData();
    }, this.cleanupInterval);
  }

  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  async cleanupExpiredData() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, state] of this.rateLimitStore.entries()) {
      if (state.lastUpdate && (now - state.lastUpdate) > (24 * 60 * 60 * 1000)) { // 24 hours
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.rateLimitStore.delete(key));
  }

  // Utility methods
  generateIdentifier(userId, ipAddress) {
    return userId ? `user:${userId}` : `ip:${ipAddress}`;
  }

  // Persistence
  async loadRateLimitData() {
    try {
      const stored = await AsyncStorage.getItem('rate_limit_configs');
      if (stored) {
        this.rateLimitConfigs = { ...this.rateLimitConfigs, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading rate limit data:', error);
    }
  }

  async saveRateLimitConfigs() {
    try {
      await AsyncStorage.setItem('rate_limit_configs', JSON.stringify(this.rateLimitConfigs));
    } catch (error) {
      console.error('Error saving rate limit configs:', error);
    }
  }

  // Health check
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      rateLimitStrategies: this.rateLimitStrategies,
      rateLimitConfigs: Object.keys(this.rateLimitConfigs),
      rateLimitMetrics: this.rateLimitMetrics,
      storeSize: this.rateLimitStore.size,
      adaptiveConfig: this.adaptiveConfig,
      alertThresholds: this.alertThresholds
    };
  }
}

export default new RateLimitingService();
