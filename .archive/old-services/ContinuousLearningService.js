// Continuous Learning Service - Powers MOTTO's machine learning and personalization
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsService } from './MetricsService';
import { ErrorManager } from './ErrorManager';

class ContinuousLearningService {
  constructor() {
    this.isInitialized = false;
    this.learningData = {
      interactions: [],
      userProfiles: {},
      responseHistory: [],
      feedbackData: [],
      performanceMetrics: {}
    };
    
    this.mlAlgorithms = {
      responseQuality: true,
      userPreference: true,
      behaviorPattern: true,
      sentimentAnalysis: true,
      personalization: true
    };
    
    this.personalizationEngine = {
      userSegments: {},
      preferenceWeights: {},
      behaviorPatterns: {},
      adaptationLevel: 0.1,
      personalizationScore: 0.0
    };
    
    this.continuousLearning = {
      isActive: true,
      learningInterval: 300000, // 5 minutes
      batchProcessing: true,
      incrementalLearning: true
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadLearningData();
      await this.loadPersonalizationData();
      this.startContinuousLearning();
      
      this.isInitialized = true;
      console.log('✅ Continuous Learning Service initialized');
      
      await MetricsService.logEvent('continuous_learning_initialized', {
        algorithms: Object.keys(this.mlAlgorithms).filter(k => this.mlAlgorithms[k]),
        personalizationLevel: this.personalizationEngine.adaptationLevel
      });
    } catch (error) {
      console.error('❌ Failed to initialize Continuous Learning Service:', error);
      await ErrorManager.handleError(error, { context: 'ContinuousLearningService.initialize' });
      throw error;
    }
  }

  // Response Quality Assessment
  async assessResponseQuality(response, context) {
    try {
      const features = this.extractResponseFeatures(response, context);
      const qualityScore = this.calculateQualityScore(features);
      const factors = this.analyzeQualityFactors(response, context);
      
      return {
        score: qualityScore,
        confidence: 0.8,
        factors: factors,
        recommendations: this.generateQualityRecommendations(factors)
      };
    } catch (error) {
      console.error('Error assessing response quality:', error);
      return { score: 0.5, confidence: 0.3, factors: ['Assessment failed'] };
    }
  }

  extractResponseFeatures(response, context) {
    return {
      length: response.length,
      wordCount: response.split(' ').length,
      sentenceCount: response.split(/[.!?]+/).length,
      readabilityScore: this.calculateReadabilityScore(response),
      sentimentScore: this.analyzeSentiment(response),
      complexityScore: this.calculateComplexityScore(response),
      personalizationScore: this.calculatePersonalizationScore(response, context),
      contextRelevance: this.calculateContextRelevance(response, context)
    };
  }

  calculateQualityScore(features) {
    const weights = {
      readability: 0.2,
      sentiment: 0.2,
      complexity: 0.15,
      personalization: 0.2,
      contextRelevance: 0.25
    };
    
    const score = 
      features.readabilityScore * weights.readability +
      features.sentimentScore * weights.sentiment +
      (1 - features.complexityScore) * weights.complexity +
      features.personalizationScore * weights.personalization +
      features.contextRelevance * weights.contextRelevance;
    
    return Math.max(0, Math.min(1, score));
  }

