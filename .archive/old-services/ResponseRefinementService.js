// Response Refinement Service - Continuously improves MOTTO's responses
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MetricsService } from './MetricsService';
import { ErrorManager } from './ErrorManager';

class ResponseRefinementService {
  constructor() {
    this.isInitialized = false;
    this.refinementData = {
      responseHistory: [],
      qualityMetrics: {},
      improvementSuggestions: [],
      userFeedback: [],
      refinementRules: []
    };
    
    this.qualityMetrics = {
      clarity: 0.0,
      relevance: 0.0,
      helpfulness: 0.0,
      personalization: 0.0,
      engagement: 0.0,
      accuracy: 0.0
    };
    
    this.refinementStrategies = {
      clarity: ['simplify language', 'use shorter sentences', 'avoid jargon'],
      relevance: ['focus on user intent', 'address specific questions', 'provide context'],
      helpfulness: ['offer actionable advice', 'provide examples', 'suggest next steps'],
      personalization: ['use user preferences', 'reference past interactions', 'adapt tone'],
      engagement: ['ask follow-up questions', 'use conversational tone', 'show enthusiasm'],
      accuracy: ['verify information', 'cite sources', 'acknowledge uncertainty']
    };
    
    this.improvementAlgorithms = {
      a_bTesting: true,
      feedbackAnalysis: true,
      patternRecognition: true,
      qualityScoring: true,
      adaptiveRefinement: true
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadRefinementData();
      await this.initializeRefinementRules();
      this.startRefinementProcess();
      
      this.isInitialized = true;
      console.log('✅ Response Refinement Service initialized');
      
      await MetricsService.logEvent('response_refinement_initialized', {
        strategies: Object.keys(this.refinementStrategies),
        algorithms: Object.keys(this.improvementAlgorithms).filter(k => this.improvementAlgorithms[k])
      });
    } catch (error) {
      console.error('❌ Failed to initialize Response Refinement Service:', error);
      await ErrorManager.handleError(error, { context: 'ResponseRefinementService.initialize' });
      throw error;
    }
  }

  // Response Quality Assessment
  async assessResponseQuality(response, context) {
    try {
      const qualityScores = {
        clarity: this.assessClarity(response),
        relevance: this.assessRelevance(response, context),
        helpfulness: this.assessHelpfulness(response, context),
        personalization: this.assessPersonalization(response, context),
        engagement: this.assessEngagement(response),
        accuracy: this.assessAccuracy(response, context)
      };
      
      const overallScore = this.calculateOverallScore(qualityScores);
      const improvementAreas = this.identifyImprovementAreas(qualityScores);
      const suggestions = this.generateImprovementSuggestions(improvementAreas);
      
      return {
        overallScore,
        qualityScores,
        improvementAreas,
        suggestions,
        confidence: this.calculateConfidence(qualityScores)
      };
    } catch (error) {
      console.error('Error assessing response quality:', error);
      return {
        overallScore: 0.5,
        qualityScores: {},
        improvementAreas: ['Assessment failed'],
        suggestions: ['Unable to assess quality'],
        confidence: 0.3
      };
    }
  }

  assessClarity(response) {
    const sentences = response.split(/[.!?]+/);
    const words = response.split(' ');
    
    // Average sentence length
    const avgSentenceLength = words.length / sentences.length;
    
    // Complex word ratio
    const complexWords = words.filter(word => word.length > 6);
    const complexWordRatio = complexWords.length / words.length;
    
    // Readability score
    const readabilityScore = this.calculateReadabilityScore(response);
    
    // Clarity score (0-1)
    const clarityScore = Math.max(0, 1 - (avgSentenceLength / 20) - (complexWordRatio * 0.5) + (readabilityScore * 0.3));
    
    return Math.min(1, clarityScore);
  }

