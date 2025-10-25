import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';

class LearningAdaptationService {
  constructor() {
    this.userBehaviorPatterns = new Map();
    this.adaptationRules = new Map();
    this.learningMetrics = new Map();
    this.userPreferences = {};
    this.conversationHistory = [];
    this.isInitialized = false;
    
    // Learning parameters
    this.learningRate = 0.1;
    this.memoryDecay = 0.95;
    this.minSamplesForLearning = 5;
    this.maxHistorySize = 1000;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load stored data
      await this.loadUserBehaviorData();
      await this.loadAdaptationRules();
      await this.loadLearningMetrics();
      await this.loadUserPreferences();
      await this.loadConversationHistory();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing LearningAdaptationService:', error);
    }
  }

  async learnFromInteraction(interaction) {
    await this.initialize();
    
    const {
      userMessage,
      aiResponse,
      userFeedback,
      responseTime,
      modelUsed,
      context,
      timestamp = Date.now()
    } = interaction;

    // Extract behavior patterns
    const patterns = this.extractBehaviorPatterns(interaction);
    
    // Update user behavior patterns
    this.updateBehaviorPatterns(patterns);
    
    // Analyze response effectiveness
    const effectiveness = this.analyzeResponseEffectiveness(interaction);
    
    // Update learning metrics
    this.updateLearningMetrics(patterns, effectiveness);
    
    // Generate adaptation rules
    await this.generateAdaptationRules(patterns, effectiveness);
    
    // Store interaction
    await this.storeInteraction(interaction);
    
    // Log learning event
    await MetricsService.log('learning_interaction', {
      patterns: Object.keys(patterns),
      effectiveness,
      modelUsed,
      responseTime,
      timestamp
    });
  }

  extractBehaviorPatterns(interaction) {
    const patterns = {};
    
    // Message length patterns
    const messageLength = interaction.userMessage?.length || 0;
    patterns.messageLength = this.categorizeValue(messageLength, [50, 150, 300]);
    
    // Response time preferences
    const responseTime = interaction.responseTime || 0;
    patterns.responseTimePreference = this.categorizeValue(responseTime, [2000, 5000, 10000]);
    
    // Topic patterns
    patterns.topics = this.extractTopics(interaction.userMessage);
    
    // Intent patterns
    patterns.intent = this.extractIntent(interaction.userMessage);
    
    // Feedback patterns
    if (interaction.userFeedback) {
      patterns.feedbackSentiment = this.analyzeSentiment(interaction.userFeedback);
      patterns.feedbackType = this.categorizeFeedback(interaction.userFeedback);
    }
    
    // Time patterns
    const hour = new Date(interaction.timestamp).getHours();
    patterns.timeOfDay = this.categorizeTimeOfDay(hour);
    
    // Model preference patterns
    if (interaction.modelUsed) {
      patterns.modelPreference = interaction.modelUsed;
    }
    
    return patterns;
  }

  updateBehaviorPatterns(patterns) {
    for (const [key, value] of Object.entries(patterns)) {
      if (!this.userBehaviorPatterns.has(key)) {
        this.userBehaviorPatterns.set(key, new Map());
      }
      
      const patternMap = this.userBehaviorPatterns.get(key);
      const currentCount = patternMap.get(value) || 0;
      patternMap.set(value, currentCount + 1);
      
      // Apply memory decay to other values
      for (const [k, v] of patternMap.entries()) {
        if (k !== value) {
          patternMap.set(k, v * this.memoryDecay);
        }
      }
    }
  }

  analyzeResponseEffectiveness(interaction) {
    let effectiveness = 0.5; // Default neutral
    
    // User feedback analysis
    if (interaction.userFeedback) {
      const sentiment = this.analyzeSentiment(interaction.userFeedback);
      effectiveness = sentiment > 0.5 ? 0.8 : sentiment < -0.5 ? 0.2 : 0.5;
    }
    
    // Response time analysis
    const responseTime = interaction.responseTime || 0;
    if (responseTime < 3000) effectiveness += 0.1; // Fast responses are good
    else if (responseTime > 15000) effectiveness -= 0.1; // Slow responses are bad
    
    // Response length analysis
    const responseLength = interaction.aiResponse?.length || 0;
    const messageLength = interaction.userMessage?.length || 0;
    
    // Prefer responses that are proportional to question complexity
    if (messageLength > 100 && responseLength > 200) effectiveness += 0.1;
    if (messageLength < 50 && responseLength < 100) effectiveness += 0.1;
    
    // Follow-up behavior analysis
    if (interaction.context?.hasFollowUp) {
      effectiveness += 0.1; // User asking follow-ups suggests good response
    }
    
    return Math.max(0, Math.min(1, effectiveness));
  }

  updateLearningMetrics(patterns, effectiveness) {
    for (const [patternKey, patternValue] of Object.entries(patterns)) {
      const metricKey = `${patternKey}_${patternValue}`;
      
      if (!this.learningMetrics.has(metricKey)) {
        this.learningMetrics.set(metricKey, {
          count: 0,
          totalEffectiveness: 0,
          averageEffectiveness: 0,
          lastUpdated: Date.now()
        });
      }
      
      const metric = this.learningMetrics.get(metricKey);
      metric.count++;
      metric.totalEffectiveness += effectiveness;
      metric.averageEffectiveness = metric.totalEffectiveness / metric.count;
      metric.lastUpdated = Date.now();
    }
  }

  async generateAdaptationRules(patterns, effectiveness) {
    // Generate rules based on effective patterns
    if (effectiveness > 0.7) {
      for (const [patternKey, patternValue] of Object.entries(patterns)) {
        const ruleKey = `prefer_${patternKey}_${patternValue}`;
        
        if (!this.adaptationRules.has(ruleKey)) {
          this.adaptationRules.set(ruleKey, {
            pattern: { [patternKey]: patternValue },
            effectiveness,
            confidence: 0.1,
            lastApplied: 0,
            applicationCount: 0
          });
        }
        
        const rule = this.adaptationRules.get(ruleKey);
        rule.confidence = Math.min(1, rule.confidence + this.learningRate);
        rule.effectiveness = (rule.effectiveness + effectiveness) / 2;
      }
    }
    
    // Remove ineffective rules
    for (const [ruleKey, rule] of this.adaptationRules.entries()) {
      if (rule.confidence < 0.1 || rule.effectiveness < 0.3) {
        this.adaptationRules.delete(ruleKey);
      }
    }
  }

  async adaptResponse(context, analysis) {
    await this.initialize();
    
    const adaptations = {};
    
    // Apply learned preferences
    for (const [ruleKey, rule] of this.adaptationRules.entries()) {
      if (this.shouldApplyRule(rule, context, analysis)) {
        this.applyRule(rule, adaptations);
        rule.lastApplied = Date.now();
        rule.applicationCount++;
      }
    }
    
    // Apply user behavior adaptations
    const behaviorAdaptations = this.getBehaviorAdaptations(context, analysis);
    Object.assign(adaptations, behaviorAdaptations);
    
    return adaptations;
  }

  shouldApplyRule(rule, context, analysis) {
    // Check if rule is applicable based on context
    const { pattern } = rule;
    
    for (const [key, value] of Object.entries(pattern)) {
      if (key === 'messageLength') {
        const messageLength = context.message?.length || 0;
        if (!this.matchesCategory(messageLength, value)) return false;
      } else if (key === 'topics') {
        const topics = this.extractTopics(context.message);
        if (!topics.includes(value)) return false;
      } else if (key === 'intent') {
        if (analysis.intent !== value) return false;
      } else if (key === 'timeOfDay') {
        const hour = new Date().getHours();
        if (this.categorizeTimeOfDay(hour) !== value) return false;
      }
    }
    
    return true;
  }

  applyRule(rule, adaptations) {
    // Apply rule-based adaptations
    if (rule.pattern.messageLength === 'short') {
      adaptations.responseLength = 'concise';
    } else if (rule.pattern.messageLength === 'long') {
      adaptations.responseLength = 'detailed';
    }
    
    if (rule.pattern.topics) {
      adaptations.topicExpertise = rule.pattern.topics;
    }
    
    if (rule.pattern.intent === 'creative') {
      adaptations.creativity = 'high';
    } else if (rule.pattern.intent === 'technical') {
      adaptations.technicality = 'high';
    }
  }

  getBehaviorAdaptations(context, analysis) {
    const adaptations = {};
    
    // Message length adaptation
    const messageLength = context.message?.length || 0;
    const lengthPattern = this.getMostCommonPattern('messageLength');
    if (lengthPattern === 'short' && messageLength < 50) {
      adaptations.responseLength = 'concise';
    } else if (lengthPattern === 'long' && messageLength > 200) {
      adaptations.responseLength = 'detailed';
    }
    
    // Time-based adaptation
    const hour = new Date().getHours();
    const timePattern = this.getMostCommonPattern('timeOfDay');
    if (timePattern === 'morning' && hour >= 6 && hour <= 11) {
      adaptations.tone = 'energetic';
    } else if (timePattern === 'evening' && hour >= 18 && hour <= 23) {
      adaptations.tone = 'relaxed';
    }
    
    // Topic adaptation
    const topics = this.extractTopics(context.message);
    const commonTopics = this.getMostCommonPatterns('topics', 3);
    if (commonTopics.some(topic => topics.includes(topic))) {
      adaptations.topicExpertise = commonTopics[0];
    }
    
    return adaptations;
  }

  getMostCommonPattern(patternKey, limit = 1) {
    const patternMap = this.userBehaviorPatterns.get(patternKey);
    if (!patternMap || patternMap.size === 0) return null;
    
    const sorted = Array.from(patternMap.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return limit === 1 ? sorted[0][0] : sorted.slice(0, limit).map(([key]) => key);
  }

  getMostCommonPatterns(patternKey, limit = 3) {
    return this.getMostCommonPattern(patternKey, limit);
  }

  async storeInteraction(interaction) {
    this.conversationHistory.push({
      ...interaction,
      timestamp: interaction.timestamp || Date.now()
    });
    
    // Maintain history size
    if (this.conversationHistory.length > this.maxHistorySize) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistorySize);
    }
    
    // Persist to storage
    await this.persistData();
  }

  async persistData() {
    try {
      await AsyncStorage.setItem('user_behavior_patterns', 
        JSON.stringify(Array.from(this.userBehaviorPatterns.entries())));
      await AsyncStorage.setItem('adaptation_rules', 
        JSON.stringify(Array.from(this.adaptationRules.entries())));
      await AsyncStorage.setItem('learning_metrics', 
        JSON.stringify(Array.from(this.learningMetrics.entries())));
      await AsyncStorage.setItem('user_preferences', 
        JSON.stringify(this.userPreferences));
      await AsyncStorage.setItem('conversation_history', 
        JSON.stringify(this.conversationHistory.slice(-100))); // Keep last 100
    } catch (error) {
      console.error('Error persisting learning data:', error);
    }
  }

  async loadUserBehaviorData() {
    try {
      const stored = await AsyncStorage.getItem('user_behavior_patterns');
      if (stored) {
        this.userBehaviorPatterns = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading behavior data:', error);
    }
  }

  async loadAdaptationRules() {
    try {
      const stored = await AsyncStorage.getItem('adaptation_rules');
      if (stored) {
        this.adaptationRules = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading adaptation rules:', error);
    }
  }

  async loadLearningMetrics() {
    try {
      const stored = await AsyncStorage.getItem('learning_metrics');
      if (stored) {
        this.learningMetrics = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading learning metrics:', error);
    }
  }

  async loadUserPreferences() {
    try {
      const stored = await AsyncStorage.getItem('user_preferences');
      if (stored) {
        this.userPreferences = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  async loadConversationHistory() {
    try {
      const stored = await AsyncStorage.getItem('conversation_history');
      if (stored) {
        this.conversationHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  // Utility methods
  categorizeValue(value, thresholds) {
    if (value < thresholds[0]) return 'low';
    if (value < thresholds[1]) return 'medium';
    if (value < thresholds[2]) return 'high';
    return 'very_high';
  }

  extractTopics(text) {
    if (!text) return [];
    
    const topicKeywords = {
      technology: ['tech', 'code', 'programming', 'software', 'ai', 'computer'],
      business: ['business', 'market', 'finance', 'money', 'company', 'work'],
      health: ['health', 'medical', 'fitness', 'exercise', 'diet', 'wellness'],
      education: ['learn', 'study', 'school', 'university', 'education', 'research'],
      creative: ['art', 'design', 'creative', 'music', 'writing', 'drawing'],
      personal: ['personal', 'life', 'family', 'friends', 'relationship', 'home']
    };
    
    const topics = [];
    const lowerText = text.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  extractIntent(text) {
    if (!text) return 'general';
    
    const intentKeywords = {
      question: ['what', 'how', 'why', 'when', 'where', 'who', '?'],
      request: ['can you', 'please', 'help me', 'i need', 'i want'],
      creative: ['create', 'make', 'design', 'write', 'draw', 'build'],
      technical: ['code', 'program', 'debug', 'fix', 'error', 'function'],
      opinion: ['think', 'opinion', 'believe', 'feel', 'agree', 'disagree']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  analyzeSentiment(text) {
    if (!text) return 0;
    
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / 5)); // Normalize to -1 to 1
  }

  categorizeFeedback(feedback) {
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes('thanks') || lowerFeedback.includes('thank you')) {
      return 'gratitude';
    } else if (lowerFeedback.includes('more') || lowerFeedback.includes('elaborate')) {
      return 'request_more';
    } else if (lowerFeedback.includes('shorter') || lowerFeedback.includes('concise')) {
      return 'request_less';
    } else if (lowerFeedback.includes('wrong') || lowerFeedback.includes('incorrect')) {
      return 'correction';
    } else if (lowerFeedback.includes('perfect') || lowerFeedback.includes('exactly')) {
      return 'approval';
    }
    
    return 'general';
  }

  categorizeTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  matchesCategory(value, category) {
    switch (category) {
      case 'short': return value < 50;
      case 'medium': return value >= 50 && value < 150;
      case 'long': return value >= 150;
      default: return false;
    }
  }

  async getLearningInsights() {
    await this.initialize();
    
    return {
      totalInteractions: this.conversationHistory.length,
      behaviorPatterns: Object.fromEntries(this.userBehaviorPatterns),
      adaptationRules: Object.fromEntries(this.adaptationRules),
      learningMetrics: Object.fromEntries(this.learningMetrics),
      userPreferences: this.userPreferences,
      mostCommonPatterns: {
        messageLength: this.getMostCommonPattern('messageLength'),
        topics: this.getMostCommonPatterns('topics', 3),
        intent: this.getMostCommonPattern('intent'),
        timeOfDay: this.getMostCommonPattern('timeOfDay')
      }
    };
  }
}

export default new LearningAdaptationService();
