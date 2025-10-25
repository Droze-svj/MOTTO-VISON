import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { OPENROUTER_BASE_URL, OPENROUTER_MODEL, OPENROUTER_APP_NAME, OPENROUTER_API_KEY } from '../constants/config';

class AdvancedAIService {
  constructor() {
    this.models = {
      primary: 'deepseek/deepseek-chat',
      reasoning: 'deepseek/deepseek-reasoner',
      creative: 'anthropic/claude-3-haiku',
      coding: 'meta-llama/llama-3.1-8b-instruct',
      vision: 'openai/gpt-4o-mini'
    };
    
    this.conversationMemory = new Map();
    this.userProfiles = new Map();
    this.learningEngine = {
      patterns: new Map(),
      preferences: new Map(),
      adaptations: new Map()
    };
    
    this.realTimeFeatures = {
      streaming: true,
      contextWindow: 32768, // Increased context window
      maxTokens: 8000, // Increased token limit
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1,
      advancedFeatures: true,
      unlimitedMode: true
    };
    
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadUserProfiles();
      await this.loadLearningData();
      await this.initializeConversationMemory();
      this.startRealTimeLearning();
      this.isInitialized = true;
      console.log('Advanced AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Advanced AI Service:', error);
    }
  }

  // Advanced conversation management
  async processAdvancedConversation(message, context = {}) {
    try {
      await this.initialize();
      
      // Analyze user intent and context
      const analysis = await this.analyzeUserIntent(message, context);
      
      // Select optimal AI model based on analysis
      const selectedModel = await this.selectOptimalModel(analysis);
      
      // Generate enhanced context
      const enhancedContext = await this.buildEnhancedContext(message, analysis, context);
      
      // Process with selected model
      const response = await this.processWithModel(selectedModel, message, enhancedContext);
      
      // Apply real-time learning
      await this.applyLearning(message, response, analysis);
      
      // Update conversation memory
      await this.updateConversationMemory(message, response, analysis);
      
      return {
        response: response.content,
        model: selectedModel,
        analysis,
        confidence: response.confidence,
        suggestions: await this.generateSmartSuggestions(analysis),
        insights: await this.generateInsights(analysis),
        nextActions: await this.predictNextActions(analysis),
        plan: await this.generateActionPlan(message, analysis)
      };
    } catch (error) {
      console.error('Error in advanced conversation processing:', error);
      return this.getFallbackResponse(message);
    }
  }

  async generateActionPlan(message, analysis) {
    try {
      if (!(analysis.intent === 'reasoning' || analysis.intent === 'coding' || analysis.complexity === 'high')) return [];
      const prompt = `Analyze the user's request and produce a JSON plan with concise executable steps. Input: "${message}". Output JSON schema: {"steps": [{"action": string, "params": object, "label": string}]}. Keep 3-5 steps. Avoid extra text.`;
      const res = await this.processWithModel(this.models.reasoning, prompt, { analysis });
      const text = (res?.content || '').trim();
      try {
        const json = JSON.parse(text);
        const steps = Array.isArray(json?.steps) ? json.steps : [];
        return steps;
      } catch {
        // fallback to bullet parsing
        const flat = text.replace(/\n/g, ' ').trim();
        const steps = flat.split(/\s*\d+\.|\s*-\s+/).map(s => s.trim()).filter(Boolean).slice(0, 5)
          .map(s => ({ action: 'create_note', params: { content: s }, label: s }));
        return steps;
      }
    } catch (e) {
      return [];
    }
  }

  // Multi-model AI processing
  async processWithModel(model, message, context) {
    try {
      const modelConfig = this.getModelConfig(model);
      
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': OPENROUTER_APP_NAME,
          'X-Title': OPENROUTER_APP_NAME,
        },
        body: JSON.stringify({
          model: modelConfig.name,
          messages: this.buildModelMessages(message, context, modelConfig),
          max_tokens: modelConfig.maxTokens || this.realTimeFeatures.maxTokens,
          temperature: modelConfig.temperature || this.realTimeFeatures.temperature,
          top_p: modelConfig.topP || this.realTimeFeatures.topP,
          frequency_penalty: modelConfig.frequencyPenalty || this.realTimeFeatures.frequencyPenalty,
          presence_penalty: modelConfig.presencePenalty || this.realTimeFeatures.presencePenalty,
          stream: this.realTimeFeatures.streaming
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        confidence: this.calculateConfidence(data),
        model: model,
        tokens: data.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error(`Error processing with model ${model}:`, error);
      throw error;
    }
  }

  // Intelligent model selection
  async selectOptimalModel(analysis) {
    const { intent, complexity, domain, urgency } = analysis;
    
    // Reasoning tasks
    if (intent === 'reasoning' || complexity === 'high') {
      return this.models.reasoning;
    }
    
    // Creative tasks
    if (intent === 'creative' || domain === 'art' || domain === 'writing') {
      return this.models.creative;
    }
    
    // Coding tasks
    if (intent === 'coding' || domain === 'programming') {
      return this.models.coding;
    }
    
    // Vision tasks
    if (intent === 'vision' || domain === 'image') {
      return this.models.vision;
    }
    
    // Default to primary model
    return this.models.primary;
  }

  // Advanced intent analysis
  async analyzeUserIntent(message, context) {
    try {
      const analysis = {
        intent: this.classifyIntent(message),
        sentiment: this.analyzeSentiment(message),
        complexity: this.assessComplexity(message),
        domain: this.identifyDomain(message),
        urgency: this.assessUrgency(message, context),
        entities: await this.extractEntities(message),
        topics: this.extractTopics(message),
        emotions: this.analyzeEmotions(message),
        confidence: 0.9
      };
      
      // Apply learning patterns
      const learnedPatterns = this.learningEngine.patterns.get(analysis.intent) || {};
      analysis.confidence = this.calculateIntentConfidence(analysis, learnedPatterns);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing user intent:', error);
      return this.getDefaultAnalysis();
    }
  }

  // Real-time learning engine
  startRealTimeLearning() {
    setInterval(() => {
      this.updateLearningPatterns();
    }, 30000); // Update every 30 seconds
  }

  // Initialize conversation memory
  async initializeConversationMemory() {
    try {
      const savedMemory = await AsyncStorage.getItem('advanced_ai_memory');
      if (savedMemory) {
        const memoryData = JSON.parse(savedMemory);
        this.conversationMemory = new Map(Object.entries(memoryData));
      }
    } catch (error) {
      console.error('Error initializing conversation memory:', error);
    }
  }

  // Extract entities from message
  async extractEntities(message) {
    // Simple entity extraction (in production, use NLP libraries)
    const entities = [];
    const words = message.toLowerCase().split(' ');
    
    // Extract common entities
    const timeWords = ['now', 'today', 'tomorrow', 'yesterday', 'morning', 'evening'];
    const locationWords = ['home', 'office', 'gym', 'store', 'restaurant'];
    const actionWords = ['open', 'close', 'start', 'stop', 'create', 'delete'];
    
    words.forEach(word => {
      if (timeWords.includes(word)) entities.push({ type: 'time', value: word });
      if (locationWords.includes(word)) entities.push({ type: 'location', value: word });
      if (actionWords.includes(word)) entities.push({ type: 'action', value: word });
    });
    
    return entities;
  }

  // Extract topics from message
  extractTopics(message) {
    const topics = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('work') || lowerMessage.includes('job')) topics.push('work');
    if (lowerMessage.includes('health') || lowerMessage.includes('fitness')) topics.push('health');
    if (lowerMessage.includes('music') || lowerMessage.includes('song')) topics.push('entertainment');
    if (lowerMessage.includes('food') || lowerMessage.includes('eat')) topics.push('food');
    if (lowerMessage.includes('travel') || lowerMessage.includes('trip')) topics.push('travel');
    if (lowerMessage.includes('money') || lowerMessage.includes('finance')) topics.push('finance');
    
    return topics;
  }

  // Analyze emotions from message
  analyzeEmotions(message) {
    const emotions = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      emotions.push('happy');
    }
    if (lowerMessage.includes('sad') || lowerMessage.includes('bad') || lowerMessage.includes('terrible')) {
      emotions.push('sad');
    }
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
      emotions.push('angry');
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('thrilled') || lowerMessage.includes('amazing')) {
      emotions.push('excited');
    }
    
    return emotions.length > 0 ? emotions : ['neutral'];
  }

  // Calculate intent confidence
  calculateIntentConfidence(analysis, learnedPatterns) {
    let confidence = 0.9; // Base confidence
    
    // Adjust based on learned patterns
    if (learnedPatterns.count > 5) {
      confidence += 0.05; // Bonus for frequently used intents
    }
    
    // Adjust based on complexity
    if (analysis.complexity === 'high') {
      confidence -= 0.1; // Lower confidence for complex requests
    }
    
    return Math.min(1, Math.max(0, confidence));
  }

  // Calculate success rate
  calculateSuccessRate(analysis, response) {
    // Simple success rate calculation
    const hasResponse = response && response.content && response.content.length > 0;
    const hasConfidence = response && response.confidence > 0.7;
    
    return hasResponse && hasConfidence ? 0.95 : 0.7;
  }

  // Analyze user behavior
  analyzeUserBehavior(analysis) {
    return {
      preferredIntents: [analysis.intent],
      activeHours: new Date().getHours(),
      commonTopics: analysis.topics,
      averageComplexity: analysis.complexity,
      emotionalTrend: analysis.emotions[0] || 'neutral'
    };
  }

  // Calculate productivity score
  calculateProductivityScore(analysis) {
    let score = 50; // Base score
    
    // Increase for productive intents
    if (['task', 'work', 'create', 'organize'].includes(analysis.intent)) {
      score += 30;
    }
    
    // Increase for high urgency
    if (analysis.urgency === 'high') {
      score += 10;
    }
    
    // Decrease for entertainment intents
    if (['entertainment', 'game', 'fun'].includes(analysis.intent)) {
      score -= 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Calculate engagement score
  calculateEngagementScore(analysis) {
    let score = 70; // Base engagement
    
    // Higher engagement for interactive intents
    if (['question', 'creative', 'coding'].includes(analysis.intent)) {
      score += 20;
    }
    
    // Lower engagement for simple commands
    if (['command', 'simple'].includes(analysis.intent)) {
      score -= 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // Generate recommendations
  async generateRecommendations(analysis) {
    const recommendations = [];
    
    // Productivity recommendations
    if (analysis.intent === 'task') {
      recommendations.push('Consider breaking down complex tasks into smaller steps');
      recommendations.push('Set reminders for important deadlines');
    }
    
    // Learning recommendations
    if (analysis.complexity === 'high') {
      recommendations.push('Try asking for step-by-step explanations');
      recommendations.push('Use simpler language for better understanding');
    }
    
    // Health recommendations
    if (analysis.topics.includes('health')) {
      recommendations.push('Consider tracking your health metrics regularly');
      recommendations.push('Set up health-related reminders');
    }
    
    return recommendations.slice(0, 3);
  }

  // Update learning patterns
  updateLearningPatterns() {
    // Update pattern statistics
    this.learningEngine.patterns.forEach((pattern, intent) => {
      if (pattern.lastUsed) {
        const timeSinceLastUse = Date.now() - pattern.lastUsed;
        if (timeSinceLastUse > 24 * 60 * 60 * 1000) { // 24 hours
          pattern.successRate *= 0.95; // Slight decay for old patterns
        }
      }
    });
  }

  async applyLearning(message, response, analysis) {
    try {
      // Update user preferences
      const userPreferences = this.learningEngine.preferences.get(analysis.userId) || {};
      userPreferences.lastInteraction = {
        message,
        response,
        analysis,
        timestamp: Date.now()
      };
      this.learningEngine.preferences.set(analysis.userId, userPreferences);
      
      // Update learning patterns
      const intentPatterns = this.learningEngine.patterns.get(analysis.intent) || {};
      intentPatterns.count = (intentPatterns.count || 0) + 1;
      intentPatterns.lastUsed = Date.now();
      intentPatterns.successRate = this.calculateSuccessRate(analysis, response);
      this.learningEngine.patterns.set(analysis.intent, intentPatterns);
      
      // Save learning data
      await this.saveLearningData();
    } catch (error) {
      console.error('Error applying learning:', error);
    }
  }

  // Advanced context building
  async buildEnhancedContext(message, analysis, additionalContext) {
    const userProfile = await this.getUserProfile(analysis.userId);
    const conversationHistory = this.getConversationHistory(analysis.userId);
    const relevantMemories = await this.retrieveRelevantMemories(message, analysis);
    
    return {
      message,
      analysis,
      userProfile,
      conversationHistory: conversationHistory.slice(-5), // Last 5 interactions
      relevantMemories,
      currentTime: new Date().toISOString(),
      platform: Platform.OS,
      appVersion: '2.0.0',
      ...additionalContext
    };
  }

  // Smart suggestions generation
  async generateSmartSuggestions(analysis) {
    const suggestions = [];
    
    // Context-aware suggestions
    if (analysis.intent === 'question') {
      suggestions.push('Would you like me to search for more information?');
      suggestions.push('Should I save this for future reference?');
      suggestions.push('Would you like me to explain this in detail?');
    }
    
    if (analysis.intent === 'task') {
      suggestions.push('I can help you complete this task. Would you like me to break it down?');
      suggestions.push('Should I set a reminder for this task?');
      suggestions.push('Would you like me to create a checklist?');
    }
    
    if (analysis.sentiment === 'negative') {
      suggestions.push('I sense you might be frustrated. How can I better assist you?');
      suggestions.push('Would you like me to try a different approach?');
    }
    
    // Learning-based suggestions
    const userPatterns = this.learningEngine.patterns.get(analysis.intent);
    if (userPatterns && userPatterns.commonFollowUps) {
      suggestions.push(...userPatterns.commonFollowUps.slice(0, 2));
    }
    
    return suggestions.slice(0, 3);
  }

  // Predictive insights
  async generateInsights(analysis) {
    const insights = {
      userBehavior: this.analyzeUserBehavior(analysis),
      productivity: this.calculateProductivityScore(analysis),
      engagement: this.calculateEngagementScore(analysis),
      recommendations: await this.generateRecommendations(analysis)
    };
    
    return insights;
  }

  // Next action prediction
  async predictNextActions(analysis) {
    const predictions = [];
    
    // Based on current intent
    switch (analysis.intent) {
      case 'question':
        predictions.push('follow_up_question', 'search_more', 'save_to_notes');
        break;
      case 'task':
        predictions.push('create_reminder', 'set_deadline', 'break_down_task');
        break;
      case 'creative':
        predictions.push('expand_idea', 'save_inspiration', 'share_creation');
        break;
      default:
        predictions.push('continue_conversation', 'switch_topic', 'end_session');
    }
    
    // Based on user patterns
    const userPatterns = this.learningEngine.patterns.get(analysis.userId);
    if (userPatterns && userPatterns.nextActions) {
      predictions.push(...userPatterns.nextActions);
    }
    
    return [...new Set(predictions)].slice(0, 5);
  }

  // Advanced conversation memory
  async updateConversationMemory(message, response, analysis) {
    const memoryEntry = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, Date.now().toString()),
      message,
      response,
      analysis,
      timestamp: Date.now(),
      importance: this.calculateImportance(analysis),
      tags: this.generateTags(analysis)
    };
    
    const userId = analysis.userId || 'default';
    const userMemory = this.conversationMemory.get(userId) || [];
    userMemory.push(memoryEntry);
    
    // Keep only important memories (limit to 100)
    const importantMemories = userMemory
      .filter(memory => memory.importance > 0.5)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
    
    this.conversationMemory.set(userId, importantMemories);
    await this.saveConversationMemory();
  }

  // Memory retrieval with semantic search
  async retrieveRelevantMemories(message, analysis) {
    const userId = analysis.userId || 'default';
    const userMemory = this.conversationMemory.get(userId) || [];
    
    // Simple semantic similarity (in production, use embeddings)
    const relevantMemories = userMemory
      .filter(memory => {
        const similarity = this.calculateSemanticSimilarity(message, memory.message);
        return similarity > 0.7;
      })
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
    
    return relevantMemories;
  }

  // Utility methods
  classifyIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why')) {
      return 'question';
    }
    if (lowerMessage.includes('create') || lowerMessage.includes('make') || lowerMessage.includes('build')) {
      return 'creative';
    }
    if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('debug')) {
      return 'coding';
    }
    if (lowerMessage.includes('analyze') || lowerMessage.includes('think') || lowerMessage.includes('reason')) {
      return 'reasoning';
    }
    if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('photo')) {
      return 'vision';
    }
    
    return 'conversation';
  }

  analyzeSentiment(message) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'frustrated', 'angry'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  assessComplexity(message) {
    const wordCount = message.split(' ').length;
    const hasTechnicalTerms = /(algorithm|function|database|api|framework)/i.test(message);
    const hasCode = /[{}()\[\]]/.test(message);
    
    if (wordCount > 50 || hasTechnicalTerms || hasCode) return 'high';
    if (wordCount > 20) return 'medium';
    return 'low';
  }

  identifyDomain(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('code') || lowerMessage.includes('program')) return 'programming';
    if (lowerMessage.includes('art') || lowerMessage.includes('design')) return 'art';
    if (lowerMessage.includes('business') || lowerMessage.includes('finance')) return 'business';
    if (lowerMessage.includes('health') || lowerMessage.includes('medical')) return 'health';
    if (lowerMessage.includes('education') || lowerMessage.includes('learn')) return 'education';
    
    return 'general';
  }

  assessUrgency(message, context) {
    const urgentWords = ['urgent', 'asap', 'emergency', 'critical', 'immediately'];
    const lowerMessage = message.toLowerCase();
    
    if (urgentWords.some(word => lowerMessage.includes(word))) return 'high';
    if (context.timeSensitive) return 'medium';
    return 'low';
  }

  calculateConfidence(data) {
    // In a real implementation, this would use model confidence scores
    return 0.85 + Math.random() * 0.1;
  }

  calculateImportance(analysis) {
    let importance = 0.5;
    
    if (analysis.urgency === 'high') importance += 0.3;
    if (analysis.complexity === 'high') importance += 0.2;
    if (analysis.sentiment === 'negative') importance += 0.1;
    if (analysis.intent === 'coding' || analysis.intent === 'reasoning') importance += 0.2;
    
    return Math.min(importance, 1.0);
  }

  generateTags(analysis) {
    const tags = [analysis.intent, analysis.domain, analysis.sentiment];
    if (analysis.urgency === 'high') tags.push('urgent');
    if (analysis.complexity === 'high') tags.push('complex');
    return tags;
  }

  calculateSemanticSimilarity(text1, text2) {
    // Simple similarity calculation (in production, use embeddings)
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return intersection.length / union.length;
  }

  // Data persistence
  async saveConversationMemory() {
    try {
      const memoryData = Object.fromEntries(this.conversationMemory);
      await AsyncStorage.setItem('advanced_ai_memory', JSON.stringify(memoryData));
    } catch (error) {
      console.error('Error saving conversation memory:', error);
    }
  }

  async loadUserProfiles() {
    try {
      const profilesData = await AsyncStorage.getItem('advanced_ai_profiles');
      if (profilesData) {
        const profiles = JSON.parse(profilesData);
        this.userProfiles = new Map(Object.entries(profiles));
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }

  async saveLearningData() {
    try {
      const learningData = {
        patterns: Object.fromEntries(this.learningEngine.patterns),
        preferences: Object.fromEntries(this.learningEngine.preferences)
      };
      await AsyncStorage.setItem('advanced_ai_learning', JSON.stringify(learningData));
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  async loadLearningData() {
    try {
      const learningData = await AsyncStorage.getItem('advanced_ai_learning');
      if (learningData) {
        const data = JSON.parse(learningData);
        this.learningEngine.patterns = new Map(Object.entries(data.patterns || {}));
        this.learningEngine.preferences = new Map(Object.entries(data.preferences || {}));
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
  }

  // Model configuration
  getModelConfig(model) {
    const configs = {
      [this.models.primary]: {
        name: this.models.primary,
        maxTokens: 2000,
        temperature: 0.7,
        topP: 0.9
      },
      [this.models.reasoning]: {
        name: this.models.reasoning,
        maxTokens: 3000,
        temperature: 0.3,
        topP: 0.8
      },
      [this.models.creative]: {
        name: this.models.creative,
        maxTokens: 2500,
        temperature: 0.9,
        topP: 0.95
      },
      [this.models.coding]: {
        name: this.models.coding,
        maxTokens: 4000,
        temperature: 0.2,
        topP: 0.7
      },
      [this.models.vision]: {
        name: this.models.vision,
        maxTokens: 1500,
        temperature: 0.5,
        topP: 0.85
      }
    };
    
    return configs[model] || configs[this.models.primary];
  }

  buildModelMessages(message, context, modelConfig) {
    return [
      {
        role: 'system',
        content: this.buildSystemPrompt(context, modelConfig)
      },
      {
        role: 'user',
        content: message
      }
    ];
  }

  buildSystemPrompt(context, modelConfig) {
    return `You are MOTTO, an advanced AI assistant with the following capabilities:
- Multi-model intelligence for different types of tasks
- Real-time learning and adaptation
- Context-aware responses
- User preference learning

Current context: ${JSON.stringify(context)}
Model: ${modelConfig.name}

Provide helpful, accurate, and contextually relevant responses.`;
  }

  getFallbackResponse(message) {
    return {
      response: "I'm having trouble processing that right now. Could you try rephrasing your request?",
      model: this.models.primary,
      analysis: this.getDefaultAnalysis(),
      confidence: 0.5,
      suggestions: ['Try rephrasing your question', 'Check your internet connection', 'Try again in a moment'],
      insights: {},
      nextActions: ['retry', 'rephrase', 'switch_model']
    };
  }

  getDefaultAnalysis() {
    return {
      intent: 'conversation',
      sentiment: 'neutral',
      complexity: 'low',
      domain: 'general',
      urgency: 'low',
      entities: [],
      topics: [],
      emotions: [],
      confidence: 0.5
    };
  }

  // Getters for external access
  getUserProfile(userId) {
    return this.userProfiles.get(userId) || {};
  }

  getConversationHistory(userId) {
    return this.conversationMemory.get(userId) || [];
  }

  getLearningStats() {
    return {
      patterns: this.learningEngine.patterns.size,
      preferences: this.learningEngine.preferences.size,
      totalMemories: Array.from(this.conversationMemory.values()).flat().length
    };
  }
}

export default new AdvancedAIService();