  assessRelevance(response, context) {
    const userIntent = context.userIntent || '';
    const contextKeywords = context.keywords || [];
    const responseWords = response.toLowerCase().split(' ');
    
    let relevanceScore = 0;
    
    // Check if response addresses user intent
    if (userIntent && response.toLowerCase().includes(userIntent.toLowerCase())) {
      relevanceScore += 0.4;
    }
    
    // Check keyword overlap
    const keywordMatches = contextKeywords.filter(keyword => 
      responseWords.includes(keyword.toLowerCase())
    );
    relevanceScore += (keywordMatches.length / Math.max(contextKeywords.length, 1)) * 0.6;
    
    return Math.min(1, relevanceScore);
  }

  assessHelpfulness(response, context) {
    const helpfulnessIndicators = [
      'how to', 'step by step', 'example', 'suggestion', 'recommendation',
      'try this', 'you can', 'here\'s how', 'let me help', 'solution'
    ];
    
    const responseLower = response.toLowerCase();
    let helpfulnessScore = 0;
    
    helpfulnessIndicators.forEach(indicator => {
      if (responseLower.includes(indicator)) {
        helpfulnessScore += 0.2;
      }
    });
    
    // Check for actionable content
    if (responseLower.includes('do') || responseLower.includes('make') || responseLower.includes('create')) {
      helpfulnessScore += 0.2;
    }
    
    // Check for examples or explanations
    if (responseLower.includes('for example') || responseLower.includes('such as') || responseLower.includes('like')) {
      helpfulnessScore += 0.2;
    }
    
    return Math.min(1, helpfulnessScore);
  }

  assessPersonalization(response, context) {
    const userPreferences = context.userPreferences || {};
    let personalizationScore = 0;
    
    // Check communication style match
    if (userPreferences.communicationStyle === 'formal' && 
        (response.includes('please') || response.includes('thank you'))) {
      personalizationScore += 0.3;
    } else if (userPreferences.communicationStyle === 'casual' && 
               (response.includes('hey') || response.includes('cool'))) {
      personalizationScore += 0.3;
    }
    
    // Check detail level match
    if (userPreferences.detailLevel === 'high' && response.length > 100) {
      personalizationScore += 0.3;
    } else if (userPreferences.detailLevel === 'low' && response.length < 50) {
      personalizationScore += 0.3;
    }
    
    // Check if response references past interactions
    if (context.previousInteractions && 
        response.toLowerCase().includes('as we discussed') || 
        response.toLowerCase().includes('like before')) {
      personalizationScore += 0.4;
    }
    
    return Math.min(1, personalizationScore);
  }

  assessEngagement(response) {
    const engagementIndicators = [
      'what do you think', 'how about', 'would you like', 'have you tried',
      'what\'s your', 'do you want', 'shall we', 'let\'s'
    ];
    
    const responseLower = response.toLowerCase();
    let engagementScore = 0;
    
    engagementIndicators.forEach(indicator => {
      if (responseLower.includes(indicator)) {
        engagementScore += 0.25;
      }
    });
    
    // Check for questions
    if (response.includes('?')) {
      engagementScore += 0.3;
    }
    
    // Check for enthusiasm
    const enthusiasmWords = ['great', 'excellent', 'wonderful', 'amazing', 'fantastic'];
    enthusiasmWords.forEach(word => {
      if (responseLower.includes(word)) {
        engagementScore += 0.1;
      }
    });
    
    return Math.min(1, engagementScore);
  }

