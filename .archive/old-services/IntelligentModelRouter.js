import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';

class IntelligentModelRouter {
  constructor() {
    this.models = {
      // Fast models for simple tasks
      fast: [
        { name: 'meta-llama/llama-3.1-8b-instruct', cost: 0.1, speed: 0.9, quality: 0.7 },
        { name: 'microsoft/phi-3.5-mini', cost: 0.05, speed: 0.95, quality: 0.6 },
        { name: 'google/gemma-2-9b-it', cost: 0.08, speed: 0.9, quality: 0.65 }
      ],
      // Balanced models for medium complexity
      balanced: [
        { name: 'deepseek/deepseek-chat', cost: 0.3, speed: 0.7, quality: 0.8 },
        { name: 'anthropic/claude-3-haiku', cost: 0.4, speed: 0.6, quality: 0.85 },
        { name: 'mistralai/mistral-7b-instruct', cost: 0.2, speed: 0.8, quality: 0.75 }
      ],
      // Premium models for complex tasks
      premium: [
        { name: 'anthropic/claude-3.5-sonnet', cost: 0.8, speed: 0.4, quality: 0.95 },
        { name: 'openai/gpt-4o', cost: 1.0, speed: 0.3, quality: 0.98 },
        { name: 'meta-llama/llama-3.3-70b-instruct', cost: 0.6, speed: 0.5, quality: 0.9 }
      ],
      // Specialized models
      specialized: {
        reasoning: 'deepseek/deepseek-reasoner',
        creative: 'anthropic/claude-3-haiku',
        coding: 'meta-llama/llama-3.1-8b-instruct',
        vision: 'openai/gpt-4o-mini'
      }
    };
    
    this.performanceMetrics = new Map();
    this.userPreferences = {};
    this.contextComplexity = 0;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load performance metrics from storage
      const stored = await AsyncStorage.getItem('model_performance_metrics');
      if (stored) {
        this.performanceMetrics = new Map(JSON.parse(stored));
      }
      
      // Load user preferences
      const prefs = await AsyncStorage.getItem('user_model_preferences');
      if (prefs) {
        this.userPreferences = JSON.parse(prefs);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing IntelligentModelRouter:', error);
    }
  }

  async selectOptimalModel(analysis, context = {}) {
    await this.initialize();
    
    const { intent, complexity, domain, urgency, questionType } = analysis;
    const { messageHistory = [], userContext = {} } = context;
    
    // Calculate context complexity
    this.contextComplexity = this.calculateContextComplexity(messageHistory, userContext);
    
    // Determine model category based on analysis
    let modelCategory = this.determineModelCategory(analysis);
    
    // Get available models for the category
    let availableModels = this.getAvailableModels(modelCategory);
    
    // Apply performance-based filtering
    availableModels = this.filterByPerformance(availableModels);
    
    // Apply user preferences
    availableModels = this.applyUserPreferences(availableModels);
    
    // Select optimal model
    const selectedModel = this.selectBestModel(availableModels, analysis, context);
    
    // Log selection for learning
    await this.logModelSelection(selectedModel, analysis, context);
    
    return selectedModel;
  }

  determineModelCategory(analysis) {
    const { intent, complexity, domain, urgency, questionType } = analysis;
    
    // Specialized routing for specific intents
    if (intent === 'coding' || domain === 'programming') return 'specialized.coding';
    if (intent === 'creative' || questionType === 'creative') return 'specialized.creative';
    if (intent === 'reasoning' || complexity === 'high') return 'specialized.reasoning';
    if (intent === 'vision' || domain === 'image') return 'specialized.vision';
    
    // Complexity-based routing
    if (complexity === 'high' || urgency === 'high') return 'premium';
    if (complexity === 'medium' || this.contextComplexity > 0.6) return 'balanced';
    return 'fast';
  }

  getAvailableModels(category) {
    if (category.includes('specialized')) {
      const [_, type] = category.split('.');
      return [{ name: this.models.specialized[type], cost: 0.5, speed: 0.7, quality: 0.8 }];
    }
    return this.models[category] || this.models.fast;
  }

  filterByPerformance(models) {
    return models.filter(model => {
      const metrics = this.performanceMetrics.get(model.name);
      if (!metrics) return true; // Include new models
      
      // Filter out models with poor performance
      const successRate = metrics.successCount / (metrics.successCount + metrics.errorCount);
      const avgLatency = metrics.totalLatency / metrics.requestCount;
      
      return successRate > 0.7 && avgLatency < 30000; // 30s max latency
    });
  }

  applyUserPreferences(models) {
    if (!this.userPreferences.preferSpeed) return models;
    
    // Sort by speed if user prefers speed
    return models.sort((a, b) => b.speed - a.speed);
  }

