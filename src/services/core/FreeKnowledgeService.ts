/**
 * Free Knowledge Service
 * Collects knowledge from free sources, learns from user interactions,
 * and provides personalized AI without paid APIs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DataService from './DataService';
import UserLearningService from './UserLearningService';

interface KnowledgeSource {
  url: string;
  type: 'wikipedia' | 'free-api' | 'rss' | 'scrape';
  trustScore: number; // 0-10
}

interface UserKnowledgeBase {
  userId: string;
  facts: Map<string, {content: string; source: string; confidence: number}>;
  learnedPatterns: Map<string, string[]>;
  topicExpertise: Map<string, number>; // How much user knows about each topic
  conversationExamples: Array<{input: string; goodResponse: string}>;
  lastUpdated: number;
}

export class FreeKnowledgeService {
  private static instance: FreeKnowledgeService;
  private userKnowledgeBase: Map<string, UserKnowledgeBase> = new Map();
  private globalKnowledge: Map<string, any> = new Map();
  
  // Trusted free sources
  private trustedSources: KnowledgeSource[] = [
    {url: 'https://en.wikipedia.org/api/rest_v1/', type: 'wikipedia', trustScore: 9},
    {url: 'https://www.wikidata.org/w/api.php', type: 'free-api', trustScore: 9},
    {url: 'https://openlibrary.org/api/', type: 'free-api', trustScore: 8},
    {url: 'https://api.dictionaryapi.dev/api/v2/', type: 'free-api', trustScore: 9},
  ];

  private constructor() {
    this.initializeGlobalKnowledge();
  }

  static getInstance(): FreeKnowledgeService {
    if (!FreeKnowledgeService.instance) {
      FreeKnowledgeService.instance = new FreeKnowledgeService();
    }
    return FreeKnowledgeService.instance;
  }

  // ============================================
  // User-Specific Learning
  // ============================================

  async initializeUser(userId: string): Promise<void> {
    // Load user's personal knowledge base
    const stored = await DataService.get<any>(`knowledge_${userId}`);
    
    if (stored) {
      this.userKnowledgeBase.set(userId, {
        userId,
        facts: new Map(Object.entries(stored.facts || {})),
        learnedPatterns: new Map(Object.entries(stored.learnedPatterns || {})),
        topicExpertise: new Map(Object.entries(stored.topicExpertise || {})),
        conversationExamples: stored.conversationExamples || [],
        lastUpdated: stored.lastUpdated || Date.now()
      });
    } else {
      this.userKnowledgeBase.set(userId, {
        userId,
        facts: new Map(),
        learnedPatterns: new Map(),
        topicExpertise: new Map(),
        conversationExamples: [],
        lastUpdated: Date.now()
      });
    }
  }

  async learnFromInteraction(
    userId: string,
    userInput: string,
    mottoResponse: string,
    wasHelpful: boolean
  ): Promise<void> {
    const userKB = this.userKnowledgeBase.get(userId);
    if (!userKB) {
      await this.initializeUser(userId);
      return this.learnFromInteraction(userId, userInput, mottoResponse, wasHelpful);
    }

    // Extract facts from conversation
    const facts = this.extractFacts(userInput, mottoResponse);
    facts.forEach(fact => {
      userKB.facts.set(fact.key, {
        content: fact.content,
        source: 'user_conversation',
        confidence: wasHelpful ? 0.9 : 0.5
      });
    });

    // Store good response patterns
    if (wasHelpful) {
      userKB.conversationExamples.push({
        input: userInput,
        goodResponse: mottoResponse
      });
      
      // Keep only best 100 examples
      if (userKB.conversationExamples.length > 100) {
        userKB.conversationExamples.shift();
      }
    }

    // Update topic expertise
    const topics = this.extractTopics(userInput);
    topics.forEach(topic => {
      const current = userKB.topicExpertise.get(topic) || 0;
      userKB.topicExpertise.set(topic, Math.min(10, current + 0.1));
    });

    userKB.lastUpdated = Date.now();
    await this.saveUserKnowledge(userId);
  }

  // ============================================
  // Free Knowledge Sources
  // ============================================

  async searchWikipedia(query: string): Promise<{
    title: string;
    extract: string;
    url: string;
  } | null> {
    try {
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        title: data.title,
        extract: data.extract,
        url: data.content_urls?.desktop?.page || ''
      };
    } catch (error) {
      console.error('Wikipedia search failed:', error);
      return null;
    }
  }

  async lookupDefinition(word: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const definition = data[0]?.meanings[0]?.definitions[0]?.definition;
      
      return definition || null;
    } catch (error) {
      return null;
    }
  }

  async searchBooks(query: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
      );
      
      const data = await response.json();
      return data.docs.slice(0, 5).map((book: any) => ({
        title: book.title,
        author: book.author_name?.[0],
        year: book.first_publish_year
      }));
    } catch (error) {
      return [];
    }
  }

  // ============================================
  // Intelligent Response with Free Sources
  // ============================================

  async generateKnowledgeableResponse(
    userId: string,
    userInput: string
  ): Promise<string> {
    // 1. Check user's personal knowledge base
    const userKnowledge = await this.searchUserKnowledge(userId, userInput);
    
    // 2. Check if we should search external sources
    const needsExternalInfo = this.detectNeedsExternalInfo(userInput);
    
    let externalInfo = '';
    if (needsExternalInfo) {
      // Try Wikipedia first (most reliable free source)
      const wikiResult = await this.searchWikipedia(userInput);
      if (wikiResult) {
        externalInfo = `\n\nFrom Wikipedia: ${wikiResult.extract}`;
      }
      
      // If asking for definition
      if (userInput.toLowerCase().includes('what is') || userInput.toLowerCase().includes('define')) {
        const words = userInput.split(' ');
        for (const word of words) {
          if (word.length > 4) {
            const def = await this.lookupDefinition(word);
            if (def) {
              externalInfo += `\n\nDefinition of ${word}: ${def}`;
              break;
            }
          }
        }
      }
    }
    
    // 3. Use similar past conversations
    const similarConversations = this.findSimilarConversations(userId, userInput);
    
    // 4. Build comprehensive response
    let response = '';
    
    if (userKnowledge) {
      response += userKnowledge + '\n\n';
    }
    
    if (externalInfo) {
      response += externalInfo;
    } else if (similarConversations.length > 0) {
      response += similarConversations[0].goodResponse;
    }
    
    return response || this.generateFallbackResponse(userInput);
  }

  // ============================================
  // Pattern Matching & Learning
  // ============================================

  private extractFacts(userInput: string, response: string): Array<{key: string; content: string}> {
    const facts: Array<{key: string; content: string}> = [];
    
    // Extract declarative statements
    const sentences = (userInput + ' ' + response).split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      const cleaned = sentence.trim();
      
      // Facts usually contain "is", "are", "was", "were"
      if (cleaned.match(/\b(is|are|was|were|means|refers to)\b/i)) {
        const key = cleaned.substring(0, 50).toLowerCase().replace(/[^\w\s]/g, '');
        facts.push({key, content: cleaned});
      }
    });
    
    return facts;
  }

  private extractTopics(text: string): string[] {
    const topics: Set<string> = new Set();
    const lowerText = text.toLowerCase();
    
    const topicKeywords = {
      'programming': ['code', 'program', 'software', 'developer'],
      'python': ['python', 'py', 'django', 'flask'],
      'javascript': ['javascript', 'js', 'react', 'node'],
      'ai': ['ai', 'artificial intelligence', 'machine learning', 'neural'],
      'science': ['science', 'physics', 'chemistry', 'biology'],
      'health': ['health', 'medical', 'fitness', 'diet'],
      'business': ['business', 'startup', 'entrepreneur', 'marketing'],
      'math': ['math', 'mathematics', 'algebra', 'calculus'],
      'history': ['history', 'historical', 'ancient', 'war'],
      'art': ['art', 'painting', 'music', 'creative']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => lowerText.includes(kw))) {
        topics.add(topic);
      }
    });
    
    return Array.from(topics);
  }

  private detectNeedsExternalInfo(userInput: string): boolean {
    const lowerInput = userInput.toLowerCase();
    
    // Keywords that suggest needing external lookup
    const externalKeywords = [
      'what is', 'who is', 'define', 'explain', 'tell me about',
      'how does', 'why does', 'history of', 'facts about',
      'information on', 'learn about', 'know about'
    ];
    
    return externalKeywords.some(kw => lowerInput.includes(kw));
  }

  private async searchUserKnowledge(userId: string, query: string): Promise<string | null> {
    const userKB = this.userKnowledgeBase.get(userId);
    if (!userKB) return null;
    
    const queryLower = query.toLowerCase();
    
    // Search facts
    for (const [key, fact] of userKB.facts.entries()) {
      if (queryLower.includes(key) || key.includes(queryLower.substring(0, 20))) {
        return `Based on what you told me: ${fact.content}`;
      }
    }
    
    return null;
  }

  private findSimilarConversations(userId: string, query: string): any[] {
    const userKB = this.userKnowledgeBase.get(userId);
    if (!userKB) return [];
    
    const queryLower = query.toLowerCase();
    const similar: any[] = [];
    
    userKB.conversationExamples.forEach(example => {
      const inputLower = example.input.toLowerCase();
      
      // Simple similarity: count common words
      const queryWords = queryLower.split(' ').filter(w => w.length > 3);
      const inputWords = inputLower.split(' ');
      const commonWords = queryWords.filter(w => inputWords.includes(w));
      
      if (commonWords.length >= 2) {
        similar.push({
          ...example,
          similarity: commonWords.length / queryWords.length
        });
      }
    });
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  // ============================================
  // Continuous Knowledge Collection
  // ============================================

  async collectKnowledgeFromWeb(topic: string): Promise<void> {
    console.log(`📚 Collecting knowledge about: ${topic}`);
    
    // Wikipedia
    const wikiInfo = await this.searchWikipedia(topic);
    if (wikiInfo) {
      this.globalKnowledge.set(`wiki_${topic}`, {
        content: wikiInfo.extract,
        source: 'wikipedia',
        timestamp: Date.now(),
        trustScore: 9
      });
    }
    
    // Store for offline use
    await DataService.set(`global_knowledge_${topic}`, {
      topic,
      data: wikiInfo,
      cached: Date.now()
    }, {ttl: 7 * 24 * 60 * 60 * 1000}); // Cache 7 days
  }

  async getKnowledge(topic: string, useCache: boolean = true): Promise<any> {
    // Check cache first
    if (useCache) {
      const cached = await DataService.get(`global_knowledge_${topic}`);
      if (cached) {
        return cached.data;
      }
    }
    
    // Fetch fresh
    await this.collectKnowledgeFromWeb(topic);
    return this.globalKnowledge.get(`wiki_${topic}`);
  }

  // ============================================
  // Privacy-Protected Data Storage
  // ============================================

  private async saveUserKnowledge(userId: string): Promise<void> {
    const userKB = this.userKnowledgeBase.get(userId);
    if (!userKB) return;
    
    // Convert Maps to objects for storage
    const storableData = {
      userId: userKB.userId,
      facts: Object.fromEntries(userKB.facts),
      learnedPatterns: Object.fromEntries(userKB.learnedPatterns),
      topicExpertise: Object.fromEntries(userKB.topicExpertise),
      conversationExamples: userKB.conversationExamples,
      lastUpdated: userKB.lastUpdated
    };
    
    // Store locally - never sent to external servers
    await DataService.set(`knowledge_${userId}`, storableData);
    
    console.log(`🔒 User ${userId} knowledge saved locally (${userKB.facts.size} facts)`);
  }

  async exportUserData(userId: string): Promise<string> {
    const userKB = this.userKnowledgeBase.get(userId);
    if (!userKB) return '{}';
    
    return JSON.stringify({
      userId: userKB.userId,
      totalFacts: userKB.facts.size,
      facts: Object.fromEntries(userKB.facts),
      topicExpertise: Object.fromEntries(userKB.topicExpertise),
      conversationCount: userKB.conversationExamples.length,
      lastUpdated: new Date(userKB.lastUpdated).toISOString()
    }, null, 2);
  }

  async deleteUserData(userId: string): Promise<void> {
    this.userKnowledgeBase.delete(userId);
    await DataService.remove(`knowledge_${userId}`);
    console.log(`🗑️ User ${userId} data completely deleted`);
  }

  // ============================================
  // Intelligent Response Generation (FREE)
  // ============================================

  async generateIntelligentResponse(
    userId: string,
    userInput: string,
    conversationHistory: any[]
  ): Promise<string> {
    // 1. Check user's personal knowledge
    const userKnowledge = await this.searchUserKnowledge(userId, userInput);
    
    // 2. Search similar past conversations
    const similar = this.findSimilarConversations(userId, userInput);
    
    // 3. Check global knowledge cache
    const topics = this.extractTopics(userInput);
    let externalKnowledge = '';
    
    for (const topic of topics) {
      const knowledge = await this.getKnowledge(topic);
      if (knowledge) {
        externalKnowledge += `\n${knowledge.content}\n`;
      }
    }
    
    // 4. Build response from collected knowledge
    let response = '';
    
    if (userKnowledge) {
      response = userKnowledge;
    } else if (externalKnowledge) {
      response = this.synthesizeResponse(userInput, externalKnowledge);
    } else if (similar.length > 0) {
      response = this.adaptSimilarResponse(userInput, similar[0]);
    } else {
      response = await this.generateFallbackResponse(userInput);
    }
    
    return response;
  }

  private synthesizeResponse(question: string, knowledge: string): string {
    // Extract relevant parts
    const sentences = knowledge.split(/[.!?]+/);
    const relevant = sentences.slice(0, 3).join('. ') + '.';
    
    return `Based on trusted sources: ${relevant}\n\nWould you like to know more about this?`;
  }

  private adaptSimilarResponse(newInput: string, similarExample: any): string {
    // Adapt previous good response to new question
    let adapted = similarExample.goodResponse;
    
    // Replace key terms
    const oldWords = similarExample.input.toLowerCase().split(' ');
    const newWords = newInput.toLowerCase().split(' ');
    
    oldWords.forEach((oldWord, i) => {
      if (oldWord.length > 4 && newWords[i] && newWords[i].length > 4) {
        adapted = adapted.replace(new RegExp(oldWord, 'gi'), newWords[i]);
      }
    });
    
    return adapted;
  }

  private async generateFallbackResponse(userInput: string): Promise<string> {
    // Use learned patterns and user preferences
    const insights = UserLearningService.getUserInsights();
    
    const responses = [
      `That's an interesting question about ${userInput.substring(0, 30)}. Let me think about that...`,
      `I'm still learning about this topic. Could you tell me more so I can better understand?`,
      `That's a great question! Based on what I know, I'd say... Actually, could you help me understand what specific aspect you're most curious about?`,
      `Hmm, I want to give you the best answer. Could you rephrase that or give me a bit more context?`
    ];
    
    if (insights.totalInteractions > 50) {
      responses.push(`We've talked about ${insights.favoriteTopics.join(', ')} before - is this related to any of those?`);
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ============================================
  // Privacy & Data Protection
  // ============================================

  async getUserDataSummary(userId: string): Promise<{
    totalFacts: number;
    topics: string[];
    conversationCount: number;
    dataSize: string;
    lastUpdated: string;
    isLocal: boolean;
  }> {
    const userKB = this.userKnowledgeBase.get(userId);
    
    if (!userKB) {
      return {
        totalFacts: 0,
        topics: [],
        conversationCount: 0,
        dataSize: '0 KB',
        lastUpdated: 'Never',
        isLocal: true
      };
    }
    
    const dataString = JSON.stringify(userKB);
    const sizeKB = (dataString.length / 1024).toFixed(2);
    
    return {
      totalFacts: userKB.facts.size,
      topics: Array.from(userKB.topicExpertise.keys()),
      conversationCount: userKB.conversationExamples.length,
      dataSize: `${sizeKB} KB`,
      lastUpdated: new Date(userKB.lastUpdated).toLocaleString(),
      isLocal: true // Never sent to cloud!
    };
  }

  // ============================================
  // Global Knowledge Building
  // ============================================

  private async initializeGlobalKnowledge(): Promise<void> {
    // Pre-load common topics
    const commonTopics = [
      'artificial intelligence', 'python programming', 'javascript',
      'machine learning', 'web development', 'data science',
      'health', 'nutrition', 'exercise', 'productivity'
    ];
    
    // Load cached knowledge
    for (const topic of commonTopics) {
      const cached = await DataService.get(`global_knowledge_${topic}`);
      if (cached) {
        this.globalKnowledge.set(`wiki_${topic}`, cached.data);
      }
    }
    
    console.log(`📚 Loaded ${this.globalKnowledge.size} topics from cache`);
  }

  async preloadTopics(topics: string[]): Promise<void> {
    console.log(`📥 Pre-loading ${topics.length} topics...`);
    
    for (const topic of topics) {
      await this.collectKnowledgeFromWeb(topic);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Pre-loaded ${topics.length} topics`);
  }

  // ============================================
  // Analytics & Insights
  // ============================================

  getUserExpertise(userId: string): Map<string, number> {
    const userKB = this.userKnowledgeBase.get(userId);
    return userKB?.topicExpertise || new Map();
  }

  getGlobalKnowledgeStats(): {
    totalTopics: number;
    totalUsers: number;
    cacheSize: number;
  } {
    return {
      totalTopics: this.globalKnowledge.size,
      totalUsers: this.userKnowledgeBase.size,
      cacheSize: this.globalKnowledge.size
    };
  }
}

export default FreeKnowledgeService.getInstance();
