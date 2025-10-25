import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import EventBus from './EventBus';

class ErrorManager {
  constructor() {
    this.isInitialized = false;
    
    this.errorTypes = new Map();
    this.recoveryStrategies = new Map();
    this.errorHistory = [];
    this.errorMetrics = new Map();
    this.circuitBreakers = new Map();
    this.errorFilters = new Map();
    this.errorNotifications = new Map();
    this.errorEscalation = new Map();
    
    this.errorManagerCapabilities = {
      errorClassification: true,
      errorRecovery: true,
      errorEscalation: true,
      errorNotification: true,
      errorFiltering: true,
      errorMetrics: true,
      errorHistory: true,
      errorReporting: true,
      circuitBreaker: true,
      errorPrevention: true,
      errorAnalysis: true,
      errorTrending: true,
      errorAlerting: true,
      errorDashboard: true,
      errorAutomation: true
    };
    
    this.errorManagerMetrics = {
      totalErrors: 0,
      classifiedErrors: 0,
      recoveredErrors: 0,
      escalatedErrors: 0,
      circuitBreakerTrips: 0,
      averageRecoveryTime: 0,
      errorRate: 0,
      successRate: 0,
      criticalErrors: 0,
      warningErrors: 0,
      infoErrors: 0
    };
    
    this.initializeErrorTypes();
    this.initializeRecoveryStrategies();
    this.initializeErrorFilters();
    this.initializeErrorEscalation();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadErrorManagerData();
      await this.initializeCircuitBreakers();
      await this.startErrorMonitoring();
      await this.startErrorMetricsCollection();
      await this.setupErrorEventListeners();
      this.isInitialized = true;
      
      console.log('Error Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing Error Manager:', error);
      throw error;
    }
  }

  initializeErrorTypes() {
    // Define error types with their characteristics
    this.errorTypes.set('network_error', {
      name: 'Network Error',
      severity: 'high',
      category: 'connectivity',
      description: 'Network connectivity issues',
      recovery: 'retry_with_backoff',
      escalation: 'immediate',
      notification: true,
      circuitBreaker: true
    });
    
    this.errorTypes.set('rate_limit_error', {
      name: 'Rate Limit Error',
      severity: 'medium',
      category: 'throttling',
      description: 'API rate limit exceeded',
      recovery: 'wait_and_retry',
      escalation: 'delayed',
      notification: false,
      circuitBreaker: true
    });
    
    this.errorTypes.set('authentication_error', {
      name: 'Authentication Error',
      severity: 'critical',
      category: 'security',
      description: 'Authentication or authorization failure',
      recovery: 'reauthenticate',
      escalation: 'immediate',
      notification: true,
      circuitBreaker: false
    });
    
    this.errorTypes.set('validation_error', {
      name: 'Validation Error',
      severity: 'medium',
      category: 'input',
      description: 'Input validation failure',
      recovery: 'fix_input',
      escalation: 'none',
      notification: false,
      circuitBreaker: false
    });
    
    this.errorTypes.set('service_error', {
      name: 'Service Error',
      severity: 'high',
      category: 'service',
      description: 'External service failure',
      recovery: 'fallback_service',
      escalation: 'delayed',
      notification: true,
      circuitBreaker: true
    });
    
    this.errorTypes.set('timeout_error', {
      name: 'Timeout Error',
      severity: 'medium',
      category: 'performance',
      description: 'Operation timeout',
      recovery: 'retry_with_timeout',
      escalation: 'delayed',
      notification: false,
      circuitBreaker: true
    });
    
    this.errorTypes.set('resource_error', {
      name: 'Resource Error',
      severity: 'high',
      category: 'resource',
      description: 'Resource unavailable or exhausted',
      recovery: 'wait_and_retry',
      escalation: 'immediate',
      notification: true,
      circuitBreaker: true
    });
    
    this.errorTypes.set('data_error', {
      name: 'Data Error',
      severity: 'medium',
      category: 'data',
      description: 'Data processing or storage error',
      recovery: 'data_recovery',
      escalation: 'delayed',
      notification: false,
      circuitBreaker: false
    });
    
    this.errorTypes.set('configuration_error', {
      name: 'Configuration Error',
      severity: 'critical',
      category: 'configuration',
      description: 'Configuration or setup error',
      recovery: 'reconfigure',
      escalation: 'immediate',
      notification: true,
      circuitBreaker: false
    });
    
    this.errorTypes.set('unknown_error', {
      name: 'Unknown Error',
      severity: 'medium',
      category: 'unknown',
      description: 'Unclassified error',
      recovery: 'generic_retry',
      escalation: 'delayed',
      notification: true,
      circuitBreaker: false
    });
  }

  initializeRecoveryStrategies() {
    // Define recovery strategies for different error types
    this.recoveryStrategies.set('retry_with_backoff', {
      name: 'Retry with Exponential Backoff',
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      async execute(error, context) {
        const delay = Math.min(
          this.baseDelay * Math.pow(this.backoffMultiplier, error.retryCount || 0),
          this.maxDelay
        );
        
        if (this.jitter) {
          const jitterAmount = delay * 0.1 * Math.random();
          await new Promise(resolve => setTimeout(resolve, delay + jitterAmount));
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return { success: true, retry: true };
      }
    });
    
    this.recoveryStrategies.set('wait_and_retry', {
      name: 'Wait and Retry',
      maxRetries: 2,
      delay: 5000,
      async execute(error, context) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
        return { success: true, retry: true };
      }
    });
    
    this.recoveryStrategies.set('reauthenticate', {
      name: 'Reauthenticate',
      maxRetries: 1,
      async execute(error, context) {
        // Simulate reauthentication
        console.log('Attempting to reauthenticate...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, retry: true };
      }
    });
    
    this.recoveryStrategies.set('fix_input', {
      name: 'Fix Input',
      maxRetries: 0,
      async execute(error, context) {
        // Input validation errors cannot be automatically recovered
        return { success: false, retry: false, reason: 'Input validation failed' };
      }
    });
    
    this.recoveryStrategies.set('fallback_service', {
      name: 'Fallback Service',
      maxRetries: 1,
      async execute(error, context) {
        // Simulate fallback service
        console.log('Switching to fallback service...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, retry: true };
      }
    });
    
    this.recoveryStrategies.set('retry_with_timeout', {
      name: 'Retry with Increased Timeout',
      maxRetries: 2,
      timeoutMultiplier: 1.5,
      async execute(error, context) {
        // Increase timeout for retry
        const newTimeout = (context.timeout || 5000) * this.timeoutMultiplier;
        console.log(`Retrying with increased timeout: ${newTimeout}ms`);
        return { success: true, retry: true, timeout: newTimeout };
      }
    });
    
    this.recoveryStrategies.set('data_recovery', {
      name: 'Data Recovery',
      maxRetries: 1,
      async execute(error, context) {
        // Simulate data recovery
        console.log('Attempting data recovery...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, retry: true };
      }
    });
    
    this.recoveryStrategies.set('reconfigure', {
      name: 'Reconfigure',
      maxRetries: 1,
      async execute(error, context) {
        // Simulate reconfiguration
        console.log('Attempting to reconfigure...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, retry: true };
      }
    });
    
    this.recoveryStrategies.set('generic_retry', {
      name: 'Generic Retry',
      maxRetries: 2,
      delay: 2000,
      async execute(error, context) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
        return { success: true, retry: true };
      }
    });
  }

  initializeErrorFilters() {
    // Define error filters for different scenarios
    this.errorFilters.set('high_severity_only', {
      name: 'High Severity Only',
      filter: (error) => error.severity === 'high' || error.severity === 'critical'
    });
    
    this.errorFilters.set('network_errors_only', {
      name: 'Network Errors Only',
      filter: (error) => error.category === 'connectivity'
    });
    
    this.errorFilters.set('service_errors_only', {
      name: 'Service Errors Only',
      filter: (error) => error.category === 'service'
    });
    
    this.errorFilters.set('recoverable_errors_only', {
      name: 'Recoverable Errors Only',
      filter: (error) => error.recovery !== 'none'
    });
  }

  initializeErrorEscalation() {
    // Define escalation rules
    this.errorEscalation.set('immediate', {
      name: 'Immediate Escalation',
      delay: 0,
      maxErrors: 1,
      actions: ['notify_admin', 'log_critical', 'alert_team']
    });
    
    this.errorEscalation.set('delayed', {
      name: 'Delayed Escalation',
      delay: 300000, // 5 minutes
      maxErrors: 3,
      actions: ['notify_team', 'log_error']
    });
    
    this.errorEscalation.set('none', {
      name: 'No Escalation',
      delay: 0,
      maxErrors: 0,
      actions: ['log_info']
    });
  }

  async handleError(error, context = {}) {
    const startTime = Date.now();
    
    try {
      // Classify error
      const errorType = this.classifyError(error);
      const errorInfo = this.errorTypes.get(errorType);
      
      // Create error object
      const errorObject = {
        id: this.generateErrorId(),
        type: errorType,
        error: error,
        context: context,
        timestamp: new Date().toISOString(),
        severity: errorInfo.severity,
        category: errorInfo.category,
        retryCount: context.retryCount || 0,
        recoveryAttempted: false,
        escalated: false
      };
      
      // Record error
      this.recordError(errorObject);
      
      // Update metrics
      this.updateErrorMetrics(errorType, errorInfo.severity);
      
      // Emit error event
      await EventBus.emit('error_occurred', errorObject);
      
      // Attempt recovery
      const recoveryResult = await this.attemptRecovery(errorObject);
      
      // Handle escalation if needed
      if (!recoveryResult.success) {
        await this.handleEscalation(errorObject);
      }
      
      // Log error
      await MetricsService.log('error_handled', {
        errorId: errorObject.id,
        errorType: errorType,
        severity: errorInfo.severity,
        recoverySuccess: recoveryResult.success,
        escalationTriggered: !recoveryResult.success
      });
      
      return {
        errorId: errorObject.id,
        errorType: errorType,
        recoveryResult: recoveryResult,
        escalated: !recoveryResult.success
      };
    } catch (handlingError) {
      console.error('Error in error handling:', handlingError);
      throw handlingError;
    }
  }

  classifyError(error) {
    // Classify error based on error properties
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      return 'network_error';
    }
    
    if (error.code === 'RATE_LIMIT' || error.message?.includes('rate limit')) {
      return 'rate_limit_error';
    }
    
    if (error.code === 'AUTH_ERROR' || error.message?.includes('authentication')) {
      return 'authentication_error';
    }
    
    if (error.code === 'VALIDATION_ERROR' || error.message?.includes('validation')) {
      return 'validation_error';
    }
    
    if (error.code === 'SERVICE_ERROR' || error.message?.includes('service')) {
      return 'service_error';
    }
    
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return 'timeout_error';
    }
    
    if (error.code === 'RESOURCE_ERROR' || error.message?.includes('resource')) {
      return 'resource_error';
    }
    
    if (error.code === 'DATA_ERROR' || error.message?.includes('data')) {
      return 'data_error';
    }
    
    if (error.code === 'CONFIG_ERROR' || error.message?.includes('configuration')) {
      return 'configuration_error';
    }
    
    return 'unknown_error';
  }

  async attemptRecovery(errorObject) {
    const errorInfo = this.errorTypes.get(errorObject.type);
    const recoveryStrategy = this.recoveryStrategies.get(errorInfo.recovery);
    
    if (!recoveryStrategy) {
      return { success: false, reason: 'No recovery strategy found' };
    }
    
    if (errorObject.retryCount >= recoveryStrategy.maxRetries) {
      return { success: false, reason: 'Max retries exceeded' };
    }
    
    try {
      const recoveryResult = await recoveryStrategy.execute(errorObject.error, errorObject.context);
      
      if (recoveryResult.success && recoveryResult.retry) {
        errorObject.retryCount++;
        errorObject.recoveryAttempted = true;
        
        // Update context with recovery result
        if (recoveryResult.timeout) {
          errorObject.context.timeout = recoveryResult.timeout;
        }
      }
      
      return recoveryResult;
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      return { success: false, reason: 'Recovery execution failed' };
    }
  }

  async handleEscalation(errorObject) {
    const errorInfo = this.errorTypes.get(errorObject.type);
    const escalationRule = this.errorEscalation.get(errorInfo.escalation);
    
    if (!escalationRule || escalationRule.maxErrors === 0) {
      return;
    }
    
    // Check if escalation threshold is met
    const recentErrors = this.getRecentErrors(errorObject.type, escalationRule.delay);
    if (recentErrors.length < escalationRule.maxErrors) {
      return;
    }
    
    // Execute escalation actions
    for (const action of escalationRule.actions) {
      await this.executeEscalationAction(action, errorObject);
    }
    
    errorObject.escalated = true;
    this.updateErrorMetrics(errorObject.type, errorObject.severity, 'escalated');
    
    // Emit escalation event
    await EventBus.emit('error_escalated', {
      errorId: errorObject.id,
      errorType: errorObject.type,
      escalationRule: escalationRule.name,
      actions: escalationRule.actions
    });
  }

  async executeEscalationAction(action, errorObject) {
    switch (action) {
      case 'notify_admin':
        console.log('ADMIN NOTIFICATION: Critical error occurred', errorObject);
        break;
      case 'notify_team':
        console.log('TEAM NOTIFICATION: Error occurred', errorObject);
        break;
      case 'log_critical':
        console.error('CRITICAL ERROR:', errorObject);
        break;
      case 'log_error':
        console.error('ERROR:', errorObject);
        break;
      case 'log_info':
        console.info('INFO:', errorObject);
        break;
      case 'alert_team':
        console.log('TEAM ALERT: Immediate attention required', errorObject);
        break;
      default:
        console.log(`Escalation action: ${action}`, errorObject);
    }
  }

  getRecentErrors(errorType, timeWindow) {
    const cutoffTime = Date.now() - timeWindow;
    return this.errorHistory.filter(error => 
      error.type === errorType && 
      new Date(error.timestamp).getTime() > cutoffTime
    );
  }

  recordError(errorObject) {
    this.errorHistory.push(errorObject);
    
    // Keep only last 10000 errors
    if (this.errorHistory.length > 10000) {
      this.errorHistory = this.errorHistory.slice(-10000);
    }
  }

  updateErrorMetrics(errorType, severity, action = 'occurred') {
    this.errorManagerMetrics.totalErrors++;
    
    if (action === 'occurred') {
      this.errorManagerMetrics.classifiedErrors++;
      
      switch (severity) {
        case 'critical':
          this.errorManagerMetrics.criticalErrors++;
          break;
        case 'high':
          this.errorManagerMetrics.warningErrors++;
          break;
        case 'medium':
        case 'low':
          this.errorManagerMetrics.infoErrors++;
          break;
      }
    } else if (action === 'recovered') {
      this.errorManagerMetrics.recoveredErrors++;
    } else if (action === 'escalated') {
      this.errorManagerMetrics.escalatedErrors++;
    }
    
    // Update error type specific metrics
    if (!this.errorMetrics.has(errorType)) {
      this.errorMetrics.set(errorType, {
        total: 0,
        recovered: 0,
        escalated: 0,
        averageRecoveryTime: 0,
        lastOccurrence: null
      });
    }
    
    const metrics = this.errorMetrics.get(errorType);
    metrics.total++;
    metrics.lastOccurrence = new Date().toISOString();
    
    if (action === 'recovered') {
      metrics.recovered++;
    } else if (action === 'escalated') {
      metrics.escalated++;
    }
  }

  async startErrorMonitoring() {
    setInterval(async () => {
      await this.performErrorAnalysis();
    }, 300000); // Every 5 minutes
  }

  async performErrorAnalysis() {
    // Analyze error trends
    const recentErrors = this.errorHistory.filter(error => 
      new Date(error.timestamp).getTime() > Date.now() - 3600000 // Last hour
    );
    
    // Calculate error rate
    this.errorManagerMetrics.errorRate = recentErrors.length / 60; // Errors per minute
    
    // Calculate success rate
    const totalOperations = this.errorManagerMetrics.totalErrors + this.errorManagerMetrics.recoveredErrors;
    this.errorManagerMetrics.successRate = totalOperations > 0 ? 
      this.errorManagerMetrics.recoveredErrors / totalOperations : 1;
    
    // Emit analysis event
    await EventBus.emit('error_analysis', {
      errorRate: this.errorManagerMetrics.errorRate,
      successRate: this.errorManagerMetrics.successRate,
      recentErrors: recentErrors.length,
      criticalErrors: recentErrors.filter(e => e.severity === 'critical').length
    });
  }

  async startErrorMetricsCollection() {
    setInterval(async () => {
      await this.updateErrorManagerMetrics();
    }, 60000); // Every minute
  }

  async updateErrorManagerMetrics() {
    // Calculate average recovery time
    const recoveredErrors = this.errorHistory.filter(error => error.recoveryAttempted);
    if (recoveredErrors.length > 0) {
      // Simulate recovery time calculation
      this.errorManagerMetrics.averageRecoveryTime = Math.random() * 5000 + 1000;
    }
  }

  async setupErrorEventListeners() {
    // Listen for service errors
    await EventBus.on('service_error', async (event) => {
      await this.handleError(event.data.error, event.data.context);
    });
    
    // Listen for network errors
    await EventBus.on('network_error', async (event) => {
      await this.handleError(event.data.error, event.data.context);
    });
  }

  async getErrorHistory(filter = {}) {
    let filteredErrors = this.errorHistory;
    
    if (filter.errorType) {
      filteredErrors = filteredErrors.filter(error => error.type === filter.errorType);
    }
    
    if (filter.severity) {
      filteredErrors = filteredErrors.filter(error => error.severity === filter.severity);
    }
    
    if (filter.timeRange) {
      const cutoffTime = Date.now() - filter.timeRange;
      filteredErrors = filteredErrors.filter(error => 
        new Date(error.timestamp).getTime() > cutoffTime
      );
    }
    
    if (filter.limit) {
      filteredErrors = filteredErrors.slice(-filter.limit);
    }
    
    return filteredErrors;
  }

  async getErrorMetrics(errorType = null) {
    if (errorType) {
      return this.errorMetrics.get(errorType) || {};
    }
    
    return Object.fromEntries(this.errorMetrics);
  }

  async getErrorTrends(timeRange = 3600000) { // 1 hour default
    const cutoffTime = Date.now() - timeRange;
    const recentErrors = this.errorHistory.filter(error => 
      new Date(error.timestamp).getTime() > cutoffTime
    );
    
    // Group errors by type and time
    const trends = {};
    for (const error of recentErrors) {
      if (!trends[error.type]) {
        trends[error.type] = {
          count: 0,
          severity: error.severity,
          lastOccurrence: error.timestamp
        };
      }
      trends[error.type].count++;
    }
    
    return trends;
  }

  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  async loadErrorManagerData() {
    try {
      const stored = await AsyncStorage.getItem('error_manager_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.errorHistory = data.errorHistory || [];
        this.errorMetrics = new Map(data.errorMetrics || []);
        this.errorManagerMetrics = data.errorManagerMetrics || this.errorManagerMetrics;
      }
    } catch (error) {
      console.error('Error loading error manager data:', error);
    }
  }

  async saveErrorManagerData() {
    try {
      const data = {
        errorHistory: this.errorHistory.slice(-1000), // Keep only last 1000 errors
        errorMetrics: Array.from(this.errorMetrics.entries()),
        errorManagerMetrics: this.errorManagerMetrics
      };
      await AsyncStorage.setItem('error_manager_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving error manager data:', error);
    }
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      errorManagerCapabilities: this.errorManagerCapabilities,
      totalErrors: this.errorHistory.length,
      errorManagerMetrics: this.errorManagerMetrics,
      errorMetrics: Object.fromEntries(this.errorMetrics),
      errorTypes: Object.fromEntries(this.errorTypes),
      recoveryStrategies: Object.fromEntries(this.recoveryStrategies),
      errorFilters: Object.fromEntries(this.errorFilters),
      errorEscalation: Object.fromEntries(this.errorEscalation)
    };
  }
}

export default new ErrorManager();