  selectBestModel(models, analysis, context) {
    if (models.length === 0) {
      return { name: 'meta-llama/llama-3.1-8b-instruct', cost: 0.1, speed: 0.9, quality: 0.7 };
    }
    
    // Calculate scores for each model
    const scoredModels = models.map(model => {
      const score = this.calculateModelScore(model, analysis, context);
      return { ...model, score };
    });
    
    // Sort by score and return best
    scoredModels.sort((a, b) => b.score - a.score);
    return scoredModels[0];
  }

  calculateModelScore(model, analysis, context) {
    const { complexity, urgency, domain } = analysis;
    const { cost, speed, quality } = model;
    
    let score = 0;
    
    // Base quality score
    score += quality * 40;
    
    // Speed preference based on urgency
    if (urgency === 'high') {
      score += speed * 30;
    } else {
      score += speed * 20;
    }
    
    // Cost consideration (lower is better)
    score += (1 - cost) * 20;
    
    // Complexity matching
    if (complexity === 'high' && quality > 0.8) score += 10;
    if (complexity === 'low' && speed > 0.8) score += 10;
    
    // Context complexity consideration
    if (this.contextComplexity > 0.7 && quality > 0.8) score += 10;
    
    // Performance history bonus
    const metrics = this.performanceMetrics.get(model.name);
    if (metrics) {
      const successRate = metrics.successCount / (metrics.successCount + metrics.errorCount);
      score += successRate * 10;
    }
    
    return score;
  }

  calculateContextComplexity(messageHistory, userContext) {
    let complexity = 0;
    
    // Message history complexity
    if (messageHistory.length > 10) complexity += 0.3;
    if (messageHistory.length > 20) complexity += 0.2;
    
    // User context complexity
    if (userContext.platform) complexity += 0.1;
    if (userContext.location) complexity += 0.1;
    if (userContext.preferences) complexity += 0.1;
    
    // Recent message analysis
    const recentMessages = messageHistory.slice(-5);
    const hasComplexTopics = recentMessages.some(msg => 
      msg.text && (msg.text.length > 200 || msg.text.includes('analyze') || msg.text.includes('explain'))
    );
    if (hasComplexTopics) complexity += 0.2;
    
    return Math.min(complexity, 1.0);
  }

  async logModelSelection(model, analysis, context) {
    try {
      const logData = {
        model: model.name,
        analysis,
        contextComplexity: this.contextComplexity,
        timestamp: Date.now()
      };
      
      await MetricsService.log('model_selection', logData);
    } catch (error) {
      console.error('Error logging model selection:', error);
    }
  }

  async updateModelPerformance(modelName, success, latency, tokens) {
    try {
      const metrics = this.performanceMetrics.get(modelName) || {
        requestCount: 0,
        successCount: 0,
        errorCount: 0,
        totalLatency: 0,
        totalTokens: 0
      };
      
      metrics.requestCount++;
      if (success) {
        metrics.successCount++;
        metrics.totalLatency += latency;
        metrics.totalTokens += tokens;
      } else {
        metrics.errorCount++;
      }
      
      this.performanceMetrics.set(modelName, metrics);
      
      // Persist to storage
      await AsyncStorage.setItem('model_performance_metrics', 
        JSON.stringify(Array.from(this.performanceMetrics.entries()))
      );
    } catch (error) {
      console.error('Error updating model performance:', error);
    }
  }

  async updateUserPreferences(preferences) {
    try {
      this.userPreferences = { ...this.userPreferences, ...preferences };
      await AsyncStorage.setItem('user_model_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  getModelRecommendations(analysis) {
    const category = this.determineModelCategory(analysis);
    const models = this.getAvailableModels(category);
    
    return models.map(model => ({
      name: model.name,
      reason: this.getModelReason(model, analysis),
      estimatedLatency: this.estimateLatency(model),
      cost: model.cost
    }));
  }

  getModelReason(model, analysis) {
    const { complexity, urgency } = analysis;
    
    if (model.quality > 0.9) return 'High quality for complex tasks';
    if (model.speed > 0.9) return 'Fast response for urgent requests';
    if (model.cost < 0.2) return 'Cost-effective for simple tasks';
    return 'Balanced performance and quality';
  }

  estimateLatency(model) {
    const metrics = this.performanceMetrics.get(model.name);
    if (metrics && metrics.successCount > 0) {
      return Math.round(metrics.totalLatency / metrics.successCount);
    }
    return Math.round(10000 / model.speed); // Rough estimate
  }
}

export default new IntelligentModelRouter();
