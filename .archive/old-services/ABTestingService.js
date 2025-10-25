import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import EventBus from './EventBus';
import ErrorManager from './ErrorManager';

class ABTestingService {
  constructor() {
    this.isInitialized = false;
    
    // A/B testing strategies
    this.testingStrategies = {
      responseGeneration: true,
      userInterface: true,
      algorithmSelection: true,
      parameterOptimization: true,
      featureRollout: true,
      performanceOptimization: true,
      userExperience: true,
      conversionOptimization: true
    };
    
    // Test types and configurations
    this.testTypes = {
      response_strategy: {
        name: 'Response Generation Strategy',
        variants: ['standard', 'enhanced', 'optimized'],
        metrics: ['response_time', 'user_satisfaction', 'task_completion'],
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        minSampleSize: 100
      },
      ui_design: {
        name: 'User Interface Design',
        variants: ['current', 'modern', 'minimal'],
        metrics: ['engagement', 'usability', 'satisfaction'],
        duration: 14 * 24 * 60 * 60 * 1000, // 14 days
        minSampleSize: 200
      },
      algorithm_selection: {
        name: 'Algorithm Selection',
        variants: ['algorithm_a', 'algorithm_b', 'algorithm_c'],
        metrics: ['accuracy', 'performance', 'efficiency'],
        duration: 10 * 24 * 60 * 60 * 1000, // 10 days
        minSampleSize: 150
      },
      parameter_tuning: {
        name: 'Parameter Tuning',
        variants: ['conservative', 'balanced', 'aggressive'],
        metrics: ['response_quality', 'resource_usage', 'stability'],
        duration: 5 * 24 * 60 * 60 * 1000, // 5 days
        minSampleSize: 100
      }
    };
    
    // Active tests and management
    this.activeTests = new Map();
    this.testResults = new Map();
    this.testParticipants = new Map();
    this.testMetrics = new Map();
    
    // Test configuration
    this.testConfiguration = {
      defaultTrafficSplit: 0.5, // 50/50 split
      minStatisticalSignificance: 0.95,
      maxTestDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      minSampleSize: 100,
      maxConcurrentTests: 10
    };
    
    // Performance metrics
    this.testingMetrics = {
      totalTests: 0,
      activeTests: 0,
      completedTests: 0,
      successfulTests: 0,
      averageTestDuration: 0,
      statisticalSignificance: 0,
      conversionRate: 0,
      improvementRate: 0
    };
    
    // Learning and optimization
    this.learningSystem = {
      testPatterns: new Map(),
      successFactors: new Map(),
      optimizationRules: new Map(),
      predictiveModels: new Map()
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadTestingData();
      await this.initializeTestingStrategies();
      await this.initializeTestTypes();
      await this.startTestMonitoring();
      await this.setupEventListeners();
      this.isInitialized = true;
      
      console.log('A/B Testing Service initialized successfully');
    } catch (error) {
      console.error('Error initializing A/B Testing Service:', error);
      await ErrorManager.handleError(error, { context: 'ABTestingService.initialize' });
    }
  }

  async initializeTestingStrategies() {
    // Initialize response generation testing
    this.responseGenerationTesting = {
      enabled: true,
      strategies: ['standard', 'enhanced', 'optimized'],
      metrics: ['response_time', 'quality', 'satisfaction'],
      trafficSplit: 0.33 // Equal split between 3 variants
    };
    
    // Initialize user interface testing
    this.userInterfaceTesting = {
      enabled: true,
      variants: ['current', 'modern', 'minimal'],
      metrics: ['engagement', 'usability', 'conversion'],
      trafficSplit: 0.33
    };
    
    // Initialize algorithm selection testing
    this.algorithmSelectionTesting = {
      enabled: true,
      algorithms: ['algorithm_a', 'algorithm_b', 'algorithm_c'],
      metrics: ['accuracy', 'performance', 'efficiency'],
      trafficSplit: 0.33
    };
  }

  async initializeTestTypes() {
    // Initialize test types with default configurations
    for (const [testType, config] of Object.entries(this.testTypes)) {
      this.testTypes[testType] = {
        ...config,
        status: 'inactive',
        startTime: null,
        endTime: null,
        participants: 0,
        results: null
      };
    }
  }

  async startTestMonitoring() {
    // Monitor active tests every hour
    setInterval(async () => {
      await this.monitorActiveTests();
    }, 3600000);
    
    // Process test results every 6 hours
    setInterval(async () => {
      await this.processTestResults();
    }, 21600000);
  }

