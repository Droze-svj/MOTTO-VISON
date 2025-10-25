// Intelligent Example Query Service - Semantic search and example generation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsService } from './MetricsService';
import { ErrorManager } from './ErrorManager';

class IntelligentExampleQueryService {
  constructor() {
    this.isInitialized = false;
    this.exampleCapabilities = {
      semanticSearch: true,
      queryMatching: true,
      relevanceScoring: true,
      exampleGeneration: true,
      contextAwareness: true,
      personalization: true,
      dynamicExamples: true,
      categoryClassification: true,
      intentRecognition: true,
      difficultyAssessment: true
    };
    
    this.exampleDatabase = {
      analysis: [
        {
          query: "Analyze the performance of my React Native app",
          category: "technical_analysis",
          intent: "performance_analysis",
          difficulty: "intermediate",
          context: ["react_native", "performance", "mobile_app"],
          examples: [
            "Analyze the bundle size and identify optimization opportunities",
            "Review the app's memory usage patterns and suggest improvements",
            "Examine the network requests and optimize API calls",
            "Analyze the UI rendering performance and identify bottlenecks"
          ],
          followUp: [
            "What specific metrics should I focus on?",
            "How can I implement these optimizations?",
            "What tools should I use for monitoring?"
          ]
        },
        {
          query: "Analyze the market trends for AI assistants",
          category: "business_analysis",
          intent: "market_research",
          difficulty: "advanced",
          context: ["ai", "market_research", "business_intelligence"],
          examples: [
            "Compare the market share of different AI assistant platforms",
            "Analyze user adoption rates and growth patterns",
            "Examine competitive positioning and differentiation strategies",
            "Review pricing models and revenue streams"
          ],
          followUp: [
            "What are the key success factors?",
            "How can I position my product competitively?",
            "What are the emerging opportunities?"
          ]
        }
      ],
      explanation: [
        {
          query: "Explain how machine learning works",
          category: "educational",
          intent: "concept_explanation",
          difficulty: "beginner",
          context: ["machine_learning", "education", "concepts"],
          examples: [
            "Explain machine learning in simple terms with real-world examples",
            "Describe the different types of machine learning algorithms",
            "Explain how neural networks process information",
            "Describe the machine learning workflow from data to predictions"
          ],
          followUp: [
            "What are some practical applications?",
            "How do I get started with machine learning?",
            "What programming languages are best for ML?"
          ]
        },
        {
          query: "Explain quantum computing principles",
          category: "scientific",
          intent: "technical_explanation",
          difficulty: "advanced",
          context: ["quantum_computing", "physics", "advanced_technology"],
          examples: [
            "Explain quantum superposition and entanglement",
            "Describe how quantum gates work",
            "Explain quantum algorithms like Shor's and Grover's",
            "Describe the challenges in building quantum computers"
          ],
          followUp: [
            "What are the practical applications?",
            "How does it differ from classical computing?",
            "What are the current limitations?"
          ]
        }
      ],
      problemSolving: [
        {
          query: "Help me optimize my database queries",
          category: "technical_problem",
          intent: "optimization",
          difficulty: "intermediate",
          context: ["database", "optimization", "performance"],
          examples: [
            "Identify slow queries and suggest indexing strategies",
            "Optimize complex joins and reduce query execution time",
            "Implement query caching and connection pooling",
            "Analyze query plans and suggest improvements"
          ],
          followUp: [
            "What monitoring tools should I use?",
            "How do I measure the improvements?",
            "What are the best practices for database design?"
          ]
        },
        {
          query: "Solve my team's communication issues",
          category: "management_problem",
          intent: "team_improvement",
          difficulty: "intermediate",
          context: ["team_management", "communication", "workplace"],
          examples: [
            "Implement regular team meetings and feedback sessions",
            "Set up clear communication channels and protocols",
            "Address conflicts and improve collaboration",
            "Create team-building activities and improve morale"
          ],
          followUp: [
            "How do I measure communication effectiveness?",
            "What tools can help with team communication?",
            "How do I handle difficult team members?"
          ]
        }
      ],
      creative: [
        {
          query: "Create a marketing campaign for my startup",
          category: "marketing",
          intent: "campaign_creation",
          difficulty: "intermediate",
          context: ["marketing", "startup", "campaign"],
          examples: [
            "Develop a multi-channel marketing strategy with social media focus",
            "Create compelling content and messaging for target audience",
            "Design a launch campaign with influencer partnerships",
            "Plan a content calendar with blog posts and videos"
          ],
          followUp: [
            "What's my target audience?",
            "What's my budget for this campaign?",
            "How do I measure campaign success?"
          ]
        },
        {
          query: "Design a user interface for my mobile app",
          category: "design",
          intent: "ui_design",
          difficulty: "intermediate",
          context: ["ui_design", "mobile_app", "user_experience"],
          examples: [
            "Create wireframes and user flow diagrams",
            "Design responsive layouts for different screen sizes",
            "Implement accessibility features and inclusive design",
            "Create a design system with consistent components"
          ],
          followUp: [
            "What's the app's primary purpose?",
            "Who is my target user?",
            "What design tools should I use?"
          ]
        }
      ],
      research: [
        {
          query: "Research the latest trends in artificial intelligence",
          category: "academic_research",
          intent: "trend_analysis",
          difficulty: "advanced",
          context: ["ai_research", "trends", "technology"],
          examples: [
            "Analyze recent AI research papers and breakthrough technologies",
            "Examine industry reports and market analysis",
            "Review AI applications in different sectors",
            "Study the impact of AI on society and ethics"
          ],
          followUp: [
            "What specific AI areas interest you?",
            "How recent should the research be?",
            "What format do you need the research in?"
          ]
        },
        {
          query: "Research user experience best practices",
          category: "ux_research",
          intent: "best_practices",
          difficulty: "intermediate",
          context: ["ux_design", "user_research", "best_practices"],
          examples: [
            "Study user behavior patterns and interaction design",
            "Research accessibility guidelines and inclusive design",
            "Analyze successful UX case studies and methodologies",
            "Examine usability testing techniques and tools"
          ],
          followUp: [
            "What type of product are you designing?",
            "What's your target user demographic?",
            "What research methods interest you?"
          ]
        }
      ]
    };
    
    this.semanticSearchEngine = {
      vectorEmbeddings: {},
      similarityThreshold: 0.7,
      maxResults: 5,
      contextWeight: 0.3,
      intentWeight: 0.4,
      categoryWeight: 0.3
    };
    
    this.userPreferences = {
      preferredCategories: [],
      difficultyLevel: 'intermediate',
      exampleStyle: 'detailed',
      contextRelevance: 0.8
    };
    
    this.queryHistory = [];
    this.exampleUsage = {};
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadExampleData();
      await this.buildSemanticIndex();
      await this.loadUserPreferences();
      
      this.isInitialized = true;
      console.log('✅ Intelligent Example Query Service initialized');
      
      await MetricsService.logEvent('intelligent_example_query_initialized', {
        exampleCapabilities: Object.keys(this.exampleCapabilities).filter(k => this.exampleCapabilities[k]),
        exampleCategories: Object.keys(this.exampleDatabase).length,
        totalExamples: this.getTotalExampleCount()
      });
    } catch (error) {
      console.error('❌ Failed to initialize Intelligent Example Query Service:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentExampleQueryService.initialize' });
      throw error;
    }
  }

  // Semantic Search for Examples
  async findRelevantExamples(userInput, context = {}) {
    try {
      const searchResult = {
        timestamp: Date.now(),
        userInput: userInput,
        context: context,
        analysis: await this.analyzeUserInput(userInput, context),
        semanticSearch: await this.performSemanticSearch(userInput, context),
        relevantExamples: [],
        recommendations: [],
        followUpSuggestions: []
      };

      // Find most relevant examples
      searchResult.relevantExamples = await this.rankExamplesByRelevance(
        searchResult.semanticSearch.results,
        userInput,
        context
      );

      // Generate recommendations
      searchResult.recommendations = await this.generateRecommendations(
        searchResult.relevantExamples,
        userInput,
        context
      );

      // Generate follow-up suggestions
      searchResult.followUpSuggestions = await this.generateFollowUpSuggestions(
        searchResult.relevantExamples,
        userInput,
        context
      );

      // Update usage statistics
      await this.updateUsageStatistics(searchResult.relevantExamples);

      return searchResult;
    } catch (error) {
      console.error('Error finding relevant examples:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentExampleQueryService.findRelevantExamples' });
      throw error;
    }
  }

  async analyzeUserInput(userInput, context) {
    return {
      intent: await this.identifyIntent(userInput),
      category: await this.classifyCategory(userInput),
      difficulty: await this.assessDifficulty(userInput, context),
      keywords: await this.extractKeywords(userInput),
      context: await this.extractContext(userInput, context),
      complexity: await this.assessComplexity(userInput),
      urgency: await this.assessUrgency(userInput, context)
    };
  }

  async performSemanticSearch(userInput, context) {
    const searchResults = {
      query: userInput,
      context: context,
      results: [],
      searchMetrics: {
        totalMatches: 0,
        averageRelevance: 0,
        searchTime: 0
      }
    };

    const startTime = Date.now();
    
    // Search across all categories
    for (const [category, examples] of Object.entries(this.exampleDatabase)) {
      for (const example of examples) {
        const relevanceScore = await this.calculateRelevanceScore(
          userInput,
          example,
          context
        );
        
        if (relevanceScore >= this.semanticSearchEngine.similarityThreshold) {
          searchResults.results.push({
            ...example,
            relevanceScore,
            category,
            matchReasons: await this.identifyMatchReasons(userInput, example)
          });
        }
      }
    }

    // Sort by relevance score
    searchResults.results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limit results
    searchResults.results = searchResults.results.slice(0, this.semanticSearchEngine.maxResults);
    
    // Calculate metrics
    searchResults.searchMetrics = {
      totalMatches: searchResults.results.length,
      averageRelevance: searchResults.results.reduce((sum, r) => sum + r.relevanceScore, 0) / searchResults.results.length,
      searchTime: Date.now() - startTime
    };

    return searchResults;
  }

  async calculateRelevanceScore(userInput, example, context) {
    const userKeywords = await this.extractKeywords(userInput);
    const exampleKeywords = example.context || [];
    
    // Calculate keyword similarity
    const keywordSimilarity = this.calculateKeywordSimilarity(userKeywords, exampleKeywords);
    
    // Calculate intent similarity
    const intentSimilarity = await this.calculateIntentSimilarity(userInput, example.intent);
    
    // Calculate category relevance
    const categoryRelevance = await this.calculateCategoryRelevance(userInput, example.category);
    
    // Calculate context relevance
    const contextRelevance = await this.calculateContextRelevance(context, example);
    
    // Weighted combination
    const relevanceScore = (
      keywordSimilarity * 0.3 +
      intentSimilarity * 0.3 +
      categoryRelevance * 0.2 +
      contextRelevance * 0.2
    );

    return Math.min(1, relevanceScore);
  }

  async rankExamplesByRelevance(searchResults, userInput, context) {
    const rankedExamples = searchResults.map(result => ({
      ...result,
      finalScore: await this.calculateFinalScore(result, userInput, context)
    }));

    // Sort by final score
    rankedExamples.sort((a, b) => b.finalScore - a.finalScore);
    
    return rankedExamples;
  }

  async calculateFinalScore(result, userInput, context) {
    let finalScore = result.relevanceScore;
    
    // Adjust for user preferences
    if (this.userPreferences.preferredCategories.includes(result.category)) {
      finalScore += 0.1;
    }
    
    // Adjust for difficulty match
    if (result.difficulty === this.userPreferences.difficultyLevel) {
      finalScore += 0.05;
    }
    
    // Adjust for usage frequency (prefer less used examples)
    const usageCount = this.exampleUsage[result.query] || 0;
    finalScore -= (usageCount * 0.01);
    
    return Math.min(1, finalScore);
  }

  // Example Generation
  async generateDynamicExamples(userInput, context = {}) {
    try {
      const generation = {
        timestamp: Date.now(),
        userInput: userInput,
        context: context,
        analysis: await this.analyzeUserInput(userInput, context),
        generatedExamples: [],
        personalizedExamples: [],
        contextualExamples: []
      };

      // Generate base examples
      generation.generatedExamples = await this.generateBaseExamples(userInput, context);
      
      // Personalize examples
      generation.personalizedExamples = await this.personalizeExamples(
        generation.generatedExamples,
        context
      );
      
      // Add contextual examples
      generation.contextualExamples = await this.addContextualExamples(
        generation.personalizedExamples,
        context
      );

      return generation;
    } catch (error) {
      console.error('Error generating dynamic examples:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentExampleQueryService.generateDynamicExamples' });
      throw error;
    }
  }

  async generateBaseExamples(userInput, context) {
    const examples = [];
    const analysis = await this.analyzeUserInput(userInput, context);
    
    // Generate examples based on intent
    switch (analysis.intent) {
      case 'analysis':
        examples.push(...await this.generateAnalysisExamples(userInput, context));
        break;
      case 'explanation':
        examples.push(...await this.generateExplanationExamples(userInput, context));
        break;
      case 'problem_solving':
        examples.push(...await this.generateProblemSolvingExamples(userInput, context));
        break;
      case 'creation':
        examples.push(...await this.generateCreationExamples(userInput, context));
        break;
      case 'research':
        examples.push(...await this.generateResearchExamples(userInput, context));
        break;
      default:
        examples.push(...await this.generateGeneralExamples(userInput, context));
    }
    
    return examples;
  }

  async generateAnalysisExamples(userInput, context) {
    return [
      {
        query: `Analyze ${this.extractSubject(userInput)} with focus on performance metrics`,
        category: 'analysis',
        intent: 'performance_analysis',
        difficulty: 'intermediate',
        context: ['analysis', 'performance', 'metrics'],
        examples: [
          `Identify key performance indicators for ${this.extractSubject(userInput)}`,
          `Analyze trends and patterns in ${this.extractSubject(userInput)} data`,
          `Compare ${this.extractSubject(userInput)} against industry benchmarks`,
          `Provide actionable insights for improving ${this.extractSubject(userInput)}`
        ]
      },
      {
        query: `Conduct a comprehensive analysis of ${this.extractSubject(userInput)}`,
        category: 'analysis',
        intent: 'comprehensive_analysis',
        difficulty: 'advanced',
        context: ['analysis', 'comprehensive', 'detailed'],
        examples: [
          `Break down ${this.extractSubject(userInput)} into key components`,
          `Analyze the interrelationships between different aspects`,
          `Provide a detailed assessment with recommendations`,
          `Create a visual representation of the analysis`
        ]
      }
    ];
  }

  async generateExplanationExamples(userInput, context) {
    return [
      {
        query: `Explain ${this.extractSubject(userInput)} in simple terms`,
        category: 'explanation',
        intent: 'simple_explanation',
        difficulty: 'beginner',
        context: ['explanation', 'simple', 'beginner'],
        examples: [
          `Use analogies and real-world examples to explain ${this.extractSubject(userInput)}`,
          `Break down complex concepts into digestible parts`,
          `Provide step-by-step explanations with visual aids`,
          `Include common misconceptions and clarifications`
        ]
      },
      {
        query: `Provide a technical explanation of ${this.extractSubject(userInput)}`,
        category: 'explanation',
        intent: 'technical_explanation',
        difficulty: 'advanced',
        context: ['explanation', 'technical', 'advanced'],
        examples: [
          `Explain the underlying principles and mechanisms`,
          `Provide detailed technical specifications and requirements`,
          `Include code examples and implementation details`,
          `Discuss advanced concepts and edge cases`
        ]
      }
    ];
  }

  async generateProblemSolvingExamples(userInput, context) {
    return [
      {
        query: `Help me solve the problem with ${this.extractSubject(userInput)}`,
        category: 'problem_solving',
        intent: 'problem_resolution',
        difficulty: 'intermediate',
        context: ['problem_solving', 'resolution', 'troubleshooting'],
        examples: [
          `Identify the root cause of the problem`,
          `Provide step-by-step solutions with alternatives`,
          `Suggest preventive measures to avoid future issues`,
          `Include testing and validation procedures`
        ]
      },
      {
        query: `Optimize ${this.extractSubject(userInput)} for better performance`,
        category: 'problem_solving',
        intent: 'optimization',
        difficulty: 'intermediate',
        context: ['optimization', 'performance', 'improvement'],
        examples: [
          `Identify bottlenecks and inefficiencies`,
          `Suggest optimization strategies and techniques`,
          `Provide implementation guidelines and best practices`,
          `Include performance monitoring and measurement`
        ]
      }
    ];
  }

  // Context-Aware Example Selection
  async selectContextualExamples(userInput, context, maxExamples = 3) {
    try {
      const contextualSelection = {
        timestamp: Date.now(),
        userInput: userInput,
        context: context,
        selectedExamples: [],
        selectionCriteria: {},
        personalization: {}
      };

      // Analyze context for personalization
      contextualSelection.personalization = await this.analyzeContextForPersonalization(context);
      
      // Find relevant examples
      const relevantExamples = await this.findRelevantExamples(userInput, context);
      
      // Apply context-based filtering
      const filteredExamples = await this.applyContextFiltering(
        relevantExamples.relevantExamples,
        context
      );
      
      // Select top examples
      contextualSelection.selectedExamples = filteredExamples.slice(0, maxExamples);
      
      // Add context-specific modifications
      contextualSelection.selectedExamples = await this.addContextualModifications(
        contextualSelection.selectedExamples,
        context
      );

      return contextualSelection;
    } catch (error) {
      console.error('Error selecting contextual examples:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentExampleQueryService.selectContextualExamples' });
      throw error;
    }
  }

  // Utility Methods
  async identifyIntent(userInput) {
    const inputLower = userInput.toLowerCase();
    
    if (inputLower.includes('analyze') || inputLower.includes('analysis')) {
      return 'analysis';
    }
    if (inputLower.includes('explain') || inputLower.includes('how') || inputLower.includes('what')) {
      return 'explanation';
    }
    if (inputLower.includes('solve') || inputLower.includes('fix') || inputLower.includes('help')) {
      return 'problem_solving';
    }
    if (inputLower.includes('create') || inputLower.includes('make') || inputLower.includes('design')) {
      return 'creation';
    }
    if (inputLower.includes('research') || inputLower.includes('study') || inputLower.includes('investigate')) {
      return 'research';
    }
    
    return 'general';
  }

  async classifyCategory(userInput) {
    const inputLower = userInput.toLowerCase();
    
    if (inputLower.includes('code') || inputLower.includes('programming') || inputLower.includes('software')) {
      return 'technical';
    }
    if (inputLower.includes('business') || inputLower.includes('marketing') || inputLower.includes('strategy')) {
      return 'business';
    }
    if (inputLower.includes('design') || inputLower.includes('ui') || inputLower.includes('ux')) {
      return 'design';
    }
    if (inputLower.includes('research') || inputLower.includes('study') || inputLower.includes('academic')) {
      return 'academic';
    }
    if (inputLower.includes('creative') || inputLower.includes('art') || inputLower.includes('writing')) {
      return 'creative';
    }
    
    return 'general';
  }

  async assessDifficulty(userInput, context) {
    const inputLower = userInput.toLowerCase();
    const complexity = await this.assessComplexity(userInput);
    
    if (complexity > 0.7 || inputLower.includes('advanced') || inputLower.includes('complex')) {
      return 'advanced';
    }
    if (complexity < 0.3 || inputLower.includes('simple') || inputLower.includes('basic')) {
      return 'beginner';
    }
    
    return 'intermediate';
  }

  async extractKeywords(userInput) {
    const words = userInput.toLowerCase().split(' ');
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => word.length > 2 && !stopWords.includes(word));
  }

  async extractContext(userInput, context) {
    const extractedContext = [];
    
    if (context.userPreferences) {
      extractedContext.push('user_preferences');
    }
    if (context.messageHistory) {
      extractedContext.push('conversation_history');
    }
    if (context.domain) {
      extractedContext.push(context.domain);
    }
    
    return extractedContext;
  }

  async assessComplexity(userInput) {
    const words = userInput.split(' ').length;
    const sentences = userInput.split(/[.!?]+/).length;
    const complexity = Math.min(1, (words / 50) + (sentences / 5));
    return complexity;
  }

  async assessUrgency(userInput, context) {
    const inputLower = userInput.toLowerCase();
    if (inputLower.includes('urgent') || inputLower.includes('asap') || inputLower.includes('immediately')) {
      return 'high';
    }
    if (inputLower.includes('soon') || inputLower.includes('quickly')) {
      return 'medium';
    }
    return 'low';
  }

  extractSubject(userInput) {
    // Simple subject extraction - can be enhanced with NLP
    const words = userInput.split(' ');
    const subjectWords = words.slice(1, Math.min(4, words.length));
    return subjectWords.join(' ');
  }

  calculateKeywordSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  async calculateIntentSimilarity(userInput, exampleIntent) {
    const userIntent = await this.identifyIntent(userInput);
    return userIntent === exampleIntent ? 1 : 0;
  }

  async calculateCategoryRelevance(userInput, exampleCategory) {
    const userCategory = await this.classifyCategory(userInput);
    return userCategory === exampleCategory ? 1 : 0.5;
  }

  async calculateContextRelevance(context, example) {
    if (!context || Object.keys(context).length === 0) return 0.5;
    
    const contextKeys = Object.keys(context);
    const exampleContext = example.context || [];
    
    let relevance = 0;
    for (const key of contextKeys) {
      if (exampleContext.includes(key)) {
        relevance += 0.2;
      }
    }
    
    return Math.min(1, relevance);
  }

  async identifyMatchReasons(userInput, example) {
    const reasons = [];
    const userKeywords = await this.extractKeywords(userInput);
    const exampleKeywords = example.context || [];
    
    // Check keyword matches
    const keywordMatches = userKeywords.filter(keyword => 
      exampleKeywords.some(exampleKeyword => 
        exampleKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    if (keywordMatches.length > 0) {
      reasons.push(`Keyword matches: ${keywordMatches.join(', ')}`);
    }
    
    // Check intent match
    const userIntent = await this.identifyIntent(userInput);
    if (userIntent === example.intent) {
      reasons.push(`Intent match: ${userIntent}`);
    }
    
    // Check category match
    const userCategory = await this.classifyCategory(userInput);
    if (userCategory === example.category) {
      reasons.push(`Category match: ${userCategory}`);
    }
    
    return reasons;
  }

  async generateRecommendations(relevantExamples, userInput, context) {
    const recommendations = [];
    
    for (const example of relevantExamples.slice(0, 3)) {
      recommendations.push({
        title: `Try: ${example.query}`,
        description: `This example matches your intent and provides ${example.examples.length} specific approaches`,
        relevance: example.relevanceScore,
        category: example.category,
        difficulty: example.difficulty
      });
    }
    
    return recommendations;
  }

  async generateFollowUpSuggestions(relevantExamples, userInput, context) {
    const suggestions = [];
    
    for (const example of relevantExamples.slice(0, 2)) {
      if (example.followUp && example.followUp.length > 0) {
        suggestions.push(...example.followUp.slice(0, 2));
      }
    }
    
    return suggestions;
  }

  async updateUsageStatistics(examples) {
    for (const example of examples) {
      this.exampleUsage[example.query] = (this.exampleUsage[example.query] || 0) + 1;
    }
    
    await this.saveUsageStatistics();
  }

  getTotalExampleCount() {
    let total = 0;
    for (const category of Object.values(this.exampleDatabase)) {
      total += category.length;
    }
    return total;
  }

  // Data Persistence
  async loadExampleData() {
    try {
      const data = await AsyncStorage.getItem('example_database');
      if (data) {
        this.exampleDatabase = { ...this.exampleDatabase, ...JSON.parse(data) };
      }

      const usage = await AsyncStorage.getItem('example_usage');
      if (usage) {
        this.exampleUsage = JSON.parse(usage);
      }

      const history = await AsyncStorage.getItem('query_history');
      if (history) {
        this.queryHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading example data:', error);
    }
  }

  async saveExampleData() {
    try {
      await AsyncStorage.setItem('example_database', JSON.stringify(this.exampleDatabase));
    } catch (error) {
      console.error('Error saving example data:', error);
    }
  }

  async saveUsageStatistics() {
    try {
      await AsyncStorage.setItem('example_usage', JSON.stringify(this.exampleUsage));
    } catch (error) {
      console.error('Error saving usage statistics:', error);
    }
  }

  async saveQueryHistory() {
    try {
      await AsyncStorage.setItem('query_history', JSON.stringify(this.queryHistory));
    } catch (error) {
      console.error('Error saving query history:', error);
    }
  }

  async loadUserPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('user_example_preferences');
      if (preferences) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(preferences) };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  async saveUserPreferences() {
    try {
      await AsyncStorage.setItem('user_example_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  async buildSemanticIndex() {
    // Build semantic index for faster searching
    this.semanticSearchEngine.vectorEmbeddings = {};
    
    for (const [category, examples] of Object.entries(this.exampleDatabase)) {
      for (const example of examples) {
        const embedding = await this.generateEmbedding(example.query);
        this.semanticSearchEngine.vectorEmbeddings[example.query] = embedding;
      }
    }
  }

  async generateEmbedding(text) {
    // Simple embedding generation - can be enhanced with actual NLP models
    const words = text.toLowerCase().split(' ');
    const embedding = new Array(100).fill(0);
    
    for (let i = 0; i < words.length && i < 100; i++) {
      embedding[i] = words[i].charCodeAt(0) / 255;
    }
    
    return embedding;
  }

  // Status and Health
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      exampleCapabilities: Object.keys(this.exampleCapabilities).filter(k => this.exampleCapabilities[k]),
      exampleCategories: Object.keys(this.exampleDatabase).length,
      totalExamples: this.getTotalExampleCount(),
      queryHistoryCount: this.queryHistory.length,
      usageStatisticsCount: Object.keys(this.exampleUsage).length,
      semanticIndexSize: Object.keys(this.semanticSearchEngine.vectorEmbeddings).length
    };
  }

  // Cleanup
  async destroy() {
    await this.saveExampleData();
    await this.saveUsageStatistics();
    await this.saveQueryHistory();
    await this.saveUserPreferences();
    this.isInitialized = false;
    console.log('🧹 Intelligent Example Query Service destroyed');
  }
}

export default new IntelligentExampleQueryService();
