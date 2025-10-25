import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorManager from './ErrorManager';

class IntelligentContextManagementService {
  constructor() {
    this.isInitialized = false;
    this.contextMemory = new Map();
    this.conversationHistory = new Map();
    this.topicGraph = new Map();
    this.userPreferences = new Map();
    this.contextualInsights = new Map();
    
    // Context management configurations
    this.contextConfig = {
      maxContextLength: 15000,
      maxConversationHistory: 50,
      maxTopicConnections: 100,
      contextCompressionRatio: 0.8,
      memoryRetentionDays: 7,
      contextUpdateInterval: 5000, // 5 seconds
      intelligentSummarization: true,
      adaptiveContextSizing: true,
      contextualLearning: true,
      topicContinuity: true,
      userPersonalization: true
    };

    // Context types and their priorities
    this.contextTypes = {
      conversation: { priority: 1, weight: 0.4 },
      userPreferences: { priority: 2, weight: 0.3 },
      topicContext: { priority: 3, weight: 0.2 },
      temporalContext: { priority: 4, weight: 0.1 }
    };
  }

  async initialize() {
    try {
      console.log('Initializing Intelligent Context Management Service...');
      
      // Load existing context data
      await this.loadContextData();
      
      // Initialize context monitoring
      await this.initializeContextMonitoring();
      
      // Start context optimization cycles
      this.startContextOptimizationCycles();
      
      this.isInitialized = true;
      console.log('Intelligent Context Management Service initialized successfully');
      
      await MetricsService.logEvent('context_management_initialized', {
        timestamp: Date.now(),
        maxContextLength: this.contextConfig.maxContextLength
      });
      
    } catch (error) {
      console.error('Error initializing Intelligent Context Management Service:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentContextManagementService.initialize' });
      throw error;
    }
  }

  async manageContext(question, currentContext = {}, metadata = {}) {
    try {
      const startTime = Date.now();
      
      // Multi-dimensional context management
      const contextManagement = await Promise.all([
        this.analyzeContextRelevance(question, currentContext),
        this.updateConversationHistory(question, currentContext, metadata),
        this.updateTopicGraph(question, currentContext),
        this.updateUserPreferences(question, currentContext, metadata),
        this.generateContextualInsights(question, currentContext),
        this.optimizeContextSize(currentContext)
      ]);

      const managedContext = {
        ...currentContext,
        relevance: contextManagement[0],
        conversationHistory: contextManagement[1],
        topicGraph: contextManagement[2],
        userPreferences: contextManagement[3],
        contextualInsights: contextManagement[4],
        optimizedContext: contextManagement[5],
        managementTimestamp: Date.now(),
        managementDuration: Date.now() - startTime
      };

      // Store managed context
      await this.storeManagedContext(question, managedContext);
      
      return managedContext;
      
    } catch (error) {
      console.error('Error managing context:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentContextManagementService.manageContext' });
      return currentContext;
    }
  }

  async analyzeContextRelevance(question, currentContext) {
    try {
      const relevance = {
        overall: 0.5,
        conversation: 0.5,
        topic: 0.5,
        temporal: 0.5,
        user: 0.5
      };

      // Analyze conversation relevance
      if (currentContext.messageHistory && currentContext.messageHistory.length > 0) {
        const recentMessages = currentContext.messageHistory.slice(-5);
        const questionWords = question.toLowerCase().split(' ');
        
        let conversationRelevance = 0;
        recentMessages.forEach(message => {
          const messageWords = message.text?.toLowerCase().split(' ') || [];
          const commonWords = questionWords.filter(word => messageWords.includes(word));
          conversationRelevance += (commonWords.length / questionWords.length) * 0.2;
        });
        
        relevance.conversation = Math.min(conversationRelevance, 1.0);
      }

      // Analyze topic relevance
      if (currentContext.topicContext) {
        const topicWords = currentContext.topicContext.toLowerCase().split(' ');
        const questionWords = question.toLowerCase().split(' ');
        const commonWords = questionWords.filter(word => topicWords.includes(word));
        relevance.topic = Math.min(commonWords.length / questionWords.length, 1.0);
      }

      // Analyze temporal relevance
      if (currentContext.timestamp) {
        const timeDiff = Date.now() - currentContext.timestamp;
        const maxRelevanceTime = 30 * 60 * 1000; // 30 minutes
        relevance.temporal = Math.max(0, 1 - (timeDiff / maxRelevanceTime));
      }

      // Analyze user preference relevance
      if (currentContext.userPreferences) {
        const userPrefs = currentContext.userPreferences;
        let userRelevance = 0.5;
        
        if (userPrefs.domain && question.toLowerCase().includes(userPrefs.domain)) {
          userRelevance += 0.3;
        }
        
        if (userPrefs.complexity && this.assessQuestionComplexity(question) === userPrefs.complexity) {
          userRelevance += 0.2;
        }
        
        relevance.user = Math.min(userRelevance, 1.0);
      }

      // Calculate overall relevance
      relevance.overall = (
        relevance.conversation * this.contextTypes.conversation.weight +
        relevance.topic * this.contextTypes.topicContext.weight +
        relevance.temporal * this.contextTypes.temporalContext.weight +
        relevance.user * this.contextTypes.userPreferences.weight
      );

      return relevance;
      
    } catch (error) {
      console.error('Error analyzing context relevance:', error);
      return { overall: 0.5, conversation: 0.5, topic: 0.5, temporal: 0.5, user: 0.5 };
    }
  }

  async updateConversationHistory(question, currentContext, metadata) {
    try {
      const conversationHistory = currentContext.messageHistory || [];
      
      // Add current question to history
      const newMessage = {
        text: question,
        timestamp: Date.now(),
        type: 'user',
        metadata: metadata
      };
      
      conversationHistory.push(newMessage);
      
      // Limit history size
      if (conversationHistory.length > this.contextConfig.maxConversationHistory) {
        conversationHistory.splice(0, conversationHistory.length - this.contextConfig.maxConversationHistory);
      }
      
      // Intelligent summarization for long conversations
      if (conversationHistory.length > 20 && this.contextConfig.intelligentSummarization) {
        return await this.summarizeConversationHistory(conversationHistory);
      }
      
      return conversationHistory;
      
    } catch (error) {
      console.error('Error updating conversation history:', error);
      return currentContext.messageHistory || [];
    }
  }

  async updateTopicGraph(question, currentContext) {
    try {
      const topicGraph = currentContext.topicGraph || new Map();
      
      // Extract topics from question
      const topics = await this.extractTopics(question);
      
      // Update topic connections
      topics.forEach(topic => {
        if (!topicGraph.has(topic)) {
          topicGraph.set(topic, {
            frequency: 1,
            lastSeen: Date.now(),
            connections: new Set()
          });
        } else {
          const topicData = topicGraph.get(topic);
          topicData.frequency++;
          topicData.lastSeen = Date.now();
        }
        
        // Connect related topics
        topics.forEach(otherTopic => {
          if (topic !== otherTopic) {
            topicGraph.get(topic).connections.add(otherTopic);
          }
        });
      });
      
      // Limit topic graph size
      if (topicGraph.size > this.contextConfig.maxTopicConnections) {
        const sortedTopics = Array.from(topicGraph.entries())
          .sort((a, b) => b[1].frequency - a[1].frequency);
        
        const toKeep = sortedTopics.slice(0, this.contextConfig.maxTopicConnections);
        topicGraph.clear();
        toKeep.forEach(([topic, data]) => topicGraph.set(topic, data));
      }
      
      return topicGraph;
      
    } catch (error) {
      console.error('Error updating topic graph:', error);
      return currentContext.topicGraph || new Map();
    }
  }

  async updateUserPreferences(question, currentContext, metadata) {
    try {
      const userPreferences = currentContext.userPreferences || {};
      
      // Update preferences based on question analysis
      const questionAnalysis = await this.analyzeQuestionForPreferences(question);
      
      // Update domain preference
      if (questionAnalysis.domain) {
        userPreferences.domain = questionAnalysis.domain;
        userPreferences.domainConfidence = questionAnalysis.domainConfidence;
      }
      
      // Update complexity preference
      if (questionAnalysis.complexity) {
        userPreferences.complexity = questionAnalysis.complexity;
        userPreferences.complexityConfidence = questionAnalysis.complexityConfidence;
      }
      
      // Update question type preference
      if (questionAnalysis.questionType) {
        userPreferences.questionType = questionAnalysis.questionType;
        userPreferences.questionTypeConfidence = questionAnalysis.questionTypeConfidence;
      }
      
      // Update formality preference
      if (questionAnalysis.formality) {
        userPreferences.formality = questionAnalysis.formality;
        userPreferences.formalityConfidence = questionAnalysis.formalityConfidence;
      }
      
      // Update timestamp
      userPreferences.lastUpdated = Date.now();
      
      return userPreferences;
      
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return currentContext.userPreferences || {};
    }
  }

  async generateContextualInsights(question, currentContext) {
    try {
      const insights = {
        questionPattern: await this.analyzeQuestionPattern(question, currentContext),
        contextGaps: await this.identifyContextGaps(question, currentContext),
        suggestedTopics: await this.suggestRelatedTopics(question, currentContext),
        conversationFlow: await this.analyzeConversationFlow(currentContext),
        userBehavior: await this.analyzeUserBehavior(question, currentContext)
      };
      
      return insights;
      
    } catch (error) {
      console.error('Error generating contextual insights:', error);
      return {};
    }
  }

  async optimizeContextSize(currentContext) {
    try {
      const optimizedContext = { ...currentContext };
      
      // Compress context if it's too large
      const contextSize = JSON.stringify(optimizedContext).length;
      if (contextSize > this.contextConfig.maxContextLength) {
        optimizedContext.compressed = true;
        optimizedContext.compressionRatio = this.contextConfig.contextCompressionRatio;
        
        // Compress message history
        if (optimizedContext.messageHistory) {
          optimizedContext.messageHistory = optimizedContext.messageHistory.slice(-10);
        }
        
        // Compress topic graph
        if (optimizedContext.topicGraph) {
          const sortedTopics = Array.from(optimizedContext.topicGraph.entries())
            .sort((a, b) => b[1].frequency - a[1].frequency);
          optimizedContext.topicGraph = new Map(sortedTopics.slice(0, 20));
        }
      }
      
      return optimizedContext;
      
    } catch (error) {
      console.error('Error optimizing context size:', error);
      return currentContext;
    }
  }

  // Helper methods for context analysis
  async extractTopics(question) {
    try {
      const topics = [];
      const questionLower = question.toLowerCase();
      
      // Common topic keywords
      const topicKeywords = {
        technology: ['tech', 'computer', 'software', 'ai', 'programming', 'code'],
        science: ['science', 'research', 'experiment', 'theory', 'physics', 'chemistry'],
        business: ['business', 'marketing', 'finance', 'strategy', 'management'],
        health: ['health', 'medical', 'medicine', 'treatment', 'therapy'],
        education: ['education', 'learning', 'teaching', 'school', 'university'],
        arts: ['art', 'music', 'literature', 'painting', 'writing'],
        sports: ['sport', 'football', 'basketball', 'tennis', 'golf'],
        travel: ['travel', 'trip', 'vacation', 'destination', 'hotel'],
        food: ['food', 'cooking', 'recipe', 'restaurant', 'cuisine']
      };
      
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => questionLower.includes(keyword))) {
          topics.push(topic);
        }
      });
      
      return topics;
      
    } catch (error) {
      console.error('Error extracting topics:', error);
      return [];
    }
  }

  async analyzeQuestionForPreferences(question) {
    try {
      const analysis = {
        domain: null,
        domainConfidence: 0,
        complexity: null,
        complexityConfidence: 0,
        questionType: null,
        questionTypeConfidence: 0,
        formality: null,
        formalityConfidence: 0
      };
      
      // Domain analysis
      const domains = ['technology', 'science', 'business', 'health', 'education', 'arts', 'sports', 'travel', 'food'];
      const questionLower = question.toLowerCase();
      
      domains.forEach(domain => {
        if (questionLower.includes(domain)) {
          analysis.domain = domain;
          analysis.domainConfidence = 0.8;
        }
      });
      
      // Complexity analysis
      const words = question.split(' ');
      const complexWords = words.filter(word => word.length > 8);
      const complexity = Math.min(complexWords.length / words.length, 1.0);
      
      if (complexity > 0.3) {
        analysis.complexity = 'high';
        analysis.complexityConfidence = complexity;
      } else if (complexity > 0.1) {
        analysis.complexity = 'medium';
        analysis.complexityConfidence = complexity;
      } else {
        analysis.complexity = 'low';
        analysis.complexityConfidence = 1 - complexity;
      }
      
      // Question type analysis
      if (questionLower.includes('what')) {
        analysis.questionType = 'factual';
        analysis.questionTypeConfidence = 0.8;
      } else if (questionLower.includes('how')) {
        analysis.questionType = 'procedural';
        analysis.questionTypeConfidence = 0.8;
      } else if (questionLower.includes('why')) {
        analysis.questionType = 'explanatory';
        analysis.questionTypeConfidence = 0.8;
      }
      
      // Formality analysis
      const formalWords = ['utilize', 'facilitate', 'implement', 'comprehensive', 'substantial'];
      const informalWords = ['use', 'help', 'put in place', 'complete', 'large'];
      
      const formalCount = formalWords.filter(word => questionLower.includes(word)).length;
      const informalCount = informalWords.filter(word => questionLower.includes(word)).length;
      
      if (formalCount > informalCount) {
        analysis.formality = 'formal';
        analysis.formalityConfidence = formalCount / (formalCount + informalCount);
      } else if (informalCount > formalCount) {
        analysis.formality = 'casual';
        analysis.formalityConfidence = informalCount / (formalCount + informalCount);
      } else {
        analysis.formality = 'neutral';
        analysis.formalityConfidence = 0.5;
      }
      
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing question for preferences:', error);
      return {};
    }
  }

  async analyzeQuestionPattern(question, currentContext) {
    try {
      const pattern = {
        length: question.length,
        wordCount: question.split(' ').length,
        questionMarks: (question.match(/\?/g) || []).length,
        complexity: await this.assessQuestionComplexity(question),
        domain: await this.detectDomain(question),
        type: await this.detectQuestionType(question)
      };
      
      return pattern;
      
    } catch (error) {
      console.error('Error analyzing question pattern:', error);
      return {};
    }
  }

  async identifyContextGaps(question, currentContext) {
    try {
      const gaps = [];
      
      // Check for missing domain context
      const questionDomain = await this.detectDomain(question);
      if (questionDomain && !currentContext.userPreferences?.domain) {
        gaps.push('domain_preference');
      }
      
      // Check for missing complexity context
      const questionComplexity = await this.assessQuestionComplexity(question);
      if (questionComplexity > 0.7 && !currentContext.userPreferences?.complexity) {
        gaps.push('complexity_preference');
      }
      
      // Check for missing conversation context
      if (!currentContext.messageHistory || currentContext.messageHistory.length === 0) {
        gaps.push('conversation_history');
      }
      
      return gaps;
      
    } catch (error) {
      console.error('Error identifying context gaps:', error);
      return [];
    }
  }

  async suggestRelatedTopics(question, currentContext) {
    try {
      const suggestions = [];
      const questionTopics = await this.extractTopics(question);
      
      // Get related topics from topic graph
      if (currentContext.topicGraph) {
        questionTopics.forEach(topic => {
          const topicData = currentContext.topicGraph.get(topic);
          if (topicData && topicData.connections) {
            topicData.connections.forEach(relatedTopic => {
              if (!suggestions.includes(relatedTopic)) {
                suggestions.push(relatedTopic);
              }
            });
          }
        });
      }
      
      return suggestions.slice(0, 5); // Limit to 5 suggestions
      
    } catch (error) {
      console.error('Error suggesting related topics:', error);
      return [];
    }
  }

  async analyzeConversationFlow(currentContext) {
    try {
      const flow = {
        continuity: 0.5,
        topicConsistency: 0.5,
        questionProgression: 0.5
      };
      
      if (currentContext.messageHistory && currentContext.messageHistory.length > 1) {
        const messages = currentContext.messageHistory.slice(-5);
        
        // Analyze topic continuity
        let topicContinuity = 0;
        for (let i = 1; i < messages.length; i++) {
          const prevTopics = await this.extractTopics(messages[i-1].text);
          const currTopics = await this.extractTopics(messages[i].text);
          const commonTopics = prevTopics.filter(topic => currTopics.includes(topic));
          topicContinuity += commonTopics.length / Math.max(prevTopics.length, currTopics.length);
        }
        flow.topicConsistency = topicContinuity / (messages.length - 1);
        
        // Analyze question progression
        const questionTypes = messages.map(msg => this.detectQuestionType(msg.text));
        const uniqueTypes = new Set(questionTypes);
        flow.questionProgression = uniqueTypes.size / questionTypes.length;
      }
      
      return flow;
      
    } catch (error) {
      console.error('Error analyzing conversation flow:', error);
      return { continuity: 0.5, topicConsistency: 0.5, questionProgression: 0.5 };
    }
  }

  async analyzeUserBehavior(question, currentContext) {
    try {
      const behavior = {
        questionFrequency: 0,
        topicDiversity: 0,
        complexityPreference: 0.5,
        formalityPreference: 0.5
      };
      
      if (currentContext.messageHistory) {
        behavior.questionFrequency = currentContext.messageHistory.length;
        
        // Analyze topic diversity
        const allTopics = new Set();
        for (const message of currentContext.messageHistory) {
          const topics = await this.extractTopics(message.text);
          topics.forEach(topic => allTopics.add(topic));
        }
        behavior.topicDiversity = allTopics.size / Math.max(currentContext.messageHistory.length, 1);
        
        // Analyze complexity preference
        const complexities = currentContext.messageHistory.map(msg => 
          this.assessQuestionComplexity(msg.text)
        );
        behavior.complexityPreference = complexities.reduce((a, b) => a + b, 0) / complexities.length;
      }
      
      return behavior;
      
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      return { questionFrequency: 0, topicDiversity: 0, complexityPreference: 0.5, formalityPreference: 0.5 };
    }
  }

  async summarizeConversationHistory(conversationHistory) {
    try {
      // Keep recent messages and summarize older ones
      const recentMessages = conversationHistory.slice(-10);
      const olderMessages = conversationHistory.slice(0, -10);
      
      if (olderMessages.length > 0) {
        // Create summary of older messages
        const summary = {
          text: `[Previous conversation summary: ${olderMessages.length} messages about various topics]`,
          timestamp: olderMessages[0].timestamp,
          type: 'summary',
          messageCount: olderMessages.length
        };
        
        return [summary, ...recentMessages];
      }
      
      return recentMessages;
      
    } catch (error) {
      console.error('Error summarizing conversation history:', error);
      return conversationHistory;
    }
  }

  // Utility methods
  async assessQuestionComplexity(question) {
    const words = question.split(' ');
    const complexWords = words.filter(word => word.length > 8);
    return Math.min(complexWords.length / words.length, 1.0);
  }

  async detectDomain(question) {
    const questionLower = question.toLowerCase();
    const domains = ['technology', 'science', 'business', 'health', 'education', 'arts', 'sports', 'travel', 'food'];
    return domains.find(domain => questionLower.includes(domain)) || 'general';
  }

  async detectQuestionType(question) {
    const questionLower = question.toLowerCase();
    if (questionLower.includes('what')) return 'factual';
    if (questionLower.includes('how')) return 'procedural';
    if (questionLower.includes('why')) return 'explanatory';
    if (questionLower.includes('when')) return 'temporal';
    if (questionLower.includes('where')) return 'spatial';
    if (questionLower.includes('who')) return 'identificational';
    return 'general';
  }

  // Storage and persistence methods
  async storeManagedContext(question, managedContext) {
    try {
      this.contextMemory.set(question, {
        context: managedContext,
        timestamp: Date.now(),
        accessCount: 0
      });
      
      // Limit memory size
      if (this.contextMemory.size > 100) {
        const oldestKey = this.contextMemory.keys().next().value;
        this.contextMemory.delete(oldestKey);
      }
      
    } catch (error) {
      console.error('Error storing managed context:', error);
    }
  }

  async loadContextData() {
    try {
      const contextData = await AsyncStorage.getItem('intelligent_context_data');
      if (contextData) {
        const data = JSON.parse(contextData);
        this.contextMemory = new Map(data.contextMemory || []);
        this.conversationHistory = new Map(data.conversationHistory || []);
        this.topicGraph = new Map(data.topicGraph || []);
        this.userPreferences = new Map(data.userPreferences || []);
      }
      
    } catch (error) {
      console.error('Error loading context data:', error);
    }
  }

  async saveContextData() {
    try {
      const data = {
        contextMemory: Array.from(this.contextMemory.entries()),
        conversationHistory: Array.from(this.conversationHistory.entries()),
        topicGraph: Array.from(this.topicGraph.entries()),
        userPreferences: Array.from(this.userPreferences.entries())
      };
      
      await AsyncStorage.setItem('intelligent_context_data', JSON.stringify(data));
      
    } catch (error) {
      console.error('Error saving context data:', error);
    }
  }

  // Context monitoring and optimization
  async initializeContextMonitoring() {
    try {
      setInterval(() => {
        this.monitorContextHealth();
      }, this.contextConfig.contextUpdateInterval);
      
    } catch (error) {
      console.error('Error initializing context monitoring:', error);
    }
  }

  async monitorContextHealth() {
    try {
      const health = {
        contextMemorySize: this.contextMemory.size,
        conversationHistorySize: this.conversationHistory.size,
        topicGraphSize: this.topicGraph.size,
        userPreferencesSize: this.userPreferences.size,
        timestamp: Date.now()
      };
      
      // Log health metrics
      await MetricsService.logEvent('context_health_monitor', health);
      
    } catch (error) {
      console.error('Error monitoring context health:', error);
    }
  }

  startContextOptimizationCycles() {
    try {
      // Context cleanup cycle
      setInterval(() => {
        this.cleanupOldContext();
      }, this.contextConfig.memoryRetentionDays * 24 * 60 * 60 * 1000);
      
      // Context save cycle
      setInterval(() => {
        this.saveContextData();
      }, this.contextConfig.contextUpdateInterval * 6);
      
    } catch (error) {
      console.error('Error starting context optimization cycles:', error);
    }
  }

  async cleanupOldContext() {
    try {
      const now = Date.now();
      const maxAge = this.contextConfig.memoryRetentionDays * 24 * 60 * 60 * 1000;
      
      // Clean up old context memory
      for (const [key, value] of this.contextMemory.entries()) {
        if (now - value.timestamp > maxAge) {
          this.contextMemory.delete(key);
        }
      }
      
      // Clean up old conversation history
      for (const [key, value] of this.conversationHistory.entries()) {
        if (now - value.timestamp > maxAge) {
          this.conversationHistory.delete(key);
        }
      }
      
    } catch (error) {
      console.error('Error cleaning up old context:', error);
    }
  }

  // Health status
  async getHealthStatus() {
    try {
      return {
        isInitialized: this.isInitialized,
        contextMemorySize: this.contextMemory.size,
        conversationHistorySize: this.conversationHistory.size,
        topicGraphSize: this.topicGraph.size,
        userPreferencesSize: this.userPreferences.size,
        maxContextLength: this.contextConfig.maxContextLength,
        lastUpdate: Date.now()
      };
      
    } catch (error) {
      console.error('Error getting health status:', error);
      return {
        isInitialized: false,
        error: error.message
      };
    }
  }
}

export default new IntelligentContextManagementService();