  assessAccuracy(response, context) {
    // Simple accuracy assessment based on confidence and context
    let accuracyScore = 0.5; // Base score
    
    // Check for uncertainty indicators
    const uncertaintyWords = ['might', 'could', 'possibly', 'perhaps', 'maybe', 'I think'];
    const responseLower = response.toLowerCase();
    
    let uncertaintyCount = 0;
    uncertaintyWords.forEach(word => {
      if (responseLower.includes(word)) {
        uncertaintyCount++;
      }
    });
    
    // Reduce accuracy score for high uncertainty
    accuracyScore -= (uncertaintyCount * 0.1);
    
    // Increase accuracy score for confident statements
    if (responseLower.includes('definitely') || responseLower.includes('certainly')) {
      accuracyScore += 0.2;
    }
    
    // Check for source citations or references
    if (responseLower.includes('according to') || responseLower.includes('research shows')) {
      accuracyScore += 0.2;
    }
    
    return Math.max(0, Math.min(1, accuracyScore));
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

  calculateOverallScore(qualityScores) {
    const weights = {
      clarity: 0.2,
      relevance: 0.25,
      helpfulness: 0.2,
      personalization: 0.15,
      engagement: 0.1,
      accuracy: 0.1
    };
    
    let overallScore = 0;
    Object.keys(weights).forEach(key => {
      overallScore += qualityScores[key] * weights[key];
    });
    
    return overallScore;
  }

  identifyImprovementAreas(qualityScores) {
    const improvementAreas = [];
    const threshold = 0.6;
    
    Object.keys(qualityScores).forEach(key => {
      if (qualityScores[key] < threshold) {
        improvementAreas.push(key);
      }
    });
    
    return improvementAreas;
  }

  generateImprovementSuggestions(improvementAreas) {
    const suggestions = [];
    
    improvementAreas.forEach(area => {
      if (this.refinementStrategies[area]) {
        suggestions.push(...this.refinementStrategies[area]);
      }
    });
    
    return suggestions;
  }

  calculateConfidence(qualityScores) {
    const scores = Object.values(qualityScores);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    
    // Higher confidence for consistent scores
    return Math.max(0.1, 1 - variance);
  }

  // Response Refinement
  async refineResponse(response, context, qualityAssessment) {
    try {
      let refinedResponse = response;
      const improvements = [];
      
      // Apply clarity improvements
      if (qualityAssessment.improvementAreas.includes('clarity')) {
        refinedResponse = this.improveClarity(refinedResponse);
        improvements.push('Improved clarity');
      }
      
      // Apply relevance improvements
      if (qualityAssessment.improvementAreas.includes('relevance')) {
        refinedResponse = this.improveRelevance(refinedResponse, context);
        improvements.push('Improved relevance');
      }
      
      // Apply helpfulness improvements
      if (qualityAssessment.improvementAreas.includes('helpfulness')) {
        refinedResponse = this.improveHelpfulness(refinedResponse, context);
        improvements.push('Improved helpfulness');
      }
      
      // Apply personalization improvements
      if (qualityAssessment.improvementAreas.includes('personalization')) {
        refinedResponse = this.improvePersonalization(refinedResponse, context);
        improvements.push('Improved personalization');
      }
      
      // Apply engagement improvements
      if (qualityAssessment.improvementAreas.includes('engagement')) {
        refinedResponse = this.improveEngagement(refinedResponse);
        improvements.push('Improved engagement');
      }
      
      // Apply accuracy improvements
      if (qualityAssessment.improvementAreas.includes('accuracy')) {
        refinedResponse = this.improveAccuracy(refinedResponse, context);
        improvements.push('Improved accuracy');
      }
      
      return {
        originalResponse: response,
        refinedResponse: refinedResponse,
        improvements: improvements,
        qualityImprovement: this.calculateQualityImprovement(response, refinedResponse)
      };
    } catch (error) {
      console.error('Error refining response:', error);
      return {
        originalResponse: response,
        refinedResponse: response,
        improvements: ['Refinement failed'],
        qualityImprovement: 0
      };
    }
  }

  improveClarity(response) {
    let improved = response;
    
    // Break long sentences
    improved = improved.replace(/([.!?])\s+([A-Z])/g, '$1 $2');
    
    // Simplify complex words
    const complexWords = {
      'utilize': 'use',
      'facilitate': 'help',
      'implement': 'do',
      'comprehensive': 'complete',
      'substantial': 'large'
    };
    
    Object.keys(complexWords).forEach(complex => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      improved = improved.replace(regex, complexWords[complex]);
    });
    
    return improved;
  }

