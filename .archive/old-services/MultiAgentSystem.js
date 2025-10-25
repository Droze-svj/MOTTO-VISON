import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';
import RateLimitingService from './RateLimitingService';
import ContentModerationService from './ContentModerationService';

class MultiAgentSystem {
  constructor() {
    this.isInitialized = false;
    
    // Agent system capabilities
    this.agentCapabilities = {
      agentCoordination: true,
      taskDistribution: true,
      loadBalancing: true,
      agentCommunication: true,
      dynamicScaling: true,
      agentSpecialization: true,
      consensusMechanisms: true,
      agentLearning: true
    };
    
    // Agent types and specializations
    this.agentTypes = {
      general: {
        name: 'General Agent',
        description: 'Handles general queries and tasks',
        capabilities: ['text_processing', 'basic_reasoning', 'conversation'],
        maxConcurrentTasks: 10,
        priority: 1
      },
      specialist: {
        name: 'Specialist Agent',
        description: 'Handles specialized domain tasks',
        capabilities: ['domain_expertise', 'technical_analysis', 'research'],
        maxConcurrentTasks: 5,
        priority: 2
      },
      creative: {
        name: 'Creative Agent',
        description: 'Handles creative and artistic tasks',
        capabilities: ['content_generation', 'creative_writing', 'design'],
        maxConcurrentTasks: 8,
        priority: 2
      },
      analytical: {
        name: 'Analytical Agent',
        description: 'Handles data analysis and reasoning',
        capabilities: ['data_analysis', 'logical_reasoning', 'problem_solving'],
        maxConcurrentTasks: 6,
        priority: 2
      },
      coordinator: {
        name: 'Coordinator Agent',
        description: 'Coordinates multi-agent tasks',
        capabilities: ['task_coordination', 'load_balancing', 'consensus'],
        maxConcurrentTasks: 20,
        priority: 0
      },
      security: {
        name: 'Security Agent',
        description: 'Handles security and safety tasks',
        capabilities: ['threat_detection', 'safety_analysis', 'compliance'],
        maxConcurrentTasks: 15,
        priority: 0
      }
    };
    
    // Active agents
    this.activeAgents = new Map();
    this.agentPool = new Map();
    this.agentTasks = new Map();
    this.agentPerformance = new Map();
    
    // Task management
    this.taskQueue = [];
    this.completedTasks = [];
    this.failedTasks = [];
    this.taskHistory = [];
    
    // Agent communication
    this.messageBus = new Map();
    this.agentChannels = new Map();
    this.communicationHistory = [];
    
    // Load balancing
    this.loadBalancer = {
      strategy: 'round_robin', // round_robin, least_loaded, priority_based, adaptive
      weights: new Map(),
      healthChecks: new Map(),
      performanceMetrics: new Map()
    };
    
    // Consensus mechanisms
    this.consensusConfig = {
      enabled: true,
      threshold: 0.7, // 70% agreement required
      timeout: 30000, // 30 seconds
      maxRetries: 3
    };
    
    // Agent learning
    this.learningConfig = {
      enabled: true,
      learningRate: 0.1,
      memorySize: 1000,
      adaptationThreshold: 0.8
    };
    
    // System metrics
    this.systemMetrics = {
      totalAgents: 0,
      activeAgents: 0,
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageResponseTime: 0,
      systemLoad: 0,
      agentUtilization: 0
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await RateLimitingService.initialize();
      await ContentModerationService.initialize();
      await this.loadAgentData();
      await this.initializeAgents();
      await this.startAgentMonitoring();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing MultiAgentSystem:', error);
    }
  }

  // Agent Management
  async createAgent(type, config = {}) {
    await this.initialize();
    
    const agentId = this.generateAgentId();
    const agentType = this.agentTypes[type] || this.agentTypes.general;
    
    const agent = {
      id: agentId,
      type: type,
      name: agentType.name,
      description: agentType.description,
      capabilities: agentType.capabilities,
      maxConcurrentTasks: agentType.maxConcurrentTasks,
      priority: agentType.priority,
      status: 'idle',
      currentTasks: [],
      performance: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        averageResponseTime: 0,
        successRate: 0,
        lastActivity: new Date().toISOString()
      },
      config: config,
      createdAt: new Date().toISOString()
    };
    
