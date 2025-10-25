// Semantic Search Engine - Advanced semantic matching and relevance scoring
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsService } from './MetricsService';
import { ErrorManager } from './ErrorManager';

class SemanticSearchEngine {
  constructor() {
    this.isInitialized = false;
    this.searchCapabilities = {
      vectorSimilarity: true,
      semanticMatching: true,
      contextAwareness: true,
      relevanceScoring: true,
      fuzzyMatching: true,
      intentRecognition: true,
      entityExtraction: true,
      relationshipMapping: true,
      dynamicRanking: true,
      personalization: true
    };
    
    this.searchIndex = {
      documents: {},
      vectors: {},
      entities: {},
      relationships: {},
      contexts: {}
    };
    
    this.searchConfig = {
      similarityThreshold: 0.7,
      maxResults: 10,
      contextWeight: 0.3,
      semanticWeight: 0.4,
      personalizationWeight: 0.2,
      recencyWeight: 0.1,
      fuzzyThreshold: 0.8,
      entityBoost: 1.2,
      relationshipBoost: 1.1
    };
    
    this.searchHistory = [];
    this.userSearchPatterns = {};
    this.searchPerformance = {
      averageSearchTime: 0,
      totalSearches: 0,
      cacheHitRate: 0
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadSearchData();
      await this.buildSearchIndex();
      await this.loadUserSearchPatterns();
      
      this.isInitialized = true;
      console.log('✅ Semantic Search Engine initialized');
      
      await MetricsService.logEvent('semantic_search_engine_initialized', {
        searchCapabilities: Object.keys(this.searchCapabilities).filter(k => this.searchCapabilities[k]),
        indexedDocuments: Object.keys(this.searchIndex.documents).length,
        searchConfig: this.searchConfig
      });
    } catch (error) {
      console.error('❌ Failed to initialize Semantic Search Engine:', error);
      await ErrorManager.handleError(error, { context: 'SemanticSearchEngine.initialize' });
      throw error;
    }
  }

  // Semantic Search
  async performSemanticSearch(query, context = {}, options = {}) {
    try {
      const searchResult = {
        timestamp: Date.now(),
        query: query,
        context: context,
        options: options,
        analysis: await this.analyzeQuery(query, context),
        searchResults: [],
        searchMetrics: {
          searchTime: 0,
          totalMatches: 0,
          averageRelevance: 0,
          cacheHit: false
        },
        suggestions: [],
        relatedQueries: []
      };

      const startTime = Date.now();
      
      // Check cache first
      const cachedResult = await this.getCachedSearchResult(query, context);
      if (cachedResult && !options.forceRefresh) {
        searchResult.searchResults = cachedResult.results;
        searchResult.searchMetrics.cacheHit = true;
        searchResult.searchMetrics.searchTime = Date.now() - startTime;
        return searchResult;
      }

      // Perform semantic search
      searchResult.searchResults = await this.executeSemanticSearch(query, context, options);
      
      // Calculate metrics
      searchResult.searchMetrics = {
        searchTime: Date.now() - startTime,
        totalMatches: searchResult.searchResults.length,
        averageRelevance: searchResult.searchResults.reduce((sum, r) => sum + r.relevanceScore, 0) / searchResult.searchResults.length,
        cacheHit: false
      };

      // Generate suggestions
      searchResult.suggestions = await this.generateSearchSuggestions(query, context);
      
      // Find related queries
      searchResult.relatedQueries = await this.findRelatedQueries(query, context);
      
      // Cache results
      await this.cacheSearchResult(query, context, searchResult.searchResults);
      
      // Update search history
      await this.updateSearchHistory(query, context, searchResult);

      return searchResult;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      await ErrorManager.handleError(error, { context: 'SemanticSearchEngine.performSemanticSearch' });
      throw error;
    }
  }

  async analyzeQuery(query, context) {
    return {
      intent: await this.identifySearchIntent(query),
      entities: await this.extractEntities(query),
      keywords: await this.extractKeywords(query),
      concepts: await this.extractConcepts(query),
      context: await this.analyzeContext(context),
      complexity: await this.assessQueryComplexity(query),
      urgency: await this.assessQueryUrgency(query, context)
    };
  }