  improveRelevance(response, context) {
    let improved = response;
    const userIntent = context.userIntent || '';
    const keywords = context.keywords || [];
    
    // Add context if missing
    if (userIntent && !improved.toLowerCase().includes(userIntent.toLowerCase())) {
      improved = `Regarding ${userIntent}, ${improved.toLowerCase()}`;
    }
    
    // Add relevant keywords if missing
    keywords.forEach(keyword => {
      if (!improved.toLowerCase().includes(keyword.toLowerCase())) {
        improved += ` This relates to ${keyword}.`;
      }
    });
    
    return improved;
  }

  improveHelpfulness(response, context) {
    let improved = response;
    
    // Add actionable suggestions if missing
    if (!improved.toLowerCase().includes('you can') && !improved.toLowerCase().includes('try')) {
      improved += ' You can try this approach.';
    }
    
    // Add examples if missing
    if (!improved.toLowerCase().includes('for example') && !improved.toLowerCase().includes('such as')) {
      improved += ' For example, you could start with the basics.';
    }
    
    return improved;
  }

  improvePersonalization(response, context) {
    let improved = response;
    const userPreferences = context.userPreferences || {};
    
    // Adjust communication style
    if (userPreferences.communicationStyle === 'formal') {
      improved = improved.replace(/hey/gi, 'Hello');
      improved = improved.replace(/thanks/gi, 'Thank you');
    } else if (userPreferences.communicationStyle === 'casual') {
      improved = improved.replace(/Hello/gi, 'Hey');
      improved = improved.replace(/Thank you/gi, 'Thanks');
    }
    
    // Adjust detail level
    if (userPreferences.detailLevel === 'high' && improved.length < 100) {
      improved += ' Would you like me to provide more details on any specific aspect?';
    } else if (userPreferences.detailLevel === 'low' && improved.length > 100) {
      const sentences = improved.split(/[.!?]+/);
      improved = sentences[0] + '.';
    }
    
    return improved;
  }

  improveEngagement(response) {
    let improved = response;
    
    // Add questions if missing
    if (!improved.includes('?')) {
      improved += ' What do you think about this approach?';
    }
    
    // Add enthusiasm if missing
    if (!improved.toLowerCase().includes('great') && !improved.toLowerCase().includes('excellent')) {
      improved = improved.replace(/^/, 'Great! ');
    }
    
    return improved;
  }

  improveAccuracy(response, context) {
    let improved = response;
    
    // Add uncertainty indicators for uncertain information
    if (!improved.toLowerCase().includes('might') && !improved.toLowerCase().includes('could')) {
      improved = improved.replace(/^/, 'Based on my knowledge, ');
    }
    
    // Add source references if available
    if (context.sources && context.sources.length > 0) {
      improved += ` This information is based on ${context.sources[0]}.`;
    }
    
    return improved;
  }

  calculateQualityImprovement(original, refined) {
    const originalScore = this.calculateOverallScore(this.assessAllQualityMetrics(original));
    const refinedScore = this.calculateOverallScore(this.assessAllQualityMetrics(refined));
    
    return refinedScore - originalScore;
  }

  assessAllQualityMetrics(response) {
    return {
      clarity: this.assessClarity(response),
      relevance: this.assessRelevance(response, {}),
      helpfulness: this.assessHelpfulness(response, {}),
      personalization: this.assessPersonalization(response, {}),
      engagement: this.assessEngagement(response),
      accuracy: this.assessAccuracy(response, {})
    };
  }

  // A/B Testing
  async runABTest(response, context, variants) {
    try {
      const testId = this.generateTestId();
      const userSegment = this.determineUserSegment(context);
      const selectedVariant = this.selectVariant(variants, userSegment);
      
      const testResult = {
        testId,
        userSegment,
        selectedVariant,
        originalResponse: response,
        variants: variants,
        timestamp: Date.now(),
        context: context
      };
      
      this.refinementData.responseHistory.push(testResult);
      await this.saveRefinementData();
      
      return selectedVariant;
    } catch (error) {
      console.error('Error running A/B test:', error);
      return response;
    }
  }

  generateTestId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  determineUserSegment(context) {
    const userPreferences = context.userPreferences || {};
    const interactionCount = context.interactionCount || 0;
    
    if (interactionCount > 50) return 'power_user';
    if (interactionCount > 10) return 'regular_user';
    return 'new_user';
  }

