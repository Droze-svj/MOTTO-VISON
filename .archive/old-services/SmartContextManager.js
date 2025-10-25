import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import EventBus from './EventBus';
import ErrorManager from './ErrorManager';

class SmartContextManager {
  constructor() {
    this.isInitialized = false;
    
    // Context management strategies
    this.contextStrategies = {
      intelligentCompression: true,
      semanticClustering: true,
      relevanceScoring: true,
      adaptiveRetention: true,
      contextPrediction: true,
      memoryOptimization: true,
      crossSessionContext: true,
      personalizedContext: true
    };
    
    // Context storage and management
    this.contextStore = new Map();
    this.contextHistory = new Map();
    this.contextPatterns = new Map();
    this.userContextProfiles = new Map();
    
    // Context optimization
    this.contextOptimization = {
      compressionThreshold: 10000, // 10KB
      maxContextSize: 50000, // 50KB
      retentionPolicy: 'adaptive',
      compressionAlgorithm: 'semantic',
      relevanceThreshold: 0.7
    };
    
    // Performance metrics
    this.contextMetrics = {
      totalContexts: 0,
      compressedContexts: 0,
      averageContextSize: 0,
      compressionRatio: 0,
      retrievalTime: 0,
      relevanceAccuracy: 0,
      userSatisfaction: 0
    };
    
    // Learning system
    this.learningSystem = {
      contextPatterns: new Map(),
      userPreferences: new Map(),
      relevanceModels: new Map(),
      optimizationRules: new Map()
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadContextData();
      await this.initializeContextStrategies();
      await this.initializeOptimizationRules();
      await this.initializeLearningSystem();
      await this.setupEventListeners();
      this.isInitialized = true;
      
      console.log('Smart Context Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing Smart Context Manager:', error);
      await ErrorManager.handleError(error, { context: 'SmartContextManager.initialize' });
    }
  }

  async initializeContextStrategies() {
    // Initialize intelligent compression
    this.intelligentCompression = {
      enabled: true,
      algorithms: ['semantic', 'temporal', 'relevance'],
      compressionRatio: 0.7,
      qualityThreshold: 0.8
    };
    
    // Initialize semantic clustering
    this.semanticClustering = {
      enabled: true,
      clusterSize: 10,
      similarityThreshold: 0.8,
      maxClusters: 50
    };
    
    // Initialize relevance scoring
    this.relevanceScoring = {
      enabled: true,
      factors: ['recency', 'frequency', 'importance', 'user_interest'],
      weights: { recency: 0.3, frequency: 0.2, importance: 0.3, user_interest: 0.2 },
      threshold: 0.7
    };
  }

  async initializeOptimizationRules() {
    // Initialize context optimization rules
    this.optimizationRules = new Map();
    
    this.optimizationRules.set('compress_large_context', {
      condition: (context) => JSON.stringify(context).length > this.contextOptimization.compressionThreshold,
      action: 'compress',
      parameters: { algorithm: 'semantic', ratio: 0.7 }
    });
    
    this.optimizationRules.set('remove_irrelevant_context', {
      condition: (context) => this.calculateRelevanceScore(context) < this.contextOptimization.relevanceThreshold,
      action: 'remove',
      parameters: { threshold: 0.7 }
    });
    
    this.optimizationRules.set('cluster_similar_context', {
      condition: (context) => this.findSimilarContexts(context).length > 5,
      action: 'cluster',
      parameters: { maxClusters: 10 }
    });
  }

  async initializeLearningSystem() {
    // Initialize learning system for context optimization
    this.learningSystem = {
      contextPatterns: new Map(),
      userPreferences: new Map(),
      relevanceModels: new Map(),
      optimizationRules: new Map(),
      adaptiveLearning: true
    };
  }