  async createTest(testConfig) {
    const testId = this.generateTestId();
    
    try {
      // 1. Validate test configuration
      const validatedConfig = await this.validateTestConfig(testConfig);
      
      // 2. Create test instance
      const test = await this.createTestInstance(testId, validatedConfig);
      
      // 3. Initialize test metrics
      await this.initializeTestMetrics(testId, validatedConfig);
      
      // 4. Start test
      await this.startTest(testId, test);
      
      // 5. Store test
      this.activeTests.set(testId, test);
      
      // 6. Emit test creation event
      await EventBus.emit('test_created', {
        testId,
        test,
        timestamp: Date.now()
      });
      
      return {
        testId,
        status: 'created',
        test,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error creating test:', error);
      await ErrorManager.handleError(error, { context: 'ABTestingService.createTest' });
      throw error;
    }
  }

  async validateTestConfig(testConfig) {
    const validatedConfig = {
      ...testConfig,
      id: this.generateTestId(),
      status: 'pending',
      startTime: null,
      endTime: null,
      participants: 0,
      results: null
    };
    
    // Validate required fields
    if (!validatedConfig.name) {
      throw new Error('Test name is required');
    }
    
    if (!validatedConfig.variants || validatedConfig.variants.length < 2) {
      throw new Error('At least 2 variants are required');
    }
    
    if (!validatedConfig.metrics || validatedConfig.metrics.length === 0) {
      throw new Error('At least 1 metric is required');
    }
    
    // Set default values
    validatedConfig.trafficSplit = validatedConfig.trafficSplit || 0.5;
    validatedConfig.duration = validatedConfig.duration || 7 * 24 * 60 * 60 * 1000;
    validatedConfig.minSampleSize = validatedConfig.minSampleSize || 100;
    validatedConfig.significanceLevel = validatedConfig.significanceLevel || 0.95;
    
    return validatedConfig;
  }

  async createTestInstance(testId, config) {
    const test = {
      id: testId,
      name: config.name,
      type: config.type,
      variants: config.variants,
      metrics: config.metrics,
      trafficSplit: config.trafficSplit,
      duration: config.duration,
      minSampleSize: config.minSampleSize,
      significanceLevel: config.significanceLevel,
      status: 'active',
      startTime: Date.now(),
      endTime: Date.now() + config.duration,
      participants: 0,
      results: null,
      metadata: {
        createdBy: config.createdBy || 'system',
        description: config.description || '',
        hypothesis: config.hypothesis || '',
        expectedOutcome: config.expectedOutcome || ''
      }
    };
    
    return test;
  }

  async initializeTestMetrics(testId, config) {
    const metrics = {
      testId,
      variants: {},
      overall: {
        totalParticipants: 0,
        totalEvents: 0,
        startTime: Date.now(),
        lastUpdate: Date.now()
      }
    };
    
    // Initialize metrics for each variant
    for (const variant of config.variants) {
      metrics.variants[variant] = {
        participants: 0,
        events: 0,
        metrics: {}
      };
      
      // Initialize specific metrics
      for (const metric of config.metrics) {
        metrics.variants[variant].metrics[metric] = {
          values: [],
          average: 0,
          median: 0,
          standardDeviation: 0,
          count: 0
        };
      }
    }
    
    this.testMetrics.set(testId, metrics);
  }

  async startTest(testId, test) {
    // Update test status
    test.status = 'active';
    test.startTime = Date.now();
    
    // Update testing metrics
    this.testingMetrics.totalTests++;
    this.testingMetrics.activeTests++;
    
    // Emit test start event
    await EventBus.emit('test_started', {
      testId,
      test,
      timestamp: Date.now()
    });
  }

  async assignUserToTest(userId, testId, context = {}) {
    try {
      const test = this.activeTests.get(testId);
      if (!test) {
        throw new Error(`Test ${testId} not found`);
      }
      
      // Check if user is already assigned
      const existingAssignment = this.testParticipants.get(`${userId}_${testId}`);
      if (existingAssignment) {
        return existingAssignment;
      }
      
      // Assign user to variant
      const variant = await this.assignVariant(userId, test);
      
      // Create participant record
      const participant = {
        userId,
        testId,
        variant,
        assignedAt: Date.now(),
        context,
        events: [],
        metrics: {}
      };
      
      // Store participant
      this.testParticipants.set(`${userId}_${testId}`, participant);
      
      // Update test metrics
      await this.updateTestMetrics(testId, variant, 'participant_added');
      
      // Emit assignment event
      await EventBus.emit('user_assigned_to_test', {
        userId,
        testId,
        variant,
        timestamp: Date.now()
      });
      
      return participant;
    } catch (error) {
      console.error('Error assigning user to test:', error);
      await ErrorManager.handleError(error, { context: 'ABTestingService.assignUserToTest' });
      throw error;
    }
  }

  async assignVariant(userId, test) {
    // Use consistent hashing to ensure same user gets same variant
    const hash = this.hashUserId(userId);
    const variantIndex = hash % test.variants.length;
    return test.variants[variantIndex];
  }

  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async recordTestEvent(userId, testId, event) {
    try {
      const participant = this.testParticipants.get(`${userId}_${testId}`);
      if (!participant) {
        throw new Error(`User ${userId} not assigned to test ${testId}`);
      }
      
      // Record event
      participant.events.push({
        ...event,
        timestamp: Date.now()
      });
      
      // Update test metrics
      await this.updateTestMetrics(testId, participant.variant, 'event_recorded', event);
      
      // Emit event recording event
      await EventBus.emit('test_event_recorded', {
        userId,
        testId,
        variant: participant.variant,
        event,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Error recording test event:', error);
      await ErrorManager.handleError(error, { context: 'ABTestingService.recordTestEvent' });
      return false;
    }
  }

  async updateTestMetrics(testId, variant, action, data = null) {
    const metrics = this.testMetrics.get(testId);
    if (!metrics) return;
    
    // Update overall metrics
    if (action === 'participant_added') {
      metrics.overall.totalParticipants++;
    } else if (action === 'event_recorded') {
      metrics.overall.totalEvents++;
    }
    
    // Update variant metrics
    if (metrics.variants[variant]) {
      if (action === 'participant_added') {
        metrics.variants[variant].participants++;
      } else if (action === 'event_recorded') {
        metrics.variants[variant].events++;
        
        // Update specific metrics
        if (data && data.metric && data.value !== undefined) {
          const metricData = metrics.variants[variant].metrics[data.metric];
          if (metricData) {
            metricData.values.push(data.value);
            metricData.count++;
            metricData.average = metricData.values.reduce((a, b) => a + b, 0) / metricData.values.length;
            metricData.median = this.calculateMedian(metricData.values);
            metricData.standardDeviation = this.calculateStandardDeviation(metricData.values);
          }
        }
      }
    }
    
    metrics.overall.lastUpdate = Date.now();
  }

  calculateMedian(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  async monitorActiveTests() {
    for (const [testId, test] of this.activeTests) {
      try {
        // Check if test should end
        if (Date.now() >= test.endTime) {
          await this.endTest(testId);
          continue;
        }
        
        // Check if test has enough participants
        const metrics = this.testMetrics.get(testId);
        if (metrics && metrics.overall.totalParticipants >= test.minSampleSize) {
          // Check for early statistical significance
          const significance = await this.calculateStatisticalSignificance(testId);
          if (significance >= test.significanceLevel) {
            await this.endTest(testId);
            continue;
          }
        }
        
        // Update test status
        await this.updateTestStatus(testId, test);
      } catch (error) {
        console.error(`Error monitoring test ${testId}:`, error);
      }
    }
  }

  async endTest(testId) {
    try {
      const test = this.activeTests.get(testId);
      if (!test) return;
      
      // Calculate final results
      const results = await this.calculateTestResults(testId);
      
      // Update test
      test.status = 'completed';
      test.endTime = Date.now();
      test.results = results;
      
      // Move to completed tests
      this.activeTests.delete(testId);
      this.testResults.set(testId, test);
      
      // Update testing metrics
      this.testingMetrics.activeTests--;
      this.testingMetrics.completedTests++;
      
      if (results.winner) {
        this.testingMetrics.successfulTests++;
      }
      
      // Emit test completion event
      await EventBus.emit('test_completed', {
        testId,
        test,
        results,
        timestamp: Date.now()
      });
      
      // Learn from test results
      await this.learnFromTestResults(testId, results);
      
    } catch (error) {
      console.error(`Error ending test ${testId}:`, error);
    }
  }

  async calculateTestResults(testId) {
    const test = this.activeTests.get(testId) || this.testResults.get(testId);
    const metrics = this.testMetrics.get(testId);
    
    if (!test || !metrics) {
      throw new Error(`Test ${testId} not found`);
    }
    
    const results = {
      testId,
      testName: test.name,
      startTime: test.startTime,
      endTime: test.endTime,
      duration: test.endTime - test.startTime,
      totalParticipants: metrics.overall.totalParticipants,
      totalEvents: metrics.overall.totalEvents,
      variants: {},
      winner: null,
      statisticalSignificance: 0,
      confidence: 0,
      recommendations: []
    };
    
    // Calculate results for each variant
    for (const [variantName, variantMetrics] of Object.entries(metrics.variants)) {
      results.variants[variantName] = {
        participants: variantMetrics.participants,
        events: variantMetrics.events,
        metrics: {}
      };
      
      // Calculate metric results
      for (const [metricName, metricData] of Object.entries(variantMetrics.metrics)) {
        results.variants[variantName].metrics[metricName] = {
          average: metricData.average,
          median: metricData.median,
          standardDeviation: metricData.standardDeviation,
          count: metricData.count,
          values: metricData.values
        };
      }
    }
    
    // Determine winner
    results.winner = await this.determineWinner(results);
    
    // Calculate statistical significance
    results.statisticalSignificance = await this.calculateStatisticalSignificance(testId);
    
    // Calculate confidence
    results.confidence = await this.calculateConfidence(results);
    
    // Generate recommendations
    results.recommendations = await this.generateRecommendations(results);
    
    return results;
  }

  async determineWinner(results) {
    const variants = Object.keys(results.variants);
    if (variants.length < 2) return null;
    
    // Simple winner determination based on primary metric
    const primaryMetric = 'user_satisfaction'; // Default primary metric
    let bestVariant = null;
    let bestScore = -1;
    
    for (const variantName of variants) {
      const variant = results.variants[variantName];
      const metric = variant.metrics[primaryMetric];
      
      if (metric && metric.average > bestScore) {
        bestScore = metric.average;
        bestVariant = variantName;
      }
    }
    
    return bestVariant;
  }

  async calculateStatisticalSignificance(testId) {
    const metrics = this.testMetrics.get(testId);
    if (!metrics) return 0;
    
    const variants = Object.keys(metrics.variants);
    if (variants.length < 2) return 0;
    
    // Simple statistical significance calculation
    // In real implementation, use proper statistical tests (t-test, chi-square, etc.)
    const variant1 = variants[0];
    const variant2 = variants[1];
    
    const metric1 = metrics.variants[variant1].metrics.user_satisfaction;
    const metric2 = metrics.variants[variant2].metrics.user_satisfaction;
    
    if (!metric1 || !metric2 || metric1.count < 30 || metric2.count < 30) {
      return 0;
    }
    
    // Calculate t-test statistic (simplified)
    const diff = Math.abs(metric1.average - metric2.average);
    const pooledStd = Math.sqrt((metric1.standardDeviation + metric2.standardDeviation) / 2);
    const tStatistic = diff / pooledStd;
    
    // Convert to significance level (simplified)
    return Math.min(tStatistic / 2, 1.0);
  }

  async calculateConfidence(results) {
    // Calculate confidence based on sample size and statistical significance
    const baseConfidence = results.statisticalSignificance;
    const sampleSizeFactor = Math.min(results.totalParticipants / 1000, 1.0);
    
    return baseConfidence * sampleSizeFactor;
  }

  async generateRecommendations(results) {
    const recommendations = [];
    
    if (results.winner) {
      recommendations.push({
        type: 'implement_winner',
        priority: 'high',
        action: `Implement ${results.winner} variant as the new default`,
        impact: 'high',
        confidence: results.confidence
      });
    }
    
    if (results.statisticalSignificance < 0.95) {
      recommendations.push({
        type: 'extend_test',
        priority: 'medium',
        action: 'Extend test duration to achieve statistical significance',
        impact: 'medium',
        confidence: 0.8
      });
    }
    
    if (results.totalParticipants < 100) {
      recommendations.push({
        type: 'increase_sample_size',
        priority: 'medium',
        action: 'Increase sample size for more reliable results',
        impact: 'medium',
        confidence: 0.9
      });
    }
    
    return recommendations;
  }

  async learnFromTestResults(testId, results) {
    // Learn from test results for future optimization
    const learningData = {
      testId,
      results,
      timestamp: Date.now()
    };
    
    // Update test patterns
    const patternKey = `${results.testName}_${results.winner}`;
    const pattern = this.learningSystem.testPatterns.get(patternKey) || {
      count: 0,
      successRate: 0,
      averageImprovement: 0
    };
    
    pattern.count++;
    if (results.winner) {
      pattern.successRate = (pattern.successRate + 1) / 2;
    }
    
    this.learningSystem.testPatterns.set(patternKey, pattern);
  }

  async processTestResults() {
    // Process completed test results
    for (const [testId, test] of this.testResults) {
      if (test.status === 'completed' && !test.processed) {
        await this.processCompletedTest(testId, test);
        test.processed = true;
      }
    }
  }

  async processCompletedTest(testId, test) {
    // Process completed test for insights and optimization
    const insights = await this.generateTestInsights(test);
    const optimizations = await this.generateOptimizations(test);
    
    // Emit test processing event
    await EventBus.emit('test_processed', {
      testId,
      test,
      insights,
      optimizations,
      timestamp: Date.now()
    });
  }

  async generateTestInsights(test) {
    const insights = [];
    
    if (test.results && test.results.winner) {
      insights.push({
        type: 'winner_identified',
        message: `Test ${test.name} identified ${test.results.winner} as the winning variant`,
        impact: 'high',
        confidence: test.results.confidence
      });
    }
    
    if (test.results && test.results.statisticalSignificance > 0.95) {
      insights.push({
        type: 'statistical_significance',
        message: `Test ${test.name} achieved statistical significance`,
        impact: 'high',
        confidence: test.results.statisticalSignificance
      });
    }
    
    return insights;
  }

  async generateOptimizations(test) {
    const optimizations = [];
    
    if (test.results && test.results.winner) {
      optimizations.push({
        type: 'implement_winner',
        testId: test.id,
        variant: test.results.winner,
        action: 'Implement winning variant',
        priority: 'high',
        impact: 'high'
      });
    }
    
    return optimizations;
  }

  generateTestId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async setupEventListeners() {
    await EventBus.on('user_interaction', async (event) => {
      await this.handleUserInteraction(event.data);
    });
    
    await EventBus.on('ai_response_generated', async (event) => {
      await this.handleAIResponse(event.data);
    });
  }

  async handleUserInteraction(data) {
    // Handle user interactions for A/B testing
    if (data.userId && data.testId) {
      await this.recordTestEvent(data.userId, data.testId, {
        type: 'user_interaction',
        metric: 'engagement',
        value: 1,
        data: data
      });
    }
  }

  async handleAIResponse(data) {
    // Handle AI responses for A/B testing
    if (data.userId && data.testId) {
      await this.recordTestEvent(data.userId, data.testId, {
        type: 'ai_response',
        metric: 'response_quality',
        value: data.quality || 0.8,
        data: data
      });
    }
  }

  async loadTestingData() {
    try {
      const stored = await AsyncStorage.getItem('ab_testing_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.activeTests = new Map(data.activeTests || []);
        this.testResults = new Map(data.testResults || []);
        this.testParticipants = new Map(data.testParticipants || []);
        this.testMetrics = new Map(data.testMetrics || []);
        this.testingMetrics = data.testingMetrics || this.testingMetrics;
        this.learningSystem = data.learningSystem || this.learningSystem;
      }
    } catch (error) {
      console.error('Error loading testing data:', error);
    }
  }

  async saveTestingData() {
    try {
      const data = {
        activeTests: Array.from(this.activeTests.entries()),
        testResults: Array.from(this.testResults.entries()),
        testParticipants: Array.from(this.testParticipants.entries()),
        testMetrics: Array.from(this.testMetrics.entries()),
        testingMetrics: this.testingMetrics,
        learningSystem: this.learningSystem
      };
      await AsyncStorage.setItem('ab_testing_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving testing data:', error);
    }
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      testingStrategies: this.testingStrategies,
      testTypes: this.testTypes,
      testConfiguration: this.testConfiguration,
      testingMetrics: this.testingMetrics,
      activeTests: this.activeTests.size,
      testResults: this.testResults.size,
      testParticipants: this.testParticipants.size,
      testMetrics: this.testMetrics.size,
      learningSystem: {
        testPatterns: this.learningSystem.testPatterns.size,
        successFactors: this.learningSystem.successFactors.size,
        optimizationRules: this.learningSystem.optimizationRules.size,
        predictiveModels: this.learningSystem.predictiveModels.size
      }
    };
  }
}

export default new ABTestingService();