  selectVariant(variants, userSegment) {
    // Simple variant selection based on user segment
    const segmentPreferences = {
      power_user: 'detailed',
      regular_user: 'balanced',
      new_user: 'simple'
    };
    
    const preferredType = segmentPreferences[userSegment];
    const preferredVariant = variants.find(v => v.type === preferredType);
    
    return preferredVariant || variants[0];
  }

  // Feedback Analysis
  async analyzeFeedback(feedback) {
    try {
      const analysis = {
        sentiment: this.analyzeFeedbackSentiment(feedback),
        categories: this.categorizeFeedback(feedback),
        improvements: this.extractImprovementSuggestions(feedback),
        priority: this.assessFeedbackPriority(feedback)
      };
      
      this.refinementData.userFeedback.push({
        feedback,
        analysis,
        timestamp: Date.now()
      });
      
      await this.saveRefinementData();
      return analysis;
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return null;
    }
  }

  analyzeFeedbackSentiment(feedback) {
    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'useful', 'clear'];
    const negativeWords = ['bad', 'terrible', 'confusing', 'unhelpful', 'unclear', 'wrong'];
    
    const words = feedback.toLowerCase().split(' ');
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  categorizeFeedback(feedback) {
    const categories = [];
    
    if (feedback.toLowerCase().includes('clarity') || feedback.toLowerCase().includes('clear')) {
      categories.push('clarity');
    }
    if (feedback.toLowerCase().includes('helpful') || feedback.toLowerCase().includes('useful')) {
      categories.push('helpfulness');
    }
    if (feedback.toLowerCase().includes('personal') || feedback.toLowerCase().includes('relevant')) {
      categories.push('personalization');
    }
    if (feedback.toLowerCase().includes('engaging') || feedback.toLowerCase().includes('interesting')) {
      categories.push('engagement');
    }
    if (feedback.toLowerCase().includes('accurate') || feedback.toLowerCase().includes('correct')) {
      categories.push('accuracy');
    }
    
    return categories.length > 0 ? categories : ['general'];
  }

  extractImprovementSuggestions(feedback) {
    const suggestions = [];
    
    if (feedback.toLowerCase().includes('more detail')) {
      suggestions.push('Provide more detailed information');
    }
    if (feedback.toLowerCase().includes('simpler')) {
      suggestions.push('Use simpler language');
    }
    if (feedback.toLowerCase().includes('examples')) {
      suggestions.push('Include more examples');
    }
    if (feedback.toLowerCase().includes('shorter')) {
      suggestions.push('Make responses more concise');
    }
    
    return suggestions;
  }

  assessFeedbackPriority(feedback) {
    const urgentKeywords = ['urgent', 'critical', 'important', 'asap'];
    const highPriorityKeywords = ['problem', 'issue', 'error', 'wrong'];
    
    const words = feedback.toLowerCase().split(' ');
    
    if (urgentKeywords.some(keyword => words.includes(keyword))) {
      return 'urgent';
    }
    if (highPriorityKeywords.some(keyword => words.includes(keyword))) {
      return 'high';
    }
    
    return 'normal';
  }

  // Continuous Refinement
  startRefinementProcess() {
    setInterval(() => {
      this.performRefinement();
    }, 600000); // 10 minutes
  }

  async performRefinement() {
    try {
      console.log('🔧 Performing response refinement...');
      
      await this.updateQualityMetrics();
      await this.analyzeRefinementPatterns();
      await this.updateRefinementRules();
      
      console.log('✅ Response refinement completed');
    } catch (error) {
      console.error('Error in refinement process:', error);
    }
  }