  async buildSmartContext(message, baseContext = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      // 1. Analyze message and determine context requirements
      const contextAnalysis = await this.analyzeContextRequirements(message, baseContext);
      
      // 2. Retrieve relevant historical context
      const historicalContext = await this.retrieveRelevantContext(message, baseContext, contextAnalysis);
      
      // 3. Build enhanced context with intelligent compression
      const enhancedContext = await this.buildEnhancedContext(message, baseContext, historicalContext, contextAnalysis);
      
      // 4. Apply context optimization
      const optimizedContext = await this.optimizeContext(enhancedContext, contextAnalysis);
      
      // 5. Store context for future reference
      await this.storeContext(message, optimizedContext, contextAnalysis);
      
      // 6. Update metrics and learning
      await this.updateContextMetrics(optimizedContext, Date.now() - startTime);
      await this.learnFromContextUsage(message, optimizedContext, contextAnalysis);
      
      return optimizedContext;
    } catch (error) {
      console.error('Error building smart context:', error);
      await ErrorManager.handleError(error, { context: 'SmartContextManager.buildSmartContext' });
      return baseContext; // Fallback to base context
    }
  }

  async analyzeContextRequirements(message, baseContext) {
    const analysis = {
      type: 'general',
      complexity: 'medium',
      contextSize: 'normal',
      relevanceFactors: [],
      optimizationNeeded: false,
      compressionRequired: false,
      personalizationLevel: 'medium'
    };
    
    // Analyze message type and complexity
    const wordCount = message.split(' ').length;
    const questionCount = (message.match(/\?/g) || []).length;
    
    if (wordCount > 50 || questionCount > 2) {
      analysis.complexity = 'high';
      analysis.contextSize = 'large';
    } else if (wordCount < 10) {
      analysis.complexity = 'low';
      analysis.contextSize = 'small';
    }
    
    // Analyze context requirements
    if (message.toLowerCase().includes('remember') || message.toLowerCase().includes('previous')) {
      analysis.relevanceFactors.push('historical');
      analysis.personalizationLevel = 'high';
    }
    
    if (message.toLowerCase().includes('context') || message.toLowerCase().includes('background')) {
      analysis.relevanceFactors.push('background');
      analysis.contextSize = 'large';
    }
    
    // Determine optimization needs
    const contextSize = JSON.stringify(baseContext).length;
    if (contextSize > this.contextOptimization.compressionThreshold) {
      analysis.optimizationNeeded = true;
      analysis.compressionRequired = true;
    }
    
    return analysis;
  }

  async retrieveRelevantContext(message, baseContext, analysis) {
    const relevantContext = {
      historical: [],
      semantic: [],
      temporal: [],
      userSpecific: []
    };
    
    // Retrieve historical context based on relevance
    if (analysis.relevanceFactors.includes('historical')) {
      relevantContext.historical = await this.retrieveHistoricalContext(message, baseContext);
    }
    
    // Retrieve semantically similar context
    if (analysis.complexity === 'high') {
      relevantContext.semantic = await this.retrieveSemanticContext(message, baseContext);
    }
    
    // Retrieve temporal context (recent conversations)
    relevantContext.temporal = await this.retrieveTemporalContext(baseContext);
    
    // Retrieve user-specific context
    if (baseContext.userId) {
      relevantContext.userSpecific = await this.retrieveUserSpecificContext(baseContext.userId, message);
    }
    
    return relevantContext;
  }

  async retrieveHistoricalContext(message, baseContext) {
    const historicalContext = [];
    
    // Get context history for the user
    const userHistory = this.contextHistory.get(baseContext.userId || 'default') || [];
    
    // Find relevant historical contexts
    for (const context of userHistory) {
      const relevance = this.calculateContextRelevance(message, context);
      if (relevance > this.contextOptimization.relevanceThreshold) {
        historicalContext.push({
          ...context,
          relevance,
          timestamp: context.timestamp
        });
      }
    }
    
    // Sort by relevance and return top contexts
    return historicalContext
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  async retrieveSemanticContext(message, baseContext) {
    const semanticContext = [];
    
    // Find semantically similar contexts
    const similarContexts = this.findSimilarContexts({ message, ...baseContext });
    
    for (const context of similarContexts) {
      const similarity = this.calculateSemanticSimilarity(message, context.message);
      if (similarity > 0.7) {
        semanticContext.push({
          ...context,
          similarity,
          timestamp: context.timestamp
        });
      }
    }
    
    return semanticContext
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  async retrieveTemporalContext(baseContext) {
    const temporalContext = [];
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Get recent contexts (last hour)
    const recentContexts = Array.from(this.contextStore.values())
      .filter(context => now - context.timestamp < oneHour)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    return recentContexts;
  }

  async retrieveUserSpecificContext(userId, message) {
    const userProfile = this.userContextProfiles.get(userId);
    if (!userProfile) return [];
    
    const userSpecificContext = [];
    
    // Get user preferences and patterns
    if (userProfile.preferences) {
      userSpecificContext.push({
        type: 'preferences',
        data: userProfile.preferences,
        relevance: 0.9
      });
    }
    
    // Get user interaction patterns
    if (userProfile.patterns) {
      userSpecificContext.push({
        type: 'patterns',
        data: userProfile.patterns,
        relevance: 0.8
      });
    }
    
    return userSpecificContext;
  }

  async buildEnhancedContext(message, baseContext, relevantContext, analysis) {
    const enhancedContext = {
      ...baseContext,
      message,
      timestamp: Date.now(),
      analysis,
      relevantContext,
      metadata: {
        contextSize: 'normal',
        optimizationApplied: false,
        compressionRatio: 1.0
      }
    };
    
    // Add relevant historical context
    if (relevantContext.historical.length > 0) {
      enhancedContext.historical = relevantContext.historical;
    }
    
    // Add semantic context
    if (relevantContext.semantic.length > 0) {
      enhancedContext.semantic = relevantContext.semantic;
    }
    
    // Add temporal context
    if (relevantContext.temporal.length > 0) {
      enhancedContext.temporal = relevantContext.temporal;
    }
    
    // Add user-specific context
    if (relevantContext.userSpecific.length > 0) {
      enhancedContext.userSpecific = relevantContext.userSpecific;
    }
    
    return enhancedContext;
  }

  async optimizeContext(context, analysis) {
    let optimizedContext = { ...context };
    
    // Apply optimization rules
    for (const [ruleName, rule] of this.optimizationRules) {
      if (rule.condition(optimizedContext)) {
        optimizedContext = await this.applyOptimizationRule(optimizedContext, rule);
      }
    }
    
    // Apply intelligent compression if needed
    if (analysis.compressionRequired) {
      optimizedContext = await this.applyIntelligentCompression(optimizedContext, analysis);
    }
    
    // Apply relevance filtering
    optimizedContext = await this.applyRelevanceFiltering(optimizedContext, analysis);
    
    // Update metadata
    optimizedContext.metadata.optimizationApplied = true;
    optimizedContext.metadata.contextSize = this.calculateContextSize(optimizedContext);
    
    return optimizedContext;
  }

  async applyOptimizationRule(context, rule) {
    switch (rule.action) {
      case 'compress':
        return await this.compressContext(context, rule.parameters);
      case 'remove':
        return await this.removeIrrelevantContext(context, rule.parameters);
      case 'cluster':
        return await this.clusterSimilarContext(context, rule.parameters);
      default:
        return context;
    }
  }

  async applyIntelligentCompression(context, analysis) {
    const compressedContext = { ...context };
    
    // Compress large text fields
    if (compressedContext.message && compressedContext.message.length > 1000) {
      compressedContext.message = await this.compressText(compressedContext.message);
    }
    
    // Compress historical context
    if (compressedContext.historical) {
      compressedContext.historical = compressedContext.historical.map(ctx => ({
        ...ctx,
        message: ctx.message.length > 500 ? await this.compressText(ctx.message) : ctx.message
      }));
    }
    
    // Update compression metadata
    compressedContext.metadata.compressionRatio = 0.7;
    compressedContext.metadata.compressionApplied = true;
    
    return compressedContext;
  }

  async applyRelevanceFiltering(context, analysis) {
    const filteredContext = { ...context };
    
    // Filter historical context by relevance
    if (filteredContext.historical) {
      filteredContext.historical = filteredContext.historical.filter(
        ctx => ctx.relevance > this.contextOptimization.relevanceThreshold
      );
    }
    
    // Filter semantic context by similarity
    if (filteredContext.semantic) {
      filteredContext.semantic = filteredContext.semantic.filter(
        ctx => ctx.similarity > 0.7
      );
    }
    
    return filteredContext;
  }

  async compressText(text) {
    // Simple text compression (in real implementation, use actual compression)
    if (text.length <= 500) return text;
    
    // Keep first and last parts, compress middle
    const firstPart = text.substring(0, 200);
    const lastPart = text.substring(text.length - 200);
    const middlePart = text.substring(200, text.length - 200);
    
    return `${firstPart}...${middlePart.length > 100 ? '[compressed]' : middlePart}...${lastPart}`;
  }

  calculateContextRelevance(message, context) {
    // Calculate relevance between message and context
    let relevance = 0;
    
    // Check for keyword overlap
    const messageWords = message.toLowerCase().split(' ');
    const contextWords = context.message.toLowerCase().split(' ');
    const commonWords = messageWords.filter(word => contextWords.includes(word));
    
    relevance += (commonWords.length / messageWords.length) * 0.5;
    
    // Check for semantic similarity
    relevance += this.calculateSemanticSimilarity(message, context.message) * 0.3;
    
    // Check for temporal relevance
    const timeDiff = Date.now() - context.timestamp;
    const temporalRelevance = Math.max(0, 1 - (timeDiff / (24 * 60 * 60 * 1000))); // Decay over 24 hours
    relevance += temporalRelevance * 0.2;
    
    return Math.min(relevance, 1.0);
  }

  calculateSemanticSimilarity(text1, text2) {
    // Simple semantic similarity calculation
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  findSimilarContexts(context) {
    const similarContexts = [];
    
    for (const [key, storedContext] of this.contextStore) {
      const similarity = this.calculateSemanticSimilarity(context.message, storedContext.message);
      if (similarity > 0.5) {
        similarContexts.push({
          ...storedContext,
          similarity,
          key
        });
      }
    }
    
    return similarContexts.sort((a, b) => b.similarity - a.similarity);
  }

  calculateContextSize(context) {
    const size = JSON.stringify(context).length;
    if (size < 5000) return 'small';
    if (size < 20000) return 'medium';
    return 'large';
  }

  async storeContext(message, context, analysis) {
    const contextKey = this.generateContextKey(message, context);
    
    this.contextStore.set(contextKey, {
      ...context,
      key: contextKey,
      timestamp: Date.now()
    });
    
    // Store in user history
    const userId = context.userId || 'default';
    const userHistory = this.contextHistory.get(userId) || [];
    userHistory.push(context);
    
    // Keep only last 100 contexts per user
    if (userHistory.length > 100) {
      userHistory.splice(0, userHistory.length - 100);
    }
    
    this.contextHistory.set(userId, userHistory);
    
    // Update metrics
    this.contextMetrics.totalContexts++;
  }

  generateContextKey(message, context) {
    const key = `${message.slice(0, 50)}_${context.userId || 'default'}_${Date.now()}`;
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  async updateContextMetrics(context, processingTime) {
    this.contextMetrics.averageContextSize = 
      (this.contextMetrics.averageContextSize + JSON.stringify(context).length) / 2;
    
    this.contextMetrics.retrievalTime = 
      (this.contextMetrics.retrievalTime + processingTime) / 2;
    
    if (context.metadata?.compressionApplied) {
      this.contextMetrics.compressedContexts++;
    }
  }

  async learnFromContextUsage(message, context, analysis) {
    // Learn from context usage patterns
    const learningData = {
      message,
      context,
      analysis,
      timestamp: Date.now()
    };
    
    // Update context patterns
    const patternKey = `${analysis.type}_${analysis.complexity}`;
    const pattern = this.learningSystem.contextPatterns.get(patternKey) || {
      count: 0,
      averageSize: 0,
      optimizationRate: 0
    };
    
    pattern.count++;
    pattern.averageSize = (pattern.averageSize + JSON.stringify(context).length) / 2;
    if (context.metadata?.optimizationApplied) {
      pattern.optimizationRate = (pattern.optimizationRate + 1) / 2;
    }
    
    this.learningSystem.contextPatterns.set(patternKey, pattern);
  }

  async setupEventListeners() {
    await EventBus.on('context_used', async (event) => {
      await this.processContextUsage(event.data);
    });
    
    await EventBus.on('user_feedback', async (event) => {
      await this.processUserFeedback(event.data);
    });
  }

  async processContextUsage(data) {
    // Process context usage for learning
    const { context, usage, satisfaction } = data;
    
    // Update user preferences based on usage
    if (data.userId) {
      const userProfile = this.userContextProfiles.get(data.userId) || {};
      userProfile.usage = userProfile.usage || [];
      userProfile.usage.push({ context, usage, satisfaction, timestamp: Date.now() });
      this.userContextProfiles.set(data.userId, userProfile);
    }
  }

  async processUserFeedback(data) {
    // Process user feedback for context optimization
    const { contextId, rating, feedback } = data;
    
    // Update context quality based on feedback
    if (rating < 3) {
      // Low rating, analyze for improvement
      await this.analyzeContextQuality(contextId, feedback);
    }
  }

  async analyzeContextQuality(contextId, feedback) {
    // Analyze context quality issues
    const context = this.contextStore.get(contextId);
    if (context) {
      // Update optimization rules based on feedback
      await this.updateOptimizationRules(context, feedback);
    }
  }

  async updateOptimizationRules(context, feedback) {
    // Update optimization rules based on feedback
    const ruleKey = `feedback_${feedback.type}`;
    const rule = this.optimizationRules.get(ruleKey) || {
      condition: () => false,
      action: 'none',
      parameters: {}
    };
    
    // Modify rule based on feedback
    if (feedback.type === 'irrelevant') {
      rule.condition = (ctx) => this.calculateRelevanceScore(ctx) < 0.5;
      rule.action = 'remove';
    }
    
    this.optimizationRules.set(ruleKey, rule);
  }

  calculateRelevanceScore(context) {
    // Calculate overall relevance score for context
    let score = 0.5; // Base score
    
    if (context.historical && context.historical.length > 0) {
      score += 0.2;
    }
    
    if (context.semantic && context.semantic.length > 0) {
      score += 0.2;
    }
    
    if (context.userSpecific && context.userSpecific.length > 0) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  async loadContextData() {
    try {
      const stored = await AsyncStorage.getItem('smart_context_manager_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.contextStore = new Map(data.contextStore || []);
        this.contextHistory = new Map(data.contextHistory || []);
        this.contextPatterns = new Map(data.contextPatterns || []);
        this.userContextProfiles = new Map(data.userContextProfiles || []);
        this.contextMetrics = data.contextMetrics || this.contextMetrics;
        this.learningSystem = data.learningSystem || this.learningSystem;
      }
    } catch (error) {
      console.error('Error loading context data:', error);
    }
  }

  async saveContextData() {
    try {
      const data = {
        contextStore: Array.from(this.contextStore.entries()),
        contextHistory: Array.from(this.contextHistory.entries()),
        contextPatterns: Array.from(this.contextPatterns.entries()),
        userContextProfiles: Array.from(this.userContextProfiles.entries()),
        contextMetrics: this.contextMetrics,
        learningSystem: this.learningSystem
      };
      await AsyncStorage.setItem('smart_context_manager_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving context data:', error);
    }
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      contextStrategies: this.contextStrategies,
      contextOptimization: this.contextOptimization,
      contextMetrics: this.contextMetrics,
      contextStore: this.contextStore.size,
      contextHistory: this.contextHistory.size,
      contextPatterns: this.contextPatterns.size,
      userContextProfiles: this.userContextProfiles.size,
      learningSystem: {
        contextPatterns: this.learningSystem.contextPatterns.size,
        userPreferences: this.learningSystem.userPreferences.size,
        relevanceModels: this.learningSystem.relevanceModels.size,
        optimizationRules: this.learningSystem.optimizationRules.size
      }
    };
  }
}

export default new SmartContextManager();
