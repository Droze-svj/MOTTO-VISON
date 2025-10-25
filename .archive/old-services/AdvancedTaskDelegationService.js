import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import EventBus from './EventBus';
import ErrorManager from './ErrorManager';

class AdvancedTaskDelegationService {
  constructor() {
    this.isInitialized = false;
    
    // Task delegation strategies
    this.delegationStrategies = {
      intelligentRouting: true,
      loadBalancing: true,
      priorityManagement: true,
      resourceOptimization: true,
      parallelExecution: true,
      adaptiveScaling: true,
      failureRecovery: true,
      performanceMonitoring: true
    };
    
    // Task categories and handlers
    this.taskCategories = new Map();
    this.taskHandlers = new Map();
    this.serviceCapabilities = new Map();
    this.delegationRules = new Map();
    
    // Task queue and management
    this.taskQueue = {
      high: [],
      medium: [],
      low: []
    };
    this.activeTasks = new Map();
    this.completedTasks = new Map();
    this.failedTasks = new Map();
    
    // Performance metrics
    this.delegationMetrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      averageQueueTime: 0,
      serviceUtilization: new Map(),
      successRate: 0,
      throughput: 0
    };
    
    // Learning and optimization
    this.learningSystem = {
      taskPatterns: new Map(),
      servicePerformance: new Map(),
      optimizationSuggestions: new Map(),
      adaptiveRules: new Map()
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadDelegationData();
      await this.initializeTaskCategories();
      await this.initializeServiceCapabilities();
      await this.initializeDelegationRules();
      await this.initializeTaskQueue();
      await this.startTaskProcessor();
      await this.setupEventListeners();
      this.isInitialized = true;
      
      console.log('Advanced Task Delegation Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Advanced Task Delegation Service:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedTaskDelegationService.initialize' });
    }
  }

  async initializeTaskCategories() {
    // Initialize task categories with their characteristics
    this.taskCategories.set('ai_processing', {
      type: 'ai_processing',
      complexity: 'high',
      resourceIntensive: true,
      timeout: 30000,
      retries: 3,
      priority: 'medium',
      services: ['AIEnhancementService', 'AdvancedAIService', 'MultiModalAIService']
    });
    
    this.taskCategories.set('data_processing', {
      type: 'data_processing',
      complexity: 'medium',
      resourceIntensive: true,
      timeout: 20000,
      retries: 2,
      priority: 'medium',
      services: ['DataManager', 'AdvancedAnalyticsEngine', 'PredictiveAnalyticsService']
    });
    
    this.taskCategories.set('monitoring', {
      type: 'monitoring',
      complexity: 'low',
      resourceIntensive: false,
      timeout: 10000,
      retries: 1,
      priority: 'high',
      services: ['EnhancedMonitoringService', 'AdvancedMonitoringService']
    });
    
    this.taskCategories.set('user_interaction', {
      type: 'user_interaction',
      complexity: 'low',
      resourceIntensive: false,
      timeout: 5000,
      retries: 2,
      priority: 'high',
      services: ['AIEnhancementService', 'StreamingAIService']
    });
    
    this.taskCategories.set('background_processing', {
      type: 'background_processing',
      complexity: 'medium',
      resourceIntensive: true,
      timeout: 60000,
      retries: 1,
      priority: 'low',
      services: ['PerformanceOptimizationService', 'AdvancedResilienceService']
    });
  }

  async initializeServiceCapabilities() {
    // Initialize service capabilities and performance metrics
    this.serviceCapabilities.set('AIEnhancementService', {
      name: 'AIEnhancementService',
      capabilities: ['ai_processing', 'user_interaction', 'context_management'],
      maxConcurrency: 5,
      currentLoad: 0,
      averageResponseTime: 0,
      successRate: 0.95,
      lastHealthCheck: Date.now(),
      status: 'healthy'
    });
    
    this.serviceCapabilities.set('AdvancedAIService', {
      name: 'AdvancedAIService',
      capabilities: ['ai_processing', 'advanced_reasoning', 'multi_modal'],
      maxConcurrency: 3,
      currentLoad: 0,
      averageResponseTime: 0,
      successRate: 0.92,
      lastHealthCheck: Date.now(),
      status: 'healthy'
    });
    
    this.serviceCapabilities.set('DataManager', {
      name: 'DataManager',
      capabilities: ['data_processing', 'storage', 'retrieval'],
      maxConcurrency: 10,
      currentLoad: 0,
      averageResponseTime: 0,
      successRate: 0.98,
      lastHealthCheck: Date.now(),
      status: 'healthy'
    });
    
    this.serviceCapabilities.set('EnhancedMonitoringService', {
      name: 'EnhancedMonitoringService',
      capabilities: ['monitoring', 'analytics', 'alerting'],
      maxConcurrency: 8,
      currentLoad: 0,
      averageResponseTime: 0,
      successRate: 0.99,
      lastHealthCheck: Date.now(),
      status: 'healthy'
    });
  }

  async initializeDelegationRules() {
    // Initialize intelligent delegation rules
    this.delegationRules.set('ai_processing', {
      condition: (task) => task.type === 'ai_processing',
      strategy: 'intelligent_routing',
      services: ['AIEnhancementService', 'AdvancedAIService'],
      loadBalancing: true,
      priority: 'medium'
    });
    
    this.delegationRules.set('urgent_user_request', {
      condition: (task) => task.priority === 'high' && task.type === 'user_interaction',
      strategy: 'fastest_available',
      services: ['AIEnhancementService'],
      loadBalancing: false,
      priority: 'high'
    });
    
    this.delegationRules.set('data_heavy_task', {
      condition: (task) => task.dataSize > 10000,
      strategy: 'resource_optimized',
      services: ['DataManager', 'AdvancedAnalyticsEngine'],
      loadBalancing: true,
      priority: 'medium'
    });
    
    this.delegationRules.set('monitoring_task', {
      condition: (task) => task.type === 'monitoring',
      strategy: 'dedicated_service',
      services: ['EnhancedMonitoringService'],
      loadBalancing: false,
      priority: 'high'
    });
  }

  async initializeTaskQueue() {
    // Initialize task queue with priority management
    this.taskQueue = {
      high: [],
      medium: [],
      low: []
    };
    
    // Start queue processor
    this.startQueueProcessor();
  }

  async delegateTask(task, context = {}) {
    const startTime = Date.now();
    const taskId = this.generateTaskId();
    
    try {
      // 1. Analyze task and determine delegation strategy
      const analysis = await this.analyzeTask(task, context);
      
      // 2. Select optimal service(s) for the task
      const selectedServices = await this.selectOptimalServices(task, analysis);
      
      // 3. Create task execution plan
      const executionPlan = await this.createExecutionPlan(task, selectedServices, analysis);
      
      // 4. Add task to appropriate queue
      await this.addTaskToQueue(taskId, task, executionPlan, analysis);
      
      // 5. Execute task based on priority and availability
      const result = await this.executeTask(taskId, task, executionPlan, analysis);
      
      // 6. Update metrics and learning
      await this.updateDelegationMetrics(taskId, result, Date.now() - startTime);
      await this.learnFromTaskExecution(taskId, task, result, analysis);
      
      return result;
    } catch (error) {
      console.error('Error in task delegation:', error);
      await this.handleTaskFailure(taskId, task, error);
      throw error;
    }
  }

  async analyzeTask(task, context) {
    const analysis = {
      type: task.type || 'general',
      complexity: 'medium',
      priority: task.priority || 'medium',
      resourceRequirements: 'normal',
      estimatedDuration: 5000,
      dependencies: [],
      constraints: [],
      optimizationOpportunities: []
    };
    
    // Analyze task complexity
    if (task.dataSize > 50000) {
      analysis.complexity = 'high';
      analysis.resourceRequirements = 'high';
    } else if (task.dataSize < 1000) {
      analysis.complexity = 'low';
      analysis.resourceRequirements = 'low';
    }
    
    // Analyze task type and requirements
    const category = this.taskCategories.get(task.type);
    if (category) {
      analysis.complexity = category.complexity;
      analysis.resourceRequirements = category.resourceIntensive ? 'high' : 'normal';
      analysis.estimatedDuration = category.timeout;
    }
    
    // Analyze context for additional requirements
    if (context.urgent) {
      analysis.priority = 'high';
    }
    
    if (context.userId) {
      analysis.userSpecific = true;
    }
    
    return analysis;
  }

  async selectOptimalServices(task, analysis) {
    const selectedServices = [];
    
    // Apply delegation rules
    for (const [ruleName, rule] of this.delegationRules) {
      if (rule.condition(task)) {
        const availableServices = await this.getAvailableServices(rule.services);
        selectedServices.push(...availableServices);
        break;
      }
    }
    
    // If no rule matches, use intelligent selection
    if (selectedServices.length === 0) {
      selectedServices.push(...await this.intelligentServiceSelection(task, analysis));
    }
    
    // Apply load balancing if enabled
    if (analysis.loadBalancing) {
      return await this.applyLoadBalancing(selectedServices, analysis);
    }
    
    return selectedServices;
  }

  async intelligentServiceSelection(task, analysis) {
    const suitableServices = [];
    
    // Find services that can handle the task type
    for (const [serviceName, capabilities] of this.serviceCapabilities) {
      if (capabilities.capabilities.includes(task.type) || 
          capabilities.capabilities.includes('general')) {
        
        // Check if service is healthy and has capacity
        if (capabilities.status === 'healthy' && 
            capabilities.currentLoad < capabilities.maxConcurrency) {
          suitableServices.push({
            name: serviceName,
            capabilities,
            score: this.calculateServiceScore(capabilities, analysis)
          });
        }
      }
    }
    
    // Sort by score and return top services
    suitableServices.sort((a, b) => b.score - a.score);
    return suitableServices.slice(0, 3).map(s => s.name);
  }

  calculateServiceScore(capabilities, analysis) {
    let score = 0;
    
    // Base score from success rate
    score += capabilities.successRate * 100;
    
    // Penalty for high load
    score -= (capabilities.currentLoad / capabilities.maxConcurrency) * 50;
    
    // Bonus for fast response time
    if (capabilities.averageResponseTime < 1000) {
      score += 20;
    }
    
    // Bonus for matching complexity
    if (analysis.complexity === 'high' && capabilities.capabilities.includes('advanced')) {
      score += 30;
    }
    
    return score;
  }

  async applyLoadBalancing(services, analysis) {
    const balancedServices = [];
    
    for (const serviceName of services) {
      const capabilities = this.serviceCapabilities.get(serviceName);
      if (capabilities && capabilities.currentLoad < capabilities.maxConcurrency * 0.8) {
        balancedServices.push(serviceName);
      }
    }
    
    return balancedServices.length > 0 ? balancedServices : services;
  }

  async createExecutionPlan(task, services, analysis) {
    const executionPlan = {
      taskId: this.generateTaskId(),
      task,
      services,
      strategy: analysis.parallelExecution ? 'parallel' : 'sequential',
      steps: [],
      dependencies: [],
      timeout: analysis.estimatedDuration,
      retries: analysis.retries || 3,
      priority: analysis.priority
    };
    
    // Create execution steps
    for (const serviceName of services) {
      executionPlan.steps.push({
        service: serviceName,
        action: this.determineServiceAction(serviceName, task),
        parameters: this.prepareServiceParameters(serviceName, task),
        timeout: this.calculateStepTimeout(serviceName, task),
        retries: 2
      });
    }
    
    return executionPlan;
  }

  determineServiceAction(serviceName, task) {
    const actionMap = {
      'AIEnhancementService': 'getEnhancedResponse',
      'AdvancedAIService': 'processAdvancedConversation',
      'DataManager': 'processData',
      'EnhancedMonitoringService': 'collectMetrics',
      'PredictiveAnalyticsService': 'generateInsights'
    };
    
    return actionMap[serviceName] || 'processTask';
  }

  prepareServiceParameters(serviceName, task) {
    const baseParams = {
      message: task.message,
      context: task.context,
      options: task.options || {}
    };
    
    // Add service-specific parameters
    if (serviceName === 'AIEnhancementService') {
      baseParams.enhanced = true;
    } else if (serviceName === 'AdvancedAIService') {
      baseParams.advanced = true;
    }
    
    return baseParams;
  }

  calculateStepTimeout(serviceName, task) {
    const capabilities = this.serviceCapabilities.get(serviceName);
    const baseTimeout = capabilities?.averageResponseTime || 5000;
    
    // Adjust timeout based on task complexity
    if (task.complexity === 'high') {
      return baseTimeout * 2;
    } else if (task.complexity === 'low') {
      return baseTimeout * 0.5;
    }
    
    return baseTimeout;
  }

  async addTaskToQueue(taskId, task, executionPlan, analysis) {
    const queueTask = {
      id: taskId,
      task,
      executionPlan,
      analysis,
      timestamp: Date.now(),
      priority: analysis.priority
    };
    
    // Add to appropriate priority queue
    this.taskQueue[analysis.priority].push(queueTask);
    
    // Sort queue by timestamp (FIFO within priority)
    this.taskQueue[analysis.priority].sort((a, b) => a.timestamp - b.timestamp);
    
    // Update queue metrics
    this.delegationMetrics.totalTasks++;
  }

  async executeTask(taskId, task, executionPlan, analysis) {
    const startTime = Date.now();
    this.activeTasks.set(taskId, { task, executionPlan, startTime });
    
    try {
      let result;
      
      if (executionPlan.strategy === 'parallel') {
        result = await this.executeParallel(executionPlan);
      } else {
        result = await this.executeSequential(executionPlan);
      }
      
      // Mark task as completed
      this.completedTasks.set(taskId, {
        task,
        result,
        executionTime: Date.now() - startTime,
        timestamp: Date.now()
      });
      
      this.activeTasks.delete(taskId);
      this.delegationMetrics.completedTasks++;
      
      return result;
    } catch (error) {
      this.activeTasks.delete(taskId);
      throw error;
    }
  }

  async executeParallel(executionPlan) {
    const promises = executionPlan.steps.map(step => 
      this.executeStep(step, executionPlan.task)
    );
    
    const results = await Promise.allSettled(promises);
    
    // Combine results
    const combinedResult = {
      success: results.every(r => r.status === 'fulfilled'),
      results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason),
      executionTime: Date.now() - executionPlan.timestamp
    };
    
    return combinedResult;
  }

  async executeSequential(executionPlan) {
    const results = [];
    
    for (const step of executionPlan.steps) {
      try {
        const result = await this.executeStep(step, executionPlan.task);
        results.push(result);
      } catch (error) {
        results.push({ error: error.message });
        break; // Stop on first error in sequential execution
      }
    }
    
    return {
      success: results.every(r => !r.error),
      results,
      executionTime: Date.now() - executionPlan.timestamp
    };
  }

  async executeStep(step, task) {
    const startTime = Date.now();
    
    try {
      // Simulate service call
      const result = await this.callService(step.service, step.action, step.parameters);
      
      // Update service load
      await this.updateServiceLoad(step.service, Date.now() - startTime, true);
      
      return result;
    } catch (error) {
      // Update service load with failure
      await this.updateServiceLoad(step.service, Date.now() - startTime, false);
      throw error;
    }
  }

  async callService(serviceName, action, parameters) {
    // Simulate service call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) { // 95% success rate
          resolve({
            service: serviceName,
            action,
            result: `Successfully executed ${action} on ${serviceName}`,
            timestamp: Date.now()
          });
        } else {
          reject(new Error(`Service ${serviceName} failed to execute ${action}`));
        }
      }, Math.random() * 2000 + 500); // 500-2500ms
    });
  }

  async updateServiceLoad(serviceName, executionTime, success) {
    const capabilities = this.serviceCapabilities.get(serviceName);
    if (capabilities) {
      capabilities.currentLoad = Math.max(0, capabilities.currentLoad - 1);
      capabilities.averageResponseTime = 
        (capabilities.averageResponseTime + executionTime) / 2;
      
      if (success) {
        capabilities.successRate = (capabilities.successRate + 1) / 2;
      } else {
        capabilities.successRate = capabilities.successRate * 0.95;
      }
    }
  }

  async startTaskProcessor() {
    // Process high priority tasks every 100ms
    setInterval(async () => {
      await this.processQueue('high');
    }, 100);
    
    // Process medium priority tasks every 500ms
    setInterval(async () => {
      await this.processQueue('medium');
    }, 500);
    
    // Process low priority tasks every 1000ms
    setInterval(async () => {
      await this.processQueue('low');
    }, 1000);
  }

  async processQueue(priority) {
    const queue = this.taskQueue[priority];
    if (queue.length === 0) return;
    
    const task = queue.shift();
    if (task) {
      try {
        await this.executeTask(task.id, task.task, task.executionPlan, task.analysis);
      } catch (error) {
        console.error(`Error processing ${priority} priority task:`, error);
        await this.handleTaskFailure(task.id, task.task, error);
      }
    }
  }

  async handleTaskFailure(taskId, task, error) {
    this.failedTasks.set(taskId, {
      task,
      error: error.message,
      timestamp: Date.now()
    });
    
    this.delegationMetrics.failedTasks++;
    
    // Emit failure event
    await EventBus.emit('task_delegation_failure', {
      taskId,
      task,
      error: error.message,
      timestamp: Date.now()
    });
  }

  async updateDelegationMetrics(taskId, result, executionTime) {
    this.delegationMetrics.averageExecutionTime = 
      (this.delegationMetrics.averageExecutionTime + executionTime) / 2;
    
    this.delegationMetrics.successRate = 
      this.delegationMetrics.completedTasks / this.delegationMetrics.totalTasks;
    
    this.delegationMetrics.throughput = 
      this.delegationMetrics.completedTasks / (Date.now() / 1000 / 60); // tasks per minute
  }

  async learnFromTaskExecution(taskId, task, result, analysis) {
    // Learn from successful task executions
    const learningData = {
      taskId,
      task,
      result,
      analysis,
      success: result.success,
      executionTime: result.executionTime,
      timestamp: Date.now()
    };
    
    // Update task patterns
    const patternKey = `${task.type}_${analysis.complexity}`;
    const pattern = this.learningSystem.taskPatterns.get(patternKey) || {
      count: 0,
      successCount: 0,
      averageTime: 0
    };
    
    pattern.count++;
    if (result.success) pattern.successCount++;
    pattern.averageTime = (pattern.averageTime + result.executionTime) / 2;
    
    this.learningSystem.taskPatterns.set(patternKey, pattern);
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async setupEventListeners() {
    await EventBus.on('service_health_update', async (event) => {
      await this.updateServiceHealth(event.data);
    });
    
    await EventBus.on('task_completed', async (event) => {
      await this.processTaskCompletion(event.data);
    });
  }

  async updateServiceHealth(data) {
    const { serviceName, health } = data;
    const capabilities = this.serviceCapabilities.get(serviceName);
    
    if (capabilities) {
      capabilities.status = health.status;
      capabilities.lastHealthCheck = Date.now();
    }
  }

  async processTaskCompletion(data) {
    // Process task completion for learning
    await this.learnFromTaskExecution(data.taskId, data.task, data.result, data.analysis);
  }

  async loadDelegationData() {
    try {
      const stored = await AsyncStorage.getItem('advanced_task_delegation_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.taskCategories = new Map(data.taskCategories || []);
        this.serviceCapabilities = new Map(data.serviceCapabilities || []);
        this.delegationRules = new Map(data.delegationRules || []);
        this.delegationMetrics = data.delegationMetrics || this.delegationMetrics;
        this.learningSystem = data.learningSystem || this.learningSystem;
      }
    } catch (error) {
      console.error('Error loading delegation data:', error);
    }
  }

  async saveDelegationData() {
    try {
      const data = {
        taskCategories: Array.from(this.taskCategories.entries()),
        serviceCapabilities: Array.from(this.serviceCapabilities.entries()),
        delegationRules: Array.from(this.delegationRules.entries()),
        delegationMetrics: this.delegationMetrics,
        learningSystem: this.learningSystem
      };
      await AsyncStorage.setItem('advanced_task_delegation_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving delegation data:', error);
    }
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      delegationStrategies: this.delegationStrategies,
      taskCategories: this.taskCategories.size,
      serviceCapabilities: this.serviceCapabilities.size,
      delegationRules: this.delegationRules.size,
      delegationMetrics: this.delegationMetrics,
      queueStatus: {
        high: this.taskQueue.high.length,
        medium: this.taskQueue.medium.length,
        low: this.taskQueue.low.length
      },
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks.size,
      failedTasks: this.failedTasks.size,
      learningSystem: {
        taskPatterns: this.learningSystem.taskPatterns.size,
        servicePerformance: this.learningSystem.servicePerformance.size,
        optimizationSuggestions: this.learningSystem.optimizationSuggestions.size
      }
    };
  }
}

export default new AdvancedTaskDelegationService();