  async updateQualityMetrics() {
    const recentResponses = this.refinementData.responseHistory.filter(
      r => r.timestamp > (Date.now() - 24 * 60 * 60 * 1000)
    );
    
    if (recentResponses.length > 0) {
      const qualityScores = recentResponses.map(r => r.qualityAssessment?.overallScore || 0.5);
      const averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
      
      this.qualityMetrics.clarity = averageQuality;
      this.qualityMetrics.relevance = averageQuality;
      this.qualityMetrics.helpfulness = averageQuality;
      this.qualityMetrics.personalization = averageQuality;
      this.qualityMetrics.engagement = averageQuality;
      this.qualityMetrics.accuracy = averageQuality;
    }
  }

  async analyzeRefinementPatterns() {
    const feedback = this.refinementData.userFeedback;
    const patterns = {
      commonIssues: this.findCommonIssues(feedback),
      improvementAreas: this.findImprovementAreas(feedback),
      successfulRefinements: this.findSuccessfulRefinements()
    };
    
    console.log('📊 Refinement Patterns:', patterns);
  }

  findCommonIssues(feedback) {
    const issues = feedback.flatMap(f => f.analysis?.categories || []);
    const frequency = {};
    
    issues.forEach(issue => {
      frequency[issue] = (frequency[issue] || 0) + 1;
    });
    
    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, 5);
  }

  findImprovementAreas(feedback) {
    const improvements = feedback.flatMap(f => f.analysis?.improvements || []);
    return [...new Set(improvements)];
  }

  findSuccessfulRefinements() {
    return this.refinementData.responseHistory.filter(
      r => r.qualityImprovement && r.qualityImprovement > 0.1
    );
  }

  async updateRefinementRules() {
    const commonIssues = this.findCommonIssues(this.refinementData.userFeedback);
    
    commonIssues.forEach(issue => {
      if (!this.refinementData.refinementRules.find(rule => rule.issue === issue)) {
        this.refinementData.refinementRules.push({
          issue,
          rule: this.generateRefinementRule(issue),
          effectiveness: 0.5,
          lastUpdated: Date.now()
        });
      }
    });
    
    await this.saveRefinementData();
  }

  generateRefinementRule(issue) {
    const rules = {
      clarity: 'Simplify language and use shorter sentences',
      helpfulness: 'Provide actionable advice and examples',
      personalization: 'Adapt response to user preferences',
      engagement: 'Ask questions and show enthusiasm',
      accuracy: 'Verify information and cite sources'
    };
    
    return rules[issue] || 'Improve overall response quality';
  }

  async initializeRefinementRules() {
    const defaultRules = [
      { issue: 'clarity', rule: 'Simplify language and use shorter sentences', effectiveness: 0.5 },
      { issue: 'helpfulness', rule: 'Provide actionable advice and examples', effectiveness: 0.5 },
      { issue: 'personalization', rule: 'Adapt response to user preferences', effectiveness: 0.5 },
      { issue: 'engagement', rule: 'Ask questions and show enthusiasm', effectiveness: 0.5 },
      { issue: 'accuracy', rule: 'Verify information and cite sources', effectiveness: 0.5 }
    ];
    
    this.refinementData.refinementRules = defaultRules;
  }

  // Data Persistence
  async loadRefinementData() {
    try {
      const data = await AsyncStorage.getItem('response_refinement_data');
      if (data) {
        this.refinementData = { ...this.refinementData, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading refinement data:', error);
    }
  }

  async saveRefinementData() {
    try {
      await AsyncStorage.setItem('response_refinement_data', JSON.stringify(this.refinementData));
    } catch (error) {
      console.error('Error saving refinement data:', error);
    }
  }

  // Status and Health
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      qualityMetrics: this.qualityMetrics,
      refinementData: {
        responseHistory: this.refinementData.responseHistory.length,
        userFeedback: this.refinementData.userFeedback.length,
        refinementRules: this.refinementData.refinementRules.length
      },
      strategies: Object.keys(this.refinementStrategies),
      algorithms: Object.keys(this.improvementAlgorithms).filter(k => this.improvementAlgorithms[k])
    };
  }

  // Cleanup
  async destroy() {
    await this.saveRefinementData();
    this.isInitialized = false;
    console.log('🧹 Response Refinement Service destroyed');
  }
}

export default new ResponseRefinementService();