    this.activeAgents.set(agentId, agent);
    this.agentPool.set(agentId, agent);
    this.agentPerformance.set(agentId, agent.performance);
    
    // Initialize agent channels
    this.agentChannels.set(agentId, []);
    
    await this.saveAgentData();
    
    await MetricsService.log('agent_created', {
      agentId,
      type,
      capabilities: agent.capabilities
    });
    
    return agent;
  }

  async removeAgent(agentId) {
    const agent = this.activeAgents.get(agentId);
    if (!agent) return false;
    
    // Reassign active tasks
    await this.reassignAgentTasks(agentId);
    
    // Remove agent
    this.activeAgents.delete(agentId);
    this.agentPool.delete(agentId);
    this.agentPerformance.delete(agentId);
    this.agentChannels.delete(agentId);
    
    await this.saveAgentData();
    
    await MetricsService.log('agent_removed', {
      agentId,
      type: agent.type
    });
    
    return true;
  }

  async reassignAgentTasks(agentId) {
    const agent = this.activeAgents.get(agentId);
    if (!agent) return;
    
    // Get tasks assigned to this agent
    const agentTasks = Array.from(this.agentTasks.entries())
      .filter(([taskId, task]) => task.assignedAgent === agentId)
      .map(([taskId, task]) => ({ taskId, task }));
    
    // Reassign tasks to other agents
    for (const { taskId, task } of agentTasks) {
      const newAgent = await this.selectOptimalAgent(task);
      if (newAgent) {
        task.assignedAgent = newAgent.id;
        this.agentTasks.set(taskId, task);
      } else {
        // If no agent available, add back to queue
        this.taskQueue.push(task);
      }
    }
  }

  // Task Management
  async submitTask(task, options = {}) {
    await this.initialize();
    
    const taskId = this.generateTaskId();
    const taskData = {
      id: taskId,
      type: task.type || 'general',
      description: task.description,
      payload: task.payload,
      priority: task.priority || 1,
      requirements: task.requirements || [],
      deadline: task.deadline,
      status: 'pending',
      assignedAgent: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
      metadata: options
    };
    
    // Add to task queue
    this.taskQueue.push(taskData);
    
    // Try to assign immediately
    await this.processTaskQueue();
    
    await MetricsService.log('task_submitted', {
      taskId,
      type: taskData.type,
      priority: taskData.priority
    });
    
    return taskData;
  }

  async processTaskQueue() {
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      
      try {
        const agent = await this.selectOptimalAgent(task);
        if (agent) {
          await this.assignTaskToAgent(task, agent);
        } else {
          // No available agent, put back in queue
          this.taskQueue.unshift(task);
          break;
        }
      } catch (error) {
        console.error('Error processing task:', error);
        task.status = 'failed';
        task.error = error.message;
        this.failedTasks.push(task);
      }
    }
  }

  async selectOptimalAgent(task) {
    const availableAgents = Array.from(this.activeAgents.values())
      .filter(agent => 
        agent.status === 'idle' && 
        agent.currentTasks.length < agent.maxConcurrentTasks &&
        this.hasRequiredCapabilities(agent, task.requirements)
      );
    
    if (availableAgents.length === 0) return null;
    
    // Apply load balancing strategy
    switch (this.loadBalancer.strategy) {
      case 'round_robin':
        return this.selectRoundRobin(availableAgents);
      case 'least_loaded':
        return this.selectLeastLoaded(availableAgents);
      case 'priority_based':
        return this.selectPriorityBased(availableAgents, task);
      case 'adaptive':
        return this.selectAdaptive(availableAgents, task);
      default:
        return availableAgents[0];
    }
  }

  selectRoundRobin(agents) {
    // Simple round-robin selection
    const sortedAgents = agents.sort((a, b) => a.id.localeCompare(b.id));
    return sortedAgents[0];
  }

  selectLeastLoaded(agents) {
    return agents.reduce((least, agent) => 
      agent.currentTasks.length < least.currentTasks.length ? agent : least
    );
  }

  selectPriorityBased(agents, task) {
    // Select based on agent priority and task requirements
    const scoredAgents = agents.map(agent => {
      let score = agent.priority;
      
      // Bonus for matching capabilities
      const matchingCapabilities = task.requirements.filter(req => 
        agent.capabilities.includes(req)
      ).length;
      score += matchingCapabilities * 0.5;
      
      // Bonus for performance
      const performance = this.agentPerformance.get(agent.id);
      score += performance.successRate * 0.3;
      
      return { agent, score };
    });
    
    return scoredAgents.sort((a, b) => b.score - a.score)[0].agent;
  }

  selectAdaptive(agents, task) {
    // Adaptive selection based on historical performance
    const scoredAgents = agents.map(agent => {
      const performance = this.agentPerformance.get(agent.id);
      const loadFactor = agent.currentTasks.length / agent.maxConcurrentTasks;
      const performanceScore = performance.successRate * (1 - loadFactor);
      
      return { agent, score: performanceScore };
    });
    
    return scoredAgents.sort((a, b) => b.score - a.score)[0].agent;
  }

  hasRequiredCapabilities(agent, requirements) {
    if (!requirements || requirements.length === 0) return true;
    return requirements.every(req => agent.capabilities.includes(req));
  }

  async assignTaskToAgent(task, agent) {
    task.assignedAgent = agent.id;
    task.status = 'assigned';
    task.startedAt = new Date().toISOString();
    
    agent.currentTasks.push(task.id);
    agent.status = 'busy';
    
    this.agentTasks.set(task.id, task);
    
    // Execute task
    this.executeTask(task, agent);
    
    await MetricsService.log('task_assigned', {
      taskId: task.id,
      agentId: agent.id,
      type: task.type
    });
  }

  async executeTask(task, agent) {
    try {
      // Simulate task execution
      const result = await this.performTaskExecution(task, agent);
      
      // Mark task as completed
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.result = result;
      
      // Update agent performance
      await this.updateAgentPerformance(agent.id, task, true);
      
      // Remove from agent's current tasks
      agent.currentTasks = agent.currentTasks.filter(id => id !== task.id);
      if (agent.currentTasks.length === 0) {
        agent.status = 'idle';
      }
      
      this.completedTasks.push(task);
      
      await MetricsService.log('task_completed', {
        taskId: task.id,
        agentId: agent.id,
        duration: Date.now() - new Date(task.startedAt).getTime()
      });
      
    } catch (error) {
      // Mark task as failed
      task.status = 'failed';
      task.completedAt = new Date().toISOString();
      task.error = error.message;
      
      // Update agent performance
      await this.updateAgentPerformance(agent.id, task, false);
      
      // Remove from agent's current tasks
      agent.currentTasks = agent.currentTasks.filter(id => id !== task.id);
      if (agent.currentTasks.length === 0) {
        agent.status = 'idle';
      }
      
      this.failedTasks.push(task);
      
      await MetricsService.log('task_failed', {
        taskId: task.id,
        agentId: agent.id,
        error: error.message
      });
    }
  }

  async performTaskExecution(task, agent) {
    // Simulate task execution based on task type
    const executionTime = Math.random() * 2000 + 500; // 500-2500ms
    
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    // Generate result based on task type
    const result = {
      taskId: task.id,
      agentId: agent.id,
      type: task.type,
      result: `Task completed by ${agent.name}`,
      executionTime: executionTime,
      timestamp: new Date().toISOString()
    };
    
    return result;
  }

  // Agent Communication
  async sendMessage(fromAgentId, toAgentId, message, type = 'general') {
    const messageData = {
      id: this.generateMessageId(),
      from: fromAgentId,
      to: toAgentId,
      type: type,
      content: message,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    // Add to message bus
    if (!this.messageBus.has(toAgentId)) {
      this.messageBus.set(toAgentId, []);
    }
    this.messageBus.get(toAgentId).push(messageData);
    
    // Add to communication history
    this.communicationHistory.push(messageData);
    
    await MetricsService.log('agent_message_sent', {
      fromAgentId,
      toAgentId,
      type,
      messageId: messageData.id
    });
    
    return messageData;
  }

  async getMessages(agentId) {
    const messages = this.messageBus.get(agentId) || [];
    return messages;
  }

  async clearMessages(agentId) {
    this.messageBus.set(agentId, []);
  }

  // Consensus Mechanisms
  async reachConsensus(task, agents, options = {}) {
    if (!this.consensusConfig.enabled) {
      return { consensus: true, result: null };
    }
    
    const consensusId = this.generateConsensusId();
    const responses = new Map();
    const timeout = options.timeout || this.consensusConfig.timeout;
    
    // Submit task to multiple agents
    const consensusTask = {
      id: consensusId,
      type: 'consensus',
      description: `Consensus task: ${task.description}`,
      payload: task.payload,
      agents: agents.map(agent => agent.id),
      threshold: options.threshold || this.consensusConfig.threshold,
      deadline: new Date(Date.now() + timeout)
    };
    
    // Execute consensus task
    const consensusResult = await this.executeConsensusTask(consensusTask, agents);
    
    return consensusResult;
  }

  async executeConsensusTask(task, agents) {
    const responses = [];
    const promises = agents.map(async (agent) => {
      try {
        const result = await this.performTaskExecution(task, agent);
        responses.push({
          agentId: agent.id,
          result: result,
          confidence: Math.random() * 0.4 + 0.6 // 0.6-1.0
        });
      } catch (error) {
        responses.push({
          agentId: agent.id,
          error: error.message,
          confidence: 0
        });
      }
    });
    
    await Promise.all(promises);
    
    // Analyze consensus
    const consensusResult = this.analyzeConsensus(responses, task.threshold);
    
    return consensusResult;
  }

  analyzeConsensus(responses, threshold) {
    if (responses.length === 0) {
      return { consensus: false, result: null, confidence: 0 };
    }
    
    // Group similar responses
    const responseGroups = new Map();
    responses.forEach(response => {
      if (response.error) return;
      
      const key = JSON.stringify(response.result);
      if (!responseGroups.has(key)) {
        responseGroups.set(key, []);
      }
      responseGroups.get(key).push(response);
    });
    
    // Find majority response
    let majorityGroup = null;
    let maxCount = 0;
    
    for (const [key, group] of responseGroups.entries()) {
      if (group.length > maxCount) {
        maxCount = group.length;
        majorityGroup = group;
      }
    }
    
    const consensusRatio = maxCount / responses.length;
    const consensus = consensusRatio >= threshold;
    
    return {
      consensus: consensus,
      result: majorityGroup ? majorityGroup[0].result : null,
      confidence: consensusRatio,
      totalResponses: responses.length,
      majorityCount: maxCount
    };
  }

  // Performance Monitoring
  async updateAgentPerformance(agentId, task, success) {
    const performance = this.agentPerformance.get(agentId);
    if (!performance) return;
    
    performance.totalTasks += 1;
    if (success) {
      performance.completedTasks += 1;
    } else {
      performance.failedTasks += 1;
    }
    
    performance.successRate = performance.completedTasks / performance.totalTasks;
    performance.lastActivity = new Date().toISOString();
    
    // Update average response time
    const responseTime = Date.now() - new Date(task.startedAt).getTime();
    performance.averageResponseTime = 
      (performance.averageResponseTime * (performance.totalTasks - 1) + responseTime) / 
      performance.totalTasks;
    
    this.agentPerformance.set(agentId, performance);
  }

  async startAgentMonitoring() {
    setInterval(async () => {
      await this.updateSystemMetrics();
      await this.performHealthChecks();
    }, 30000); // Every 30 seconds
  }

  async updateSystemMetrics() {
    this.systemMetrics.totalAgents = this.activeAgents.size;
    this.systemMetrics.activeAgents = Array.from(this.activeAgents.values())
      .filter(agent => agent.status === 'busy').length;
    this.systemMetrics.totalTasks = this.taskQueue.length + 
      Array.from(this.agentTasks.values()).length;
    this.systemMetrics.completedTasks = this.completedTasks.length;
    this.systemMetrics.failedTasks = this.failedTasks.length;
    
    // Calculate system load
    const totalCapacity = Array.from(this.activeAgents.values())
      .reduce((sum, agent) => sum + agent.maxConcurrentTasks, 0);
    const currentLoad = Array.from(this.activeAgents.values())
      .reduce((sum, agent) => sum + agent.currentTasks.length, 0);
    
    this.systemMetrics.systemLoad = totalCapacity > 0 ? currentLoad / totalCapacity : 0;
    this.systemMetrics.agentUtilization = this.systemMetrics.activeAgents / this.systemMetrics.totalAgents;
  }

  async performHealthChecks() {
    for (const [agentId, agent] of this.activeAgents.entries()) {
      const health = await this.checkAgentHealth(agent);
      this.loadBalancer.healthChecks.set(agentId, health);
      
      if (!health.healthy) {
        console.warn(`Agent ${agentId} is unhealthy:`, health.issues);
      }
    }
  }

  async checkAgentHealth(agent) {
    const issues = [];
    
    // Check if agent is responsive
    if (agent.status === 'busy' && agent.currentTasks.length === 0) {
      issues.push('Agent marked as busy but has no tasks');
    }
    
    // Check performance
    const performance = this.agentPerformance.get(agent.id);
    if (performance && performance.successRate < 0.5) {
      issues.push('Low success rate');
    }
    
    // Check if agent is overloaded
    if (agent.currentTasks.length >= agent.maxConcurrentTasks) {
      issues.push('Agent is overloaded');
    }
    
    return {
      healthy: issues.length === 0,
      issues: issues,
      timestamp: new Date().toISOString()
    };
  }

  // Utility Methods
  generateAgentId() {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateConsensusId() {
    return `consensus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  async loadAgentData() {
    try {
      const stored = await AsyncStorage.getItem('multi_agent_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.activeAgents = new Map(data.activeAgents || []);
        this.agentPool = new Map(data.agentPool || []);
        this.agentPerformance = new Map(data.agentPerformance || []);
        this.taskQueue = data.taskQueue || [];
        this.completedTasks = data.completedTasks || [];
        this.failedTasks = data.failedTasks || [];
        this.communicationHistory = data.communicationHistory || [];
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    }
  }

  async saveAgentData() {
    try {
      const data = {
        activeAgents: Array.from(this.activeAgents.entries()),
        agentPool: Array.from(this.agentPool.entries()),
        agentPerformance: Array.from(this.agentPerformance.entries()),
        taskQueue: this.taskQueue,
        completedTasks: this.completedTasks,
        failedTasks: this.failedTasks,
        communicationHistory: this.communicationHistory
      };
      await AsyncStorage.setItem('multi_agent_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving agent data:', error);
    }
  }

  // Health Check
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      agentCapabilities: this.agentCapabilities,
      agentTypes: Object.keys(this.agentTypes),
      systemMetrics: this.systemMetrics,
      activeAgents: this.activeAgents.size,
      taskQueueSize: this.taskQueue.length,
      completedTasks: this.completedTasks.length,
      failedTasks: this.failedTasks.length,
      loadBalancer: this.loadBalancer,
      consensusConfig: this.consensusConfig,
      learningConfig: this.learningConfig
    };
  }
}

export default new MultiAgentSystem();
