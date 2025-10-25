import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';

class ServiceRegistry {
  constructor() {
    this.isInitialized = false;
    
    this.services = new Map();
    this.loadedServices = new Set();
    this.serviceDependencies = new Map();
    this.serviceHealth = new Map();
    this.serviceMetrics = new Map();
    this.circuitBreakers = new Map();
    this.serviceConfigs = new Map();
    
    this.registryCapabilities = {
      lazyLoading: true,
      serviceDiscovery: true,
      dependencyInjection: true,
      healthMonitoring: true,
      circuitBreaker: true,
      metricsCollection: true,
      configurationManagement: true,
      serviceLifecycle: true,
      hotReloading: true,
      serviceVersioning: true
    };
    
    this.registryMetrics = {
      totalServices: 0,
      loadedServices: 0,
      healthyServices: 0,
      failedServices: 0,
      averageLoadTime: 0,
      totalLoadTime: 0,
      serviceCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      circuitBreakerTrips: 0
    };
    
    this.initializeServiceDefinitions();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadRegistryData();
      await this.initializeCircuitBreakers();
      await this.startHealthMonitoring();
      await this.startMetricsCollection();
      this.isInitialized = true;
      
      console.log('Service Registry initialized successfully');
    } catch (error) {
      console.error('Error initializing Service Registry:', error);
      throw error;
    }
  }

  initializeServiceDefinitions() {
    // Define all available services with their dependencies and configurations
    this.serviceDefinitions = {
      // Core Services (Critical - Load First)
      'MetricsService': {
        priority: 0,
        dependencies: [],
        config: { lazy: false, critical: true },
        path: './MetricsService'
      },
      'ErrorRecoveryService': {
        priority: 0,
        dependencies: ['MetricsService'],
        config: { lazy: false, critical: true },
        path: './ErrorRecoveryService'
      },
      'PerformanceOptimizationService': {
        priority: 0,
        dependencies: ['MetricsService'],
        config: { lazy: false, critical: true },
        path: './PerformanceOptimizationService'
      },
      
      // AI Core Services
      'AIEnhancementService': {
        priority: 1,
        dependencies: ['MetricsService', 'ErrorRecoveryService', 'PerformanceOptimizationService'],
        config: { lazy: false, critical: true },
        path: './AIEnhancementService'
      },
      'AdvancedAIService': {
        priority: 1,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: true },
        path: './AdvancedAIService'
      },
      'IntelligentModelRouter': {
        priority: 1,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: true },
        path: './IntelligentModelRouter'
      },
      'AdvancedContextManager': {
        priority: 1,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: true },
        path: './AdvancedContextManager'
      },
      
      // Apple Services
      'AdaptiveInterfaceService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './AdaptiveInterfaceService'
      },
      'AppleAccessibilityService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './AppleAccessibilityService'
      },
      'AppleCloudService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './AppleCloudService'
      },
      'AppleUserControlService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './AppleUserControlService'
      },
      'AppleOptimizationService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './AppleOptimizationService'
      },
      
      // Advanced AI Services
      'MultiModalAIService': {
        priority: 2,
        dependencies: ['MetricsService', 'ErrorRecoveryService', 'PerformanceOptimizationService'],
        config: { lazy: true, critical: false },
        path: './MultiModalAIService'
      },
      'AdvancedReasoningService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './AdvancedReasoningService'
      },
      'PlanningService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './PlanningService'
      },
      'StreamingAIService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './StreamingAIService'
      },
      'LearningAdaptationService': {
        priority: 2,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './LearningAdaptationService'
      },
      
      // Machine Learning Services
      'AdvancedMachineLearningService': {
        priority: 3,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './AdvancedMachineLearningService'
      },
      'FederatedLearningService': {
        priority: 3,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './FederatedLearningService'
      },
      'AdvancedPredictiveIntelligenceService': {
        priority: 3,
        dependencies: ['MetricsService', 'ErrorRecoveryService', 'PerformanceOptimizationService', 'FederatedLearningService'],
        config: { lazy: true, critical: false },
        path: './AdvancedPredictiveIntelligenceService'
      },
      
      // Specialized Services (Optional - Load on Demand)
      'QuantumComputingService': {
        priority: 4,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './QuantumComputingService'
      },
      'FutureTechnologiesService': {
        priority: 4,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './FutureTechnologiesService'
      },
      'EmergingTechnologiesService': {
        priority: 4,
        dependencies: ['MetricsService'],
        config: { lazy: true, critical: false },
        path: './EmergingTechnologiesService'
      }
    };
    
    // Build dependency graph
    this.buildDependencyGraph();
  }

  buildDependencyGraph() {
    for (const [serviceName, definition] of Object.entries(this.serviceDefinitions)) {
      this.serviceDependencies.set(serviceName, definition.dependencies);
    }
  }

  async getService(serviceName, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check if service is already loaded
      if (this.loadedServices.has(serviceName)) {
        return this.services.get(serviceName);
      }
      
      // Load service with dependencies
      const service = await this.loadService(serviceName, options);
      
      // Record metrics
      const loadTime = Date.now() - startTime;
      this.recordServiceLoad(serviceName, loadTime, true);
      
      return service;
    } catch (error) {
      const loadTime = Date.now() - startTime;
      this.recordServiceLoad(serviceName, loadTime, false);
      
      console.error(`Failed to load service ${serviceName}:`, error);
      throw error;
    }
  }

  async loadService(serviceName, options = {}) {
    const definition = this.serviceDefinitions[serviceName];
    if (!definition) {
      throw new Error(`Service ${serviceName} not found in registry`);
    }
    
    // Check circuit breaker
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker && circuitBreaker.isOpen()) {
      throw new Error(`Service ${serviceName} is unavailable (circuit breaker open)`);
    }
    
    try {
      // Load dependencies first
      await this.loadDependencies(serviceName);
      
      // Load the service
      const ServiceClass = await this.importService(definition.path);
      const service = new ServiceClass.default();
      
      // Initialize service
      await service.initialize();
      
      // Store service
      this.services.set(serviceName, service);
      this.loadedServices.add(serviceName);
      
      // Update health status
      this.serviceHealth.set(serviceName, {
        status: 'healthy',
        lastCheck: Date.now(),
        loadTime: Date.now()
      });
      
      // Record successful load
      circuitBreaker?.recordSuccess();
      
      console.log(`Service ${serviceName} loaded successfully`);
      return service;
    } catch (error) {
      // Record failure
      circuitBreaker?.recordFailure();
      
      this.serviceHealth.set(serviceName, {
        status: 'unhealthy',
        lastCheck: Date.now(),
        error: error.message
      });
      
      throw error;
    }
  }

  async loadDependencies(serviceName) {
    const dependencies = this.serviceDependencies.get(serviceName) || [];
    
    // Load dependencies in parallel
    const dependencyPromises = dependencies.map(dep => this.getService(dep));
    await Promise.all(dependencyPromises);
  }

  async importService(servicePath) {
    try {
      // Dynamic import based on service path
      const module = await import(servicePath);
      return module;
    } catch (error) {
      console.error(`Failed to import service from ${servicePath}:`, error);
      throw error;
    }
  }

  async loadCriticalServices() {
    const criticalServices = Object.entries(this.serviceDefinitions)
      .filter(([name, def]) => def.config.critical)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name]) => name);
    
    console.log('Loading critical services:', criticalServices);
    
    // Load critical services in parallel
    const loadPromises = criticalServices.map(serviceName => 
      this.getService(serviceName).catch(error => {
        console.error(`Failed to load critical service ${serviceName}:`, error);
        return null;
      })
    );
    
    const results = await Promise.all(loadPromises);
    const successful = results.filter(result => result !== null);
    
    console.log(`Loaded ${successful.length}/${criticalServices.length} critical services`);
    return successful;
  }

  async loadOptionalServices() {
    const optionalServices = Object.entries(this.serviceDefinitions)
      .filter(([name, def]) => !def.config.critical)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name]) => name);
    
    console.log('Loading optional services in background:', optionalServices);
    
    // Load optional services in background
    Promise.all(optionalServices.map(serviceName => 
      this.getService(serviceName).catch(error => {
        console.warn(`Failed to load optional service ${serviceName}:`, error);
        return null;
      })
    ));
  }

  async callService(serviceName, method, params = [], options = {}) {
    const startTime = Date.now();
    
    try {
      const service = await this.getService(serviceName, options);
      
      if (!service[method]) {
        throw new Error(`Method ${method} not found on service ${serviceName}`);
      }
      
      const result = await service[method](...params);
      
      // Record successful call
      this.recordServiceCall(serviceName, method, Date.now() - startTime, true);
      
      return result;
    } catch (error) {
      // Record failed call
      this.recordServiceCall(serviceName, method, Date.now() - startTime, false);
      
      console.error(`Service call failed: ${serviceName}.${method}`, error);
      throw error;
    }
  }

  async initializeCircuitBreakers() {
    for (const serviceName of Object.keys(this.serviceDefinitions)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker({
        threshold: 5,
        timeout: 60000,
        resetTimeout: 30000
      }));
    }
  }

  async startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthChecks();
    }, 30000); // Every 30 seconds
  }

  async performHealthChecks() {
    for (const [serviceName, service] of this.services) {
      try {
        if (service.getHealthStatus) {
          const healthStatus = await service.getHealthStatus();
          this.serviceHealth.set(serviceName, {
            status: healthStatus.isInitialized ? 'healthy' : 'unhealthy',
            lastCheck: Date.now(),
            details: healthStatus
          });
        }
      } catch (error) {
        this.serviceHealth.set(serviceName, {
          status: 'unhealthy',
          lastCheck: Date.now(),
          error: error.message
        });
      }
    }
  }

  async startMetricsCollection() {
    setInterval(async () => {
      await this.updateRegistryMetrics();
    }, 60000); // Every minute
  }

  async updateRegistryMetrics() {
    this.registryMetrics = {
      totalServices: Object.keys(this.serviceDefinitions).length,
      loadedServices: this.loadedServices.size,
      healthyServices: Array.from(this.serviceHealth.values()).filter(h => h.status === 'healthy').length,
      failedServices: Array.from(this.serviceHealth.values()).filter(h => h.status === 'unhealthy').length,
      averageLoadTime: this.calculateAverageLoadTime(),
      totalLoadTime: this.registryMetrics.totalLoadTime,
      serviceCalls: this.registryMetrics.serviceCalls,
      successfulCalls: this.registryMetrics.successfulCalls,
      failedCalls: this.registryMetrics.failedCalls,
      circuitBreakerTrips: this.countCircuitBreakerTrips()
    };
  }

  recordServiceLoad(serviceName, loadTime, success) {
    this.registryMetrics.totalLoadTime += loadTime;
    
    if (!this.serviceMetrics.has(serviceName)) {
      this.serviceMetrics.set(serviceName, {
        loadTimes: [],
        calls: 0,
        successfulCalls: 0,
        failedCalls: 0
      });
    }
    
    const metrics = this.serviceMetrics.get(serviceName);
    metrics.loadTimes.push(loadTime);
    
    // Keep only last 100 load times
    if (metrics.loadTimes.length > 100) {
      metrics.loadTimes = metrics.loadTimes.slice(-100);
    }
  }

  recordServiceCall(serviceName, method, duration, success) {
    this.registryMetrics.serviceCalls++;
    
    if (success) {
      this.registryMetrics.successfulCalls++;
    } else {
      this.registryMetrics.failedCalls++;
    }
    
    if (!this.serviceMetrics.has(serviceName)) {
      this.serviceMetrics.set(serviceName, {
        loadTimes: [],
        calls: 0,
        successfulCalls: 0,
        failedCalls: 0
      });
    }
    
    const metrics = this.serviceMetrics.get(serviceName);
    metrics.calls++;
    
    if (success) {
      metrics.successfulCalls++;
    } else {
      metrics.failedCalls++;
    }
  }

  calculateAverageLoadTime() {
    const allLoadTimes = Array.from(this.serviceMetrics.values())
      .flatMap(metrics => metrics.loadTimes);
    
    if (allLoadTimes.length === 0) return 0;
    
    return allLoadTimes.reduce((sum, time) => sum + time, 0) / allLoadTimes.length;
  }

  countCircuitBreakerTrips() {
    let trips = 0;
    for (const circuitBreaker of this.circuitBreakers.values()) {
      if (circuitBreaker.isOpen()) {
        trips++;
      }
    }
    return trips;
  }

  async getServiceHealth(serviceName) {
    return this.serviceHealth.get(serviceName) || { status: 'unknown' };
  }

  async getAllServicesHealth() {
    const health = {};
    for (const [serviceName, healthStatus] of this.serviceHealth) {
      health[serviceName] = healthStatus;
    }
    return health;
  }

  async getRegistryStatus() {
    return {
      isInitialized: this.isInitialized,
      totalServices: Object.keys(this.serviceDefinitions).length,
      loadedServices: this.loadedServices.size,
      healthyServices: Array.from(this.serviceHealth.values()).filter(h => h.status === 'healthy').length,
      registryMetrics: this.registryMetrics,
      serviceHealth: Object.fromEntries(this.serviceHealth),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([name, cb]) => [
          name, 
          { isOpen: cb.isOpen(), failures: cb.failures, lastFailure: cb.lastFailureTime }
        ])
      )
    };
  }

  // Circuit Breaker Implementation
  class CircuitBreaker {
    constructor(options = {}) {
      this.threshold = options.threshold || 5;
      this.timeout = options.timeout || 60000;
      this.resetTimeout = options.resetTimeout || 30000;
      this.failures = 0;
      this.lastFailureTime = null;
      this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    async execute(operation) {
      if (this.state === 'OPEN') {
        if (Date.now() - this.lastFailureTime > this.resetTimeout) {
          this.state = 'HALF_OPEN';
        } else {
          throw new Error('Circuit breaker is OPEN');
        }
      }

      try {
        const result = await operation();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        throw error;
      }
    }

    onSuccess() {
      this.failures = 0;
      this.state = 'CLOSED';
    }

    onFailure() {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
      }
    }

    recordSuccess() {
      this.onSuccess();
    }

    recordFailure() {
      this.onFailure();
    }

    isOpen() {
      return this.state === 'OPEN';
    }
  }

  // Persistence
  async loadRegistryData() {
    try {
      const stored = await AsyncStorage.getItem('service_registry_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.serviceHealth = new Map(data.serviceHealth || []);
        this.serviceMetrics = new Map(data.serviceMetrics || []);
        this.registryMetrics = data.registryMetrics || this.registryMetrics;
      }
    } catch (error) {
      console.error('Error loading registry data:', error);
    }
  }

  async saveRegistryData() {
    try {
      const data = {
        serviceHealth: Array.from(this.serviceHealth.entries()),
        serviceMetrics: Array.from(this.serviceMetrics.entries()),
        registryMetrics: this.registryMetrics
      };
      await AsyncStorage.setItem('service_registry_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving registry data:', error);
    }
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      registryCapabilities: this.registryCapabilities,
      totalServices: Object.keys(this.serviceDefinitions).length,
      loadedServices: this.loadedServices.size,
      healthyServices: Array.from(this.serviceHealth.values()).filter(h => h.status === 'healthy').length,
      registryMetrics: this.registryMetrics,
      serviceHealth: Object.fromEntries(this.serviceHealth),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([name, cb]) => [
          name, 
          { isOpen: cb.isOpen(), failures: cb.failures, lastFailure: cb.lastFailureTime }
        ])
      )
    };
  }
}

export default new ServiceRegistry();