  calculateReadabilityScore(text) {
    const words = text.split(' ').length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0) return 0;
    
    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score)) / 100;
  }

  countSyllables(text) {
    const words = text.toLowerCase().split(' ');
    let syllables = 0;
    
    words.forEach(word => {
      const matches = word.match(/[aeiouy]+/g);
      syllables += matches ? matches.length : 1;
    });
    
    return syllables;
  }

  analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'brilliant', 'lovely'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'wrong', 'error', 'problem', 'issue'];
    
    const words = text.toLowerCase().split(' ');
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 0.5;
    
    return positiveCount / total;
  }

  calculateComplexityScore(text) {
    const words = text.split(' ').length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    return Math.min(1, avgWordsPerSentence / 20);
  }

  calculatePersonalizationScore(response, context) {
    const userPreferences = context.userPreferences || {};
    const personalizationIndicators = [
      userPreferences.communicationStyle,
      userPreferences.detailLevel,
      userPreferences.responseLength
    ];
    
    let score = 0;
    personalizationIndicators.forEach(indicator => {
      if (indicator && this.checkPersonalizationMatch(response, indicator)) {
        score += 0.33;
      }
    });
    
    return score;
  }

  checkPersonalizationMatch(response, preference) {
    switch (preference) {
      case 'formal':
        return response.includes('please') || response.includes('thank you');
      case 'casual':
        return response.includes('hey') || response.includes('cool');
      case 'detailed':
        return response.length > 100;
      case 'brief':
        return response.length < 50;
      default:
        return true;
    }
  }

  calculateContextRelevance(response, context) {
    const contextKeywords = context.keywords || [];
    const responseWords = response.toLowerCase().split(' ');
    
    let relevanceScore = 0;
    contextKeywords.forEach(keyword => {
      if (responseWords.includes(keyword.toLowerCase())) {
        relevanceScore += 1;
      }
    });
    
    return contextKeywords.length > 0 ? relevanceScore / contextKeywords.length : 0.5;
  }

  analyzeQualityFactors(response, context) {
    const factors = [];
    
    if (response.length < 10) factors.push('Response too short');
    if (response.length > 500) factors.push('Response too long');
    if (this.calculateReadabilityScore(response) < 0.3) factors.push('Low readability');
    if (this.analyzeSentiment(response) < 0.3) factors.push('Negative sentiment');
    if (this.calculatePersonalizationScore(response, context) < 0.3) factors.push('Low personalization');
    if (this.calculateContextRelevance(response, context) < 0.3) factors.push('Low context relevance');
    
    if (factors.length === 0) factors.push('Good quality response');
    
    return factors;
  }

  generateQualityRecommendations(factors) {
    const recommendations = [];
    
    factors.forEach(factor => {
      switch (factor) {
        case 'Response too short':
          recommendations.push('Provide more detailed information');
          break;
        case 'Response too long':
          recommendations.push('Make response more concise');
          break;
        case 'Low readability':
          recommendations.push('Use simpler language and shorter sentences');
          break;
        case 'Negative sentiment':
          recommendations.push('Use more positive and encouraging language');
          break;
        case 'Low personalization':
          recommendations.push('Adapt response to user preferences');
          break;
        case 'Low context relevance':
          recommendations.push('Make response more relevant to the context');
          break;
      }
    });
    
    return recommendations;
  }

  // User Personalization
  async personalizeResponse(response, userId, context) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const personalizedResponse = await this.applyPersonalization(response, userProfile, context);
      
      await this.updateUserProfile(userId, response, context);
      
      return personalizedResponse;
    } catch (error) {
      console.error('Error personalizing response:', error);
      return response;
    }
  }

  async getUserProfile(userId) {
    if (!this.learningData.userProfiles[userId]) {
      this.learningData.userProfiles[userId] = {
        id: userId,
        preferences: {
          communicationStyle: 'conversational',
          detailLevel: 'moderate',
          responseLength: 'medium',
          formality: 'casual'
        },
        behaviorPatterns: {
          activeHours: [],
          commonTopics: [],
          interactionFrequency: 0,
          averageSessionLength: 0
        },
        learningHistory: [],
        personalizationScore: 0.0,
        lastUpdated: Date.now()
      };
    }
    
    return this.learningData.userProfiles[userId];
  }

  async applyPersonalization(response, userProfile, context) {
    let personalizedResponse = response;
    
    if (userProfile.preferences.communicationStyle === 'formal') {
      personalizedResponse = this.makeFormal(personalizedResponse);
    } else if (userProfile.preferences.communicationStyle === 'casual') {
      personalizedResponse = this.makeCasual(personalizedResponse);
    }
    
    if (userProfile.preferences.detailLevel === 'high') {
      personalizedResponse = this.addDetail(personalizedResponse, context);
    } else if (userProfile.preferences.detailLevel === 'low') {
      personalizedResponse = this.reduceDetail(personalizedResponse);
    }
    
    if (userProfile.preferences.responseLength === 'short') {
      personalizedResponse = this.shortenResponse(personalizedResponse);
    } else if (userProfile.preferences.responseLength === 'long') {
      personalizedResponse = this.lengthenResponse(personalizedResponse, context);
    }
    
    return personalizedResponse;
  }

  makeFormal(response) {
    return response
      .replace(/hey/gi, 'Hello')
      .replace(/hi/gi, 'Hello')
      .replace(/thanks/gi, 'Thank you')
      .replace(/yeah/gi, 'Yes')
      .replace(/nope/gi, 'No');
  }

  makeCasual(response) {
    return response
      .replace(/Hello/gi, 'Hey')
      .replace(/Thank you/gi, 'Thanks')
      .replace(/Yes/gi, 'Yeah')
      .replace(/No/gi, 'Nope');
  }

  addDetail(response, context) {
    const additionalInfo = this.generateAdditionalInfo(context);
    return response + ' ' + additionalInfo;
  }

  reduceDetail(response) {
    const sentences = response.split(/[.!?]+/);
    return sentences.slice(0, Math.ceil(sentences.length / 2)).join('.') + '.';
  }

  shortenResponse(response) {
    const sentences = response.split(/[.!?]+/);
    return sentences[0] + '.';
  }

  lengthenResponse(response, context) {
    const elaboration = this.generateElaboration(context);
    return response + ' ' + elaboration;
  }

  generateAdditionalInfo(context) {
    const topics = context.topics || [];
    if (topics.length > 0) {
      return `Additionally, you might find it helpful to know that ${topics[0]} is a key aspect to consider.`;
    }
    return 'I hope this information is helpful for your needs.';
  }

  generateElaboration(context) {
    const keywords = context.keywords || [];
    if (keywords.length > 0) {
      return `This relates to ${keywords.join(', ')} and can be further explored based on your specific requirements.`;
    }
    return 'Feel free to ask if you need more information on this topic.';
  }

  async updateUserProfile(userId, response, context) {
    const userProfile = this.learningData.userProfiles[userId];
    
    userProfile.behaviorPatterns.interactionFrequency++;
    
    const topics = this.extractTopics(response);
    topics.forEach(topic => {
      if (!userProfile.behaviorPatterns.commonTopics.includes(topic)) {
        userProfile.behaviorPatterns.commonTopics.push(topic);
      }
    });
    
    const currentHour = new Date().getHours();
    if (!userProfile.behaviorPatterns.activeHours.includes(currentHour)) {
      userProfile.behaviorPatterns.activeHours.push(currentHour);
    }
    
    const personalizationScore = this.calculatePersonalizationScore(response, context);
    userProfile.personalizationScore = (userProfile.personalizationScore + personalizationScore) / 2;
    
    userProfile.lastUpdated = Date.now();
    
    await this.saveUserProfile(userId, userProfile);
  }

  extractTopics(text) {
    const commonTopics = [
      'technology', 'science', 'health', 'education', 'business', 'finance',
      'travel', 'food', 'sports', 'entertainment', 'art', 'music', 'books'
    ];
    
    const words = text.toLowerCase().split(' ');
    return commonTopics.filter(topic => words.includes(topic));
  }

  // Pattern Recognition
  async analyzeUserBehavior(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const interactions = this.learningData.interactions.filter(i => i.userId === userId);
      
      return {
        patterns: this.identifyBehaviorPatterns(interactions),
        preferences: this.identifyPreferences(interactions),
        trends: this.identifyTrends(interactions),
        predictions: this.predictFutureBehavior(interactions)
      };
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      return null;
    }
  }

  identifyBehaviorPatterns(interactions) {
    return {
      timePatterns: this.analyzeTimePatterns(interactions),
      topicPatterns: this.analyzeTopicPatterns(interactions),
      interactionPatterns: this.analyzeInteractionPatterns(interactions)
    };
  }

  analyzeTimePatterns(interactions) {
    const hours = interactions.map(i => new Date(i.timestamp).getHours());
    const dayOfWeek = interactions.map(i => new Date(i.timestamp).getDay());
    
    return {
      mostActiveHour: this.findMostFrequent(hours),
      mostActiveDay: this.findMostFrequent(dayOfWeek),
      averageSessionLength: this.calculateAverageSessionLength(interactions)
    };
  }

  analyzeTopicPatterns(interactions) {
    const topics = interactions.flatMap(i => this.extractTopics(i.message));
    return {
      mostCommonTopics: this.findMostFrequent(topics, 5),
      topicDiversity: this.calculateDiversity(topics)
    };
  }

  analyzeInteractionPatterns(interactions) {
    return {
      averageMessageLength: this.calculateAverageMessageLength(interactions),
      questionFrequency: this.calculateQuestionFrequency(interactions),
      commandFrequency: this.calculateCommandFrequency(interactions)
    };
  }

  identifyPreferences(interactions) {
    const preferences = {
      communicationStyle: 'conversational',
      detailLevel: 'moderate',
      responseLength: 'medium'
    };
    
    const avgLength = this.calculateAverageMessageLength(interactions);
    if (avgLength > 50) preferences.detailLevel = 'high';
    if (avgLength < 20) preferences.detailLevel = 'low';
    
    return preferences;
  }

  identifyTrends(interactions) {
    const recentInteractions = interactions.filter(
      i => i.timestamp > (Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    return {
      recentActivity: recentInteractions.length,
      trendDirection: recentInteractions.length > interactions.length / 2 ? 'increasing' : 'decreasing',
      popularTopics: this.findMostFrequent(
        recentInteractions.flatMap(i => this.extractTopics(i.message)), 3
      )
    };
  }

  predictFutureBehavior(interactions) {
    const patterns = this.identifyBehaviorPatterns(interactions);
    
    return {
      nextTopics: patterns.topicPatterns.mostCommonTopics.slice(0, 3),
      preferredResponseStyle: patterns.interactionPatterns.averageMessageLength > 50 ? 'detailed' : 'brief',
      optimalInteractionTime: patterns.timePatterns.mostActiveHour
    };
  }

  // Continuous Learning
  startContinuousLearning() {
    if (this.continuousLearning.isActive) {
      setInterval(() => {
        this.performContinuousLearning();
      }, this.continuousLearning.learningInterval);
    }
  }

  async performContinuousLearning() {
    try {
      console.log('🧠 Performing continuous learning...');
      
      await this.updateModelsWithNewData();
      await this.updatePersonalizationEngine();
      await this.analyzeLearningProgress();
      
      console.log('✅ Continuous learning completed');
    } catch (error) {
      console.error('Error in continuous learning:', error);
    }
  }

  async updateModelsWithNewData() {
    const newInteractions = this.learningData.interactions.filter(
      i => i.timestamp > (Date.now() - 24 * 60 * 60 * 1000)
    );
    
    if (newInteractions.length > 0) {
      console.log(`Updating models with ${newInteractions.length} new interactions`);
    }
  }

  async updatePersonalizationEngine() {
    await this.updateUserSegments();
    await this.updatePreferenceWeights();
  }

  async analyzeLearningProgress() {
    const progress = {
      totalInteractions: this.learningData.interactions.length,
      userProfiles: Object.keys(this.learningData.userProfiles).length,
      personalizationScore: this.personalizationEngine.personalizationScore
    };
    
    console.log('📊 Learning Progress:', progress);
  }

  async updateUserSegments() {
    const users = Object.keys(this.learningData.userProfiles);
    this.personalizationEngine.userSegments = {
      active: users.filter(u => this.learningData.userProfiles[u].behaviorPatterns.interactionFrequency > 10),
      casual: users.filter(u => this.learningData.userProfiles[u].behaviorPatterns.interactionFrequency <= 10)
    };
  }

  async updatePreferenceWeights() {
    const users = Object.values(this.learningData.userProfiles);
    const preferences = users.map(u => u.preferences);
    
    this.personalizationEngine.preferenceWeights = {
      communicationStyle: this.calculatePreferenceWeight(preferences, 'communicationStyle'),
      detailLevel: this.calculatePreferenceWeight(preferences, 'detailLevel'),
      responseLength: this.calculatePreferenceWeight(preferences, 'responseLength')
    };
  }

  calculatePreferenceWeight(preferences, key) {
    const values = preferences.map(p => p[key]);
    const frequency = {};
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    
    return frequency;
  }

  // Utility Methods
  findMostFrequent(array, count = 1) {
    const frequency = {};
    array.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, count);
  }

  calculateDiversity(array) {
    const unique = [...new Set(array)];
    return unique.length / array.length;
  }

  calculateAverageSessionLength(interactions) {
    if (interactions.length < 2) return 0;
    
    const sessions = this.groupIntoSessions(interactions);
    const sessionLengths = sessions.map(session => session.length);
    
    return sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length;
  }

  groupIntoSessions(interactions) {
    const sessions = [];
    let currentSession = [];
    
    interactions.forEach((interaction, index) => {
      if (index === 0) {
        currentSession.push(interaction);
      } else {
        const timeDiff = interaction.timestamp - interactions[index - 1].timestamp;
        if (timeDiff > 30 * 60 * 1000) {
          sessions.push(currentSession);
          currentSession = [interaction];
        } else {
          currentSession.push(interaction);
        }
      }
    });
    
    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }
    
    return sessions;
  }

  calculateAverageMessageLength(interactions) {
    const lengths = interactions.map(i => i.message.length);
    return lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  }

  calculateQuestionFrequency(interactions) {
    const questions = interactions.filter(i => i.message.includes('?'));
    return questions.length / interactions.length;
  }

  calculateCommandFrequency(interactions) {
    const commands = interactions.filter(i => i.message.startsWith('/'));
    return commands.length / interactions.length;
  }

  // Data Persistence
  async loadLearningData() {
    try {
      const data = await AsyncStorage.getItem('continuous_learning_data');
      if (data) {
        this.learningData = { ...this.learningData, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
  }

  async saveLearningData() {
    try {
      await AsyncStorage.setItem('continuous_learning_data', JSON.stringify(this.learningData));
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  async loadPersonalizationData() {
    try {
      const data = await AsyncStorage.getItem('personalization_data');
      if (data) {
        this.personalizationEngine = { ...this.personalizationEngine, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading personalization data:', error);
    }
  }

  async savePersonalizationData() {
    try {
      await AsyncStorage.setItem('personalization_data', JSON.stringify(this.personalizationEngine));
    } catch (error) {
      console.error('Error saving personalization data:', error);
    }
  }

  async saveUserProfile(userId, profile) {
    try {
      this.learningData.userProfiles[userId] = profile;
      await this.saveLearningData();
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Status and Health
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      algorithms: Object.keys(this.mlAlgorithms).filter(k => this.mlAlgorithms[k]),
      learningData: {
        interactions: this.learningData.interactions.length,
        userProfiles: Object.keys(this.learningData.userProfiles).length,
        responseHistory: this.learningData.responseHistory.length
      },
      personalization: {
        adaptationLevel: this.personalizationEngine.adaptationLevel,
        personalizationScore: this.personalizationEngine.personalizationScore,
        userSegments: Object.keys(this.personalizationEngine.userSegments).length
      },
      continuousLearning: this.continuousLearning.isActive
    };
  }

  // Cleanup
  async destroy() {
    await this.saveLearningData();
    await this.savePersonalizationData();
    
    this.isInitialized = false;
    console.log('🧹 Continuous Learning Service destroyed');
  }
}

export default new ContinuousLearningService();
