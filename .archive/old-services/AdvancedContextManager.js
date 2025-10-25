import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';

class AdvancedContextManager {
  constructor() {
    this.semanticMemory = new Map();
    this.importanceScores = new Map();
    this.contextWindow = 50; // Increased from 10
    this.maxMemoryEntries = 1000;
    this.importanceThreshold = 0.3;
    this.isInitialized = false;
    
    // Context types and their importance weights
    this.contextTypes = {
      user_preference: 0.9,
      important_fact: 0.8,
      task_context: 0.7,
      conversation_flow: 0.6,
      domain_knowledge: 0.5,
      general_context: 0.3
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load semantic memory from storage
      const storedMemory = await AsyncStorage.getItem('semantic_memory');
      if (storedMemory) {
        const parsed = JSON.parse(storedMemory);
        this.semanticMemory = new Map(parsed.entries);
        this.importanceScores = new Map(parsed.importanceScores);
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing AdvancedContextManager:', error);
    }
  }

  async storeContext(contextData, importance = 0.5, type = 'general_context') {
    await this.initialize();
    
    const contextId = this.generateContextId(contextData);
    const timestamp = Date.now();
    
    // Calculate importance score
    const calculatedImportance = this.calculateImportance(contextData, importance, type);
    
    // Store in semantic memory
    const contextEntry = {
      id: contextId,
      data: contextData,
      type,
      importance: calculatedImportance,
      timestamp,
      accessCount: 0,
      lastAccessed: timestamp,
      keywords: this.extractKeywords(contextData),
      embeddings: await this.generateEmbeddings(contextData)
    };
    
    this.semanticMemory.set(contextId, contextEntry);
    this.importanceScores.set(contextId, calculatedImportance);
    
    // Maintain memory size
    await this.maintainMemorySize();
    
    // Persist to storage
    await this.persistMemory();
    
    return contextId;
  }

  async retrieveRelevantContext(query, limit = 10, minImportance = 0.3) {
    await this.initialize();
    
    const queryKeywords = this.extractKeywords(query);
    const queryEmbeddings = await this.generateEmbeddings(query);
    
    const relevantContexts = [];
    
    for (const [id, entry] of this.semanticMemory) {
      if (entry.importance < minImportance) continue;
      
      // Calculate relevance score
      const relevanceScore = this.calculateRelevance(entry, queryKeywords, queryEmbeddings);
      
      if (relevanceScore > 0.3) {
        relevantContexts.push({
          ...entry,
          relevanceScore,
          recencyScore: this.calculateRecencyScore(entry.timestamp),
          accessScore: this.calculateAccessScore(entry.accessCount, entry.lastAccessed)
        });
      }
    }
    
    // Sort by combined score (relevance + importance + recency + access)
    relevantContexts.sort((a, b) => {
      const scoreA = this.calculateCombinedScore(a);
      const scoreB = this.calculateCombinedScore(b);
      return scoreB - scoreA;
    });
    
    // Update access statistics
    for (const context of relevantContexts.slice(0, limit)) {
      await this.updateAccessStats(context.id);
    }
    
    return relevantContexts.slice(0, limit);
  }

  async buildEnhancedContext(message, additionalContext = {}) {
    await this.initialize();
    
    const baseContext = {
      messageHistory: additionalContext.messageHistory || [],
      userContext: additionalContext.userContext || {},
      timestamp: new Date().toISOString(),
      platform: additionalContext.platform || 'unknown'
    };
    
    // Retrieve relevant semantic context
    const relevantContexts = await this.retrieveRelevantContext(message, 5);
    
    // Build conversation flow context
    const conversationFlow = this.buildConversationFlow(baseContext.messageHistory);
    
    // Build user preference context
    const userPreferences = await this.getUserPreferences();
    
    // Build domain context
    const domainContext = this.buildDomainContext(message, relevantContexts);
    
    return {
      ...baseContext,
      semanticContext: relevantContexts,
      conversationFlow,
      userPreferences,
      domainContext,
      contextComplexity: this.calculateContextComplexity(baseContext),
      totalContextSize: this.calculateTotalContextSize(baseContext, relevantContexts)
    };
  }

  calculateImportance(contextData, baseImportance, type) {
    let importance = baseImportance;
    
    // Apply type weight
    importance *= this.contextTypes[type] || 0.3;
    
    // Content-based importance
    if (typeof contextData === 'string') {
      if (contextData.length > 200) importance += 0.1; // Longer content is more important
      if (contextData.includes('important') || contextData.includes('critical')) importance += 0.2;
      if (contextData.includes('preference') || contextData.includes('like')) importance += 0.15;
    }
    
    // Recency factor (newer is slightly more important)
    const age = Date.now() - (contextData.timestamp || Date.now());
    const ageInDays = age / (1000 * 60 * 60 * 24);
    if (ageInDays < 1) importance += 0.1;
    else if (ageInDays < 7) importance += 0.05;
    
    return Math.min(importance, 1.0);
  }

  calculateRelevance(entry, queryKeywords, queryEmbeddings) {
    let relevance = 0;
    
    // Keyword matching
    const keywordMatches = queryKeywords.filter(keyword => 
      entry.keywords.includes(keyword)
    ).length;
    relevance += (keywordMatches / Math.max(queryKeywords.length, 1)) * 0.4;
    
    // Semantic similarity (simplified)
    if (entry.embeddings && queryEmbeddings) {
      const similarity = this.calculateCosineSimilarity(entry.embeddings, queryEmbeddings);
      relevance += similarity * 0.6;
    }
    
    return Math.min(relevance, 1.0);
  }

  calculateCombinedScore(context) {
    const relevanceWeight = 0.4;
    const importanceWeight = 0.3;
    const recencyWeight = 0.2;
    const accessWeight = 0.1;
    
    return (
      context.relevanceScore * relevanceWeight +
      context.importance * importanceWeight +
      context.recencyScore * recencyWeight +
      context.accessScore * accessWeight
    );
  }

  calculateRecencyScore(timestamp) {
    const age = Date.now() - timestamp;
    const ageInHours = age / (1000 * 60 * 60);
    
    // Exponential decay: newer is better
    return Math.exp(-ageInHours / 24); // Half-life of 24 hours
  }

  calculateAccessScore(accessCount, lastAccessed) {
    const recency = this.calculateRecencyScore(lastAccessed);
    const frequency = Math.log(accessCount + 1) / Math.log(10); // Log scale
    
    return (recency + frequency) / 2;
  }

  buildConversationFlow(messageHistory) {
    if (!messageHistory || messageHistory.length === 0) return {};
    
    const flow = {
      totalMessages: messageHistory.length,
      recentTopics: [],
      conversationPattern: 'linear',
      userEngagement: 'medium'
    };
    
    // Extract recent topics
    const recentMessages = messageHistory.slice(-10);
    const topics = new Set();
    
    recentMessages.forEach(msg => {
      if (msg.text) {
        const words = msg.text.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 4 && !this.isCommonWord(word)) {
            topics.add(word);
          }
        });
      }
    });
    
    flow.recentTopics = Array.from(topics).slice(0, 5);
    
    // Analyze conversation pattern
    if (messageHistory.length > 5) {
      const userMessages = messageHistory.filter(msg => msg.sender === 'user');
      const botMessages = messageHistory.filter(msg => msg.sender === 'bot');
      
      if (userMessages.length > botMessages.length * 1.5) {
        flow.conversationPattern = 'user_dominant';
        flow.userEngagement = 'high';
      } else if (botMessages.length > userMessages.length * 1.5) {
        flow.conversationPattern = 'bot_dominant';
        flow.userEngagement = 'low';
      }
    }
    
    return flow;
  }

  async getUserPreferences() {
    try {
      const stored = await AsyncStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {};
    }
  }

  buildDomainContext(message, relevantContexts) {
    const domains = new Set();
    const domainKeywords = {
      technology: ['code', 'programming', 'software', 'tech', 'ai', 'machine learning'],
      business: ['business', 'market', 'finance', 'strategy', 'management'],
      health: ['health', 'medical', 'fitness', 'wellness', 'treatment'],
      education: ['learn', 'study', 'education', 'academic', 'research'],
      creative: ['art', 'design', 'creative', 'music', 'writing', 'innovation']
    };
    
    // Analyze message for domain
    const messageText = typeof message === 'string' ? message : message.text || '';
    const words = messageText.toLowerCase().split(' ');
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        domains.add(domain);
      }
    }
    
    // Analyze relevant contexts for domain
    relevantContexts.forEach(context => {
      if (context.type === 'domain_knowledge') {
        domains.add(context.data.domain || 'general');
      }
    });
    
    return {
      detectedDomains: Array.from(domains),
      confidence: domains.size > 0 ? 0.8 : 0.3,
      relevantKnowledge: relevantContexts.filter(ctx => ctx.type === 'domain_knowledge')
    };
  }

  calculateContextComplexity(context) {
    let complexity = 0;
    
    if (context.messageHistory && context.messageHistory.length > 10) complexity += 0.3;
    if (context.userContext && Object.keys(context.userContext).length > 5) complexity += 0.2;
    if (context.semanticContext && context.semanticContext.length > 3) complexity += 0.3;
    if (context.domainContext && context.domainContext.detectedDomains.length > 1) complexity += 0.2;
    
    return Math.min(complexity, 1.0);
  }

  calculateTotalContextSize(context, semanticContexts) {
    let size = 0;
    
    if (context.messageHistory) {
      size += context.messageHistory.reduce((acc, msg) => acc + (msg.text?.length || 0), 0);
    }
    
    if (semanticContexts) {
      size += semanticContexts.reduce((acc, ctx) => acc + (ctx.data?.length || 0), 0);
    }
    
    return size;
  }

  async updateAccessStats(contextId) {
    const entry = this.semanticMemory.get(contextId);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.semanticMemory.set(contextId, entry);
    }
  }

  async maintainMemorySize() {
    if (this.semanticMemory.size <= this.maxMemoryEntries) return;
    
    // Sort by combined score and remove least important entries
    const entries = Array.from(this.semanticMemory.entries());
    entries.sort((a, b) => {
      const scoreA = this.calculateCombinedScore(a[1]);
      const scoreB = this.calculateCombinedScore(b[1]);
      return scoreA - scoreB;
    });
    
    // Remove bottom 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.semanticMemory.delete(entries[i][0]);
      this.importanceScores.delete(entries[i][0]);
    }
  }

  async persistMemory() {
    try {
      const data = {
        entries: Array.from(this.semanticMemory.entries()),
        importanceScores: Array.from(this.importanceScores.entries())
      };
      await AsyncStorage.setItem('semantic_memory', JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting memory:', error);
    }
  }

  generateContextId(contextData) {
    const dataString = typeof contextData === 'string' ? contextData : JSON.stringify(contextData);
    return `ctx_${Date.now()}_${dataString.slice(0, 20).replace(/\s/g, '_')}`;
  }

  extractKeywords(text) {
    if (typeof text !== 'string') return [];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isCommonWord(word));
    
    // Remove duplicates and return top 10
    return [...new Set(words)].slice(0, 10);
  }

  isCommonWord(word) {
    const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'oil', 'sit', 'try', 'use', 'she', 'put', 'end', 'why', 'let', 'ask', 'run', 'own', 'say', 'too', 'any', 'may', 'set', 'off', 'far', 'sea', 'eye', 'yet', 'eat', 'air', 'son', 'car', 'bed', 'top', 'red', 'dog', 'hot', 'sun', 'cup', 'fun', 'ten', 'big', 'yes', 'try', 'her', 'now', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who'];
    return commonWords.includes(word);
  }

  async generateEmbeddings(text) {
    // Simplified embedding generation (in real implementation, use a proper embedding model)
    if (typeof text !== 'string') return [];
    
    const words = text.toLowerCase().split(/\s+/);
    const embeddings = new Array(50).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = hash % 50;
      embeddings[position] += 1 / (index + 1); // Position-weighted
    });
    
    // Normalize
    const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
    return embeddings.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  calculateCosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async getMemoryStats() {
    await this.initialize();
    
    return {
      totalEntries: this.semanticMemory.size,
      averageImportance: Array.from(this.importanceScores.values()).reduce((a, b) => a + b, 0) / this.importanceScores.size,
      memoryUtilization: this.semanticMemory.size / this.maxMemoryEntries,
      contextTypes: Object.keys(this.contextTypes).reduce((acc, type) => {
        acc[type] = Array.from(this.semanticMemory.values()).filter(entry => entry.type === type).length;
        return acc;
      }, {})
    };
  }
}

export default new AdvancedContextManager();