  async executeSemanticSearch(query, context, options) {
    const results = [];
    
    // Get query vector
    const queryVector = await this.generateQueryVector(query, context);
    
    // Search through indexed documents
    for (const [docId, document] of Object.entries(this.searchIndex.documents)) {
      const documentVector = this.searchIndex.vectors[docId];
      if (!documentVector) continue;
      
      // Calculate semantic similarity
      const semanticSimilarity = await this.calculateSemanticSimilarity(queryVector, documentVector);
      
      // Calculate context relevance
      const contextRelevance = await this.calculateContextRelevance(document, context);
      
      // Calculate entity matches
      const entityMatches = await this.calculateEntityMatches(query, document);
      
      // Calculate relationship relevance
      const relationshipRelevance = await this.calculateRelationshipRelevance(query, document);
      
      // Calculate personalization score
      const personalizationScore = await this.calculatePersonalizationScore(document, context);
      
      // Calculate recency score
      const recencyScore = await this.calculateRecencyScore(document);
      
      // Combine scores
      const relevanceScore = (
        semanticSimilarity * this.searchConfig.semanticWeight +
        contextRelevance * this.searchConfig.contextWeight +
        entityMatches * this.searchConfig.entityBoost +
        relationshipRelevance * this.searchConfig.relationshipBoost +
        personalizationScore * this.searchConfig.personalizationWeight +
        recencyScore * this.searchConfig.recencyWeight
      ) / (
        this.searchConfig.semanticWeight +
        this.searchConfig.contextWeight +
        this.searchConfig.personalizationWeight +
        this.searchConfig.recencyWeight +
        this.searchConfig.entityBoost +
        this.searchConfig.relationshipBoost
      );

      if (relevanceScore >= this.searchConfig.similarityThreshold) {
        results.push({
          documentId: docId,
          document: document,
          relevanceScore: relevanceScore,
          semanticSimilarity: semanticSimilarity,
          contextRelevance: contextRelevance,
          entityMatches: entityMatches,
          relationshipRelevance: relationshipRelevance,
          personalizationScore: personalizationScore,
          recencyScore: recencyScore,
          matchReasons: await this.identifyMatchReasons(query, document, context)
        });
      }
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Apply result limits
    const maxResults = options.maxResults || this.searchConfig.maxResults;
    return results.slice(0, maxResults);
  }

  // Vector Operations
  async generateQueryVector(query, context) {
    const queryWords = await this.tokenizeQuery(query);
    const contextWords = await this.extractContextWords(context);
    const allWords = [...queryWords, ...contextWords];
    
    // Generate vector representation
    const vector = new Array(300).fill(0); // 300-dimensional vector
    
    for (const word of allWords) {
      const wordVector = await this.getWordVector(word);
      for (let i = 0; i < vector.length; i++) {
        vector[i] += wordVector[i];
      }
    }
    
    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude;
      }
    }
    
    return vector;
  }

  async calculateSemanticSimilarity(vector1, vector2) {
    if (vector1.length !== vector2.length) return 0;
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  // Entity and Relationship Analysis
  async extractEntities(query) {
    const entities = [];
    const words = query.toLowerCase().split(' ');
    
    // Simple entity extraction - can be enhanced with NER models
    const entityPatterns = {
      person: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      organization: /\b[A-Z][a-z]+ (Inc|Corp|LLC|Ltd|Company|Corporation)\b/g,
      technology: /\b(React|JavaScript|Python|AI|ML|API|SQL|NoSQL)\b/g,
      concept: /\b(algorithm|database|framework|architecture|design|pattern)\b/g
    };
    
    for (const [type, pattern] of Object.entries(entityPatterns)) {
      const matches = query.match(pattern);
      if (matches) {
        entities.push(...matches.map(match => ({ type, value: match })));
      }
    }
    
    return entities;
  }

  async calculateEntityMatches(query, document) {
    const queryEntities = await this.extractEntities(query);
    const documentEntities = await this.extractEntities(document.content || '');
    
    if (queryEntities.length === 0) return 0;
    
    let matches = 0;
    for (const queryEntity of queryEntities) {
      for (const docEntity of documentEntities) {
        if (queryEntity.type === docEntity.type && 
            queryEntity.value.toLowerCase() === docEntity.value.toLowerCase()) {
          matches++;
        }
      }
    }
    
    return matches / queryEntities.length;
  }

  async calculateRelationshipRelevance(query, document) {
    const queryConcepts = await this.extractConcepts(query);
    const documentConcepts = await this.extractConcepts(document.content || '');
    
    if (queryConcepts.length === 0) return 0;
    
    let relationships = 0;
    for (const queryConcept of queryConcepts) {
      for (const docConcept of documentConcepts) {
        if (this.searchIndex.relationships[queryConcept] && 
            this.searchIndex.relationships[queryConcept].includes(docConcept)) {
          relationships++;
        }
      }
    }
    
    return relationships / queryConcepts.length;
  }

  // Context Analysis
  async analyzeContext(context) {
    const contextAnalysis = {
      userPreferences: context.userPreferences || {},
      conversationHistory: context.messageHistory || [],
      domain: context.domain || 'general',
      urgency: context.urgency || 'normal',
      complexity: context.complexity || 'medium'
    };
    
    return contextAnalysis;
  }

  async calculateContextRelevance(document, context) {
    const contextAnalysis = await this.analyzeContext(context);
    let relevance = 0.5; // Base relevance
    
    // Check domain match
    if (document.domain === contextAnalysis.domain) {
      relevance += 0.2;
    }
    
    // Check user preferences
    if (contextAnalysis.userPreferences.preferredCategories) {
      const preferredCategories = contextAnalysis.userPreferences.preferredCategories;
      if (preferredCategories.includes(document.category)) {
        relevance += 0.2;
      }
    }
    
    // Check conversation history relevance
    if (contextAnalysis.conversationHistory.length > 0) {
      const historyRelevance = await this.calculateHistoryRelevance(document, contextAnalysis.conversationHistory);
      relevance += historyRelevance * 0.1;
    }
    
    return Math.min(1, relevance);
  }

  async calculateHistoryRelevance(document, conversationHistory) {
    let relevance = 0;
    
    for (const message of conversationHistory.slice(-5)) { // Last 5 messages
      const messageVector = await this.generateQueryVector(message.text || '', {});
      const docVector = this.searchIndex.vectors[document.id];
      if (docVector) {
        const similarity = await this.calculateSemanticSimilarity(messageVector, docVector);
        relevance += similarity;
      }
    }
    
    return relevance / Math.min(5, conversationHistory.length);
  }

  // Personalization
  async calculatePersonalizationScore(document, context) {
    const userId = context.userId || 'anonymous';
    const userPatterns = this.userSearchPatterns[userId] || {};
    
    let score = 0.5; // Base score
    
    // Check category preference
    if (userPatterns.preferredCategories && userPatterns.preferredCategories.includes(document.category)) {
      score += 0.2;
    }
    
    // Check difficulty preference
    if (userPatterns.preferredDifficulty && userPatterns.preferredDifficulty === document.difficulty) {
      score += 0.1;
    }
    
    // Check recent search patterns
    if (userPatterns.recentSearches) {
      const recentRelevance = await this.calculateRecentSearchRelevance(document, userPatterns.recentSearches);
      score += recentRelevance * 0.2;
    }
    
    return Math.min(1, score);
  }

  async calculateRecentSearchRelevance(document, recentSearches) {
    let relevance = 0;
    
    for (const search of recentSearches.slice(-3)) { // Last 3 searches
      const searchVector = await this.generateQueryVector(search.query, {});
      const docVector = this.searchIndex.vectors[document.id];
      if (docVector) {
        const similarity = await this.calculateSemanticSimilarity(searchVector, docVector);
        relevance += similarity;
      }
    }
    
    return relevance / Math.min(3, recentSearches.length);
  }

  // Recency Scoring
  async calculateRecencyScore(document) {
    if (!document.timestamp) return 0.5;
    
    const now = Date.now();
    const age = now - document.timestamp;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    
    return Math.max(0, 1 - (age / maxAge));
  }

  // Search Suggestions
  async generateSearchSuggestions(query, context) {
    const suggestions = [];
    
    // Generate query variations
    const variations = await this.generateQueryVariations(query);
    suggestions.push(...variations);
    
    // Generate related concepts
    const relatedConcepts = await this.findRelatedConcepts(query);
    suggestions.push(...relatedConcepts);
    
    // Generate contextual suggestions
    const contextualSuggestions = await this.generateContextualSuggestions(query, context);
    suggestions.push(...contextualSuggestions);
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  async generateQueryVariations(query) {
    const variations = [];
    const words = query.toLowerCase().split(' ');
    
    // Add synonyms
    const synonyms = {
      'analyze': ['examine', 'study', 'investigate', 'review'],
      'create': ['make', 'build', 'design', 'develop'],
      'explain': ['describe', 'clarify', 'elaborate', 'detail'],
      'solve': ['fix', 'resolve', 'address', 'troubleshoot'],
      'optimize': ['improve', 'enhance', 'refine', 'perfect']
    };
    
    for (const word of words) {
      if (synonyms[word]) {
        for (const synonym of synonyms[word]) {
          const variation = query.replace(new RegExp(word, 'gi'), synonym);
          variations.push({
            type: 'synonym',
            query: variation,
            originalWord: word,
            replacement: synonym
          });
        }
      }
    }
    
    return variations;
  }

  async findRelatedConcepts(query) {
    const concepts = await this.extractConcepts(query);
    const relatedConcepts = [];
    
    for (const concept of concepts) {
      if (this.searchIndex.relationships[concept]) {
        for (const relatedConcept of this.searchIndex.relationships[concept]) {
          relatedConcepts.push({
            type: 'related_concept',
            query: `${query} ${relatedConcept}`,
            originalConcept: concept,
            relatedConcept: relatedConcept
          });
        }
      }
    }
    
    return relatedConcepts;
  }

  async generateContextualSuggestions(query, context) {
    const suggestions = [];
    
    // Add domain-specific suggestions
    if (context.domain) {
      suggestions.push({
        type: 'domain_specific',
        query: `${query} for ${context.domain}`,
        domain: context.domain
      });
    }
    
    // Add difficulty-specific suggestions
    if (context.difficulty) {
      suggestions.push({
        type: 'difficulty_specific',
        query: `${query} ${context.difficulty} level`,
        difficulty: context.difficulty
      });
    }
    
    return suggestions;
  }

  // Utility Methods
  async tokenizeQuery(query) {
    return query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  async extractContextWords(context) {
    const words = [];
    
    if (context.domain) {
      words.push(context.domain);
    }
    
    if (context.category) {
      words.push(context.category);
    }
    
    if (context.userPreferences && context.userPreferences.interests) {
      words.push(...context.userPreferences.interests);
    }
    
    return words;
  }

  async getWordVector(word) {
    // Simple word vector generation - can be enhanced with pre-trained embeddings
    const vector = new Array(300).fill(0);
    
    for (let i = 0; i < word.length && i < 300; i++) {
      vector[i] = word.charCodeAt(i) / 255;
    }
    
    return vector;
  }

  async extractConcepts(text) {
    const concepts = [];
    const words = text.toLowerCase().split(' ');
    
    // Simple concept extraction
    const conceptKeywords = [
      'algorithm', 'data structure', 'machine learning', 'artificial intelligence',
      'database', 'API', 'framework', 'architecture', 'design pattern',
      'optimization', 'performance', 'scalability', 'security'
    ];
    
    for (const keyword of conceptKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        concepts.push(keyword);
      }
    }
    
    return concepts;
  }

  async identifySearchIntent(query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('how to') || queryLower.includes('tutorial')) {
      return 'tutorial';
    }
    if (queryLower.includes('what is') || queryLower.includes('define')) {
      return 'definition';
    }
    if (queryLower.includes('compare') || queryLower.includes('vs')) {
      return 'comparison';
    }
    if (queryLower.includes('best') || queryLower.includes('recommend')) {
      return 'recommendation';
    }
    if (queryLower.includes('example') || queryLower.includes('sample')) {
      return 'example';
    }
    
    return 'general';
  }

  async assessQueryComplexity(query) {
    const words = query.split(' ').length;
    const sentences = query.split(/[.!?]+/).length;
    const complexity = Math.min(1, (words / 20) + (sentences / 2));
    return complexity;
  }

  async assessQueryUrgency(query, context) {
    const queryLower = query.toLowerCase();
    if (queryLower.includes('urgent') || queryLower.includes('asap')) {
      return 'high';
    }
    if (queryLower.includes('soon') || queryLower.includes('quickly')) {
      return 'medium';
    }
    return 'low';
  }

  async identifyMatchReasons(query, document, context) {
    const reasons = [];
    
    // Check semantic similarity
    const queryVector = await this.generateQueryVector(query, context);
    const docVector = this.searchIndex.vectors[document.id];
    if (docVector) {
      const similarity = await this.calculateSemanticSimilarity(queryVector, docVector);
      if (similarity > 0.7) {
        reasons.push(`High semantic similarity (${Math.round(similarity * 100)}%)`);
      }
    }
    
    // Check entity matches
    const entityMatches = await this.calculateEntityMatches(query, document);
    if (entityMatches > 0) {
      reasons.push(`Entity matches: ${Math.round(entityMatches * 100)}%`);
    }
    
    // Check context relevance
    const contextRelevance = await this.calculateContextRelevance(document, context);
    if (contextRelevance > 0.7) {
      reasons.push(`High context relevance (${Math.round(contextRelevance * 100)}%)`);
    }
    
    return reasons;
  }

  // Caching
  async getCachedSearchResult(query, context) {
    const cacheKey = this.generateCacheKey(query, context);
    return this.searchCache?.[cacheKey];
  }

  async cacheSearchResult(query, context, results) {
    const cacheKey = this.generateCacheKey(query, context);
    if (!this.searchCache) this.searchCache = {};
    this.searchCache[cacheKey] = {
      results,
      timestamp: Date.now()
    };
  }

  generateCacheKey(query, context) {
    const contextStr = JSON.stringify(context);
    return `${query}_${contextStr}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // Data Persistence
  async loadSearchData() {
    try {
      const index = await AsyncStorage.getItem('search_index');
      if (index) {
        this.searchIndex = { ...this.searchIndex, ...JSON.parse(index) };
      }

      const history = await AsyncStorage.getItem('search_history');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }

      const patterns = await AsyncStorage.getItem('user_search_patterns');
      if (patterns) {
        this.userSearchPatterns = JSON.parse(patterns);
      }

      const performance = await AsyncStorage.getItem('search_performance');
      if (performance) {
        this.searchPerformance = { ...this.searchPerformance, ...JSON.parse(performance) };
      }
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  }

  async saveSearchData() {
    try {
      await AsyncStorage.setItem('search_index', JSON.stringify(this.searchIndex));
      await AsyncStorage.setItem('search_history', JSON.stringify(this.searchHistory));
      await AsyncStorage.setItem('user_search_patterns', JSON.stringify(this.userSearchPatterns));
      await AsyncStorage.setItem('search_performance', JSON.stringify(this.searchPerformance));
    } catch (error) {
      console.error('Error saving search data:', error);
    }
  }

  async loadUserSearchPatterns() {
    // Load user-specific search patterns and preferences
    // This would typically be loaded from user profile or preferences
  }

  async updateSearchHistory(query, context, searchResult) {
    this.searchHistory.push({
      query,
      context,
      resultCount: searchResult.searchResults.length,
      averageRelevance: searchResult.searchMetrics.averageRelevance,
      timestamp: Date.now()
    });
    
    // Keep only last 100 searches
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(-100);
    }
    
    await this.saveSearchData();
  }

  async buildSearchIndex() {
    // Build search index from available documents
    // This would typically be populated from your document database
  }

  // Status and Health
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      searchCapabilities: Object.keys(this.searchCapabilities).filter(k => this.searchCapabilities[k]),
      indexedDocuments: Object.keys(this.searchIndex.documents).length,
      searchHistoryCount: this.searchHistory.length,
      userPatternsCount: Object.keys(this.userSearchPatterns).length,
      searchPerformance: this.searchPerformance
    };
  }

  // Cleanup
  async destroy() {
    await this.saveSearchData();
    this.isInitialized = false;
    console.log('🧹 Semantic Search Engine destroyed');
  }
}

export default new SemanticSearchEngine();
