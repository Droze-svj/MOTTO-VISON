import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';
import EmotionalIntelligenceService from './EmotionalIntelligenceService';

class ContentModerationService {
  constructor() {
    this.isInitialized = false;
    
    // Content moderation capabilities
    this.moderationCapabilities = {
      textModeration: true,
      imageModeration: true,
      audioModeration: true,
      videoModeration: true,
      realTimeModeration: true,
      aiPoweredModeration: true,
      customRules: true,
      userReporting: true,
      appealSystem: true
    };
    
    // Moderation categories
    this.moderationCategories = {
      spam: {
        severity: 'medium',
        action: 'flag',
        description: 'Spam or promotional content'
      },
      harassment: {
        severity: 'high',
        action: 'block',
        description: 'Harassment or bullying'
      },
      hate_speech: {
        severity: 'critical',
        action: 'block',
        description: 'Hate speech or discriminatory content'
      },
      violence: {
        severity: 'critical',
        action: 'block',
        description: 'Violent or threatening content'
      },
      adult_content: {
        severity: 'high',
        action: 'block',
        description: 'Adult or inappropriate content'
      },
      misinformation: {
        severity: 'medium',
        action: 'flag',
        description: 'False or misleading information'
      },
      copyright: {
        severity: 'high',
        action: 'block',
        description: 'Copyright infringement'
      },
      privacy: {
        severity: 'high',
        action: 'block',
        description: 'Privacy violation or personal information'
      },
      self_harm: {
        severity: 'critical',
        action: 'block',
        description: 'Self-harm or suicide-related content'
      },
      terrorism: {
        severity: 'critical',
        action: 'block',
        description: 'Terrorist or extremist content'
      }
    };
    
    // Moderation rules
    this.moderationRules = {
      // Text-based rules
      text: {
        profanity: {
          enabled: true,
          severity: 'medium',
          patterns: ['fuck', 'shit', 'damn', 'bitch', 'asshole'],
          action: 'flag'
        },
        spam: {
          enabled: true,
          severity: 'medium',
          patterns: ['buy now', 'click here', 'free money', 'urgent'],
          action: 'flag'
        },
        harassment: {
          enabled: true,
          severity: 'high',
          patterns: ['kill yourself', 'you should die', 'hate you'],
          action: 'block'
        },
        hate_speech: {
          enabled: true,
          severity: 'critical',
          patterns: ['nigger', 'faggot', 'retard', 'chink'],
          action: 'block'
        }
      },
      // Image-based rules
      image: {
        adult_content: {
          enabled: true,
          severity: 'high',
          action: 'block'
        },
        violence: {
          enabled: true,
          severity: 'critical',
          action: 'block'
        },
        gore: {
          enabled: true,
          severity: 'critical',
          action: 'block'
        }
      },
      // Audio-based rules
      audio: {
        profanity: {
          enabled: true,
          severity: 'medium',
          action: 'flag'
        },
        harassment: {
          enabled: true,
          severity: 'high',
          action: 'block'
        }
      }
    };
    
    // Moderation history
    this.moderationHistory = [];
    this.flaggedContent = [];
    this.blockedContent = [];
    this.appeals = [];
    
    // User moderation status
    this.userModerationStatus = new Map();
    this.userViolations = new Map();
    
    // Moderation metrics
    this.moderationMetrics = {
      totalContent: 0,
      flaggedContent: 0,
      blockedContent: 0,
      falsePositives: 0,
      falseNegatives: 0,
      averageProcessingTime: 0,
      accuracy: 0
    };
    
    // AI moderation models
    this.aiModels = {
      textClassifier: null,
      imageClassifier: null,
      audioClassifier: null,
      sentimentAnalyzer: null
    };
    
    // Moderation thresholds
    this.moderationThresholds = {
      confidence: 0.8,
      severity: 'medium',
      autoAction: true
    };
    
    // Appeal system
    this.appealConfig = {
      enabled: true,
      maxAppeals: 3,
      reviewTime: 24 * 60 * 60 * 1000, // 24 hours
      autoApprove: false
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await EmotionalIntelligenceService.initialize();
      await this.loadModerationData();
      await this.loadModerationRules();
      await this.initializeAIModels();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing ContentModerationService:', error);
    }
  }

  // Main content moderation
  async moderateContent(content, type, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const operation = {
        service: 'content_moderation',
        execute: async () => {
          return await this.performContentModeration(content, type, options);
        }
      };
      
      const result = await ErrorRecoveryService.executeWithRecovery(operation, { content, type, options });
      
      // Update metrics
      this.updateModerationMetrics(result, Date.now() - startTime);
      
      // Store moderation result
      await this.storeModerationResult(result);
      
      // Log moderation event
      await MetricsService.log('content_moderated', {
        type,
        action: result.action,
        severity: result.severity,
        confidence: result.confidence,
        duration: Date.now() - startTime
      });
      
      return result;
      
    } catch (error) {
      await MetricsService.log('content_moderation_error', {
        type,
        error: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  async performContentModeration(content, type, options) {
    const moderationResult = {
      id: this.generateModerationId(),
      content: content,
      type: type,
      timestamp: new Date().toISOString(),
      violations: [],
      action: 'allow',
      severity: 'low',
      confidence: 0,
      reasoning: [],
      metadata: options
    };
    
    // Perform moderation based on content type
    switch (type) {
      case 'text':
        await this.moderateText(content, moderationResult);
        break;
      case 'image':
        await this.moderateImage(content, moderationResult);
        break;
      case 'audio':
        await this.moderateAudio(content, moderationResult);
        break;
      case 'video':
        await this.moderateVideo(content, moderationResult);
        break;
      default:
        await this.moderateText(content, moderationResult);
    }
    
    // Apply emotional intelligence analysis
    if (type === 'text') {
      await this.applyEmotionalIntelligence(content, moderationResult);
    }
    
    // Determine final action
    this.determineFinalAction(moderationResult);
    
    return moderationResult;
  }

  // Text moderation
  async moderateText(text, result) {
    // Rule-based moderation
    await this.applyTextRules(text, result);
    
    // AI-powered moderation
    await this.applyAITextModeration(text, result);
    
    // Sentiment analysis
    await this.applySentimentAnalysis(text, result);
    
    // Spam detection
    await this.detectSpam(text, result);
    
    // Harassment detection
    await this.detectHarassment(text, result);
  }

  async applyTextRules(text, result) {
    const textRules = this.moderationRules.text;
    const lowerText = text.toLowerCase();
    
    Object.keys(textRules).forEach(ruleName => {
      const rule = textRules[ruleName];
      if (!rule.enabled) return;
      
      rule.patterns.forEach(pattern => {
        if (lowerText.includes(pattern.toLowerCase())) {
          result.violations.push({
            category: ruleName,
            severity: rule.severity,
            confidence: 0.9,
            pattern: pattern,
            rule: ruleName
          });
          result.reasoning.push(`Detected ${ruleName} pattern: "${pattern}"`);
        }
      });
    });
  }

  async applyAITextModeration(text, result) {
    try {
      // Simulate AI text classification
      const aiResult = await this.classifyTextWithAI(text);
      
      if (aiResult.confidence > this.moderationThresholds.confidence) {
        result.violations.push({
          category: aiResult.category,
          severity: aiResult.severity,
          confidence: aiResult.confidence,
          source: 'ai_classifier'
        });
        result.reasoning.push(`AI detected ${aiResult.category} with ${(aiResult.confidence * 100).toFixed(1)}% confidence`);
      }
    } catch (error) {
      console.error('Error in AI text moderation:', error);
    }
  }

  async applySentimentAnalysis(text, result) {
    try {
      const sentiment = await EmotionalIntelligenceService.analyzeSentiment(text);
      
      // Flag extremely negative sentiment
      if (sentiment.polarity === 'negative' && sentiment.intensity > 0.8) {
        result.violations.push({
          category: 'negative_sentiment',
          severity: 'medium',
          confidence: sentiment.confidence,
          sentiment: sentiment
        });
        result.reasoning.push(`Extremely negative sentiment detected (intensity: ${sentiment.intensity.toFixed(2)})`);
      }
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
    }
  }

  async detectSpam(text, result) {
    const spamIndicators = [
      /(?:buy|purchase|order)\s+(?:now|today|immediately)/i,
      /(?:click|visit)\s+(?:here|this\s+link)/i,
      /(?:free|no\s+cost|no\s+charge)\s+(?:money|cash|gift)/i,
      /(?:urgent|limited\s+time|act\s+now)/i,
      /(?:guaranteed|100%\s+guaranteed)/i,
      /(?:make\s+money|earn\s+money|get\s+rich)/i
    ];
    
    let spamScore = 0;
    spamIndicators.forEach(pattern => {
      if (pattern.test(text)) {
        spamScore += 1;
      }
    });
    
    if (spamScore >= 2) {
      result.violations.push({
        category: 'spam',
        severity: 'medium',
        confidence: Math.min(0.9, spamScore * 0.3),
        spamScore: spamScore
      });
      result.reasoning.push(`Spam detected with score: ${spamScore}`);
    }
  }

  async detectHarassment(text, result) {
    const harassmentPatterns = [
      /(?:kill|murder|destroy)\s+(?:yourself|you)/i,
      /(?:you\s+should\s+die|die\s+already)/i,
      /(?:hate\s+you|despise\s+you)/i,
      /(?:worthless|useless|pathetic)/i,
      /(?:nobody\s+likes\s+you|everyone\s+hates\s+you)/i
    ];
    
    harassmentPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        result.violations.push({
          category: 'harassment',
          severity: 'high',
          confidence: 0.9,
          pattern: pattern.source
        });
        result.reasoning.push(`Harassment pattern detected: ${pattern.source}`);
      }
    });
  }

  // Image moderation
  async moderateImage(imageData, result) {
    try {
      // Simulate image analysis
      const imageAnalysis = await this.analyzeImageWithAI(imageData);
      
      if (imageAnalysis.confidence > this.moderationThresholds.confidence) {
        result.violations.push({
          category: imageAnalysis.category,
          severity: imageAnalysis.severity,
          confidence: imageAnalysis.confidence,
          source: 'ai_image_classifier'
        });
        result.reasoning.push(`AI detected ${imageAnalysis.category} in image with ${(imageAnalysis.confidence * 100).toFixed(1)}% confidence`);
      }
    } catch (error) {
      console.error('Error in image moderation:', error);
    }
  }

  // Audio moderation
  async moderateAudio(audioData, result) {
    try {
      // Simulate audio analysis
      const audioAnalysis = await this.analyzeAudioWithAI(audioData);
      
      if (audioAnalysis.confidence > this.moderationThresholds.confidence) {
        result.violations.push({
          category: audioAnalysis.category,
          severity: audioAnalysis.severity,
          confidence: audioAnalysis.confidence,
          source: 'ai_audio_classifier'
        });
        result.reasoning.push(`AI detected ${audioAnalysis.category} in audio with ${(audioAnalysis.confidence * 100).toFixed(1)}% confidence`);
      }
    } catch (error) {
      console.error('Error in audio moderation:', error);
    }
  }

  // Video moderation
  async moderateVideo(videoData, result) {
    try {
      // Simulate video analysis
      const videoAnalysis = await this.analyzeVideoWithAI(videoData);
      
      if (videoAnalysis.confidence > this.moderationThresholds.confidence) {
        result.violations.push({
          category: videoAnalysis.category,
          severity: videoAnalysis.severity,
          confidence: videoAnalysis.confidence,
          source: 'ai_video_classifier'
        });
        result.reasoning.push(`AI detected ${videoAnalysis.category} in video with ${(videoAnalysis.confidence * 100).toFixed(1)}% confidence`);
      }
    } catch (error) {
      console.error('Error in video moderation:', error);
    }
  }

  // Emotional intelligence integration
  async applyEmotionalIntelligence(text, result) {
    try {
      const emotionResult = await EmotionalIntelligenceService.detectEmotion(text, 'text');
      
      // Flag content that might indicate self-harm or extreme distress
      if (emotionResult.primaryEmotion === 'sadness' && emotionResult.confidence > 0.8) {
        result.violations.push({
          category: 'emotional_distress',
          severity: 'medium',
          confidence: emotionResult.confidence,
          emotion: emotionResult.primaryEmotion
        });
        result.reasoning.push(`High sadness detected (${(emotionResult.confidence * 100).toFixed(1)}% confidence) - may need support`);
      }
      
      if (emotionResult.primaryEmotion === 'anger' && emotionResult.confidence > 0.9) {
        result.violations.push({
          category: 'aggressive_content',
          severity: 'high',
          confidence: emotionResult.confidence,
          emotion: emotionResult.primaryEmotion
        });
        result.reasoning.push(`High anger detected (${(emotionResult.confidence * 100).toFixed(1)}% confidence) - potentially aggressive content`);
      }
    } catch (error) {
      console.error('Error in emotional intelligence analysis:', error);
    }
  }

  // AI model simulation
  async classifyTextWithAI(text) {
    // Simulate AI text classification
    const categories = ['spam', 'harassment', 'hate_speech', 'violence', 'adult_content'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0
    
    return {
      category: randomCategory,
      confidence: confidence,
      severity: this.moderationCategories[randomCategory]?.severity || 'medium'
    };
  }

  async analyzeImageWithAI(imageData) {
    // Simulate AI image analysis
    const categories = ['adult_content', 'violence', 'gore', 'spam'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
    
    return {
      category: randomCategory,
      confidence: confidence,
      severity: this.moderationCategories[randomCategory]?.severity || 'medium'
    };
  }

  async analyzeAudioWithAI(audioData) {
    // Simulate AI audio analysis
    const categories = ['profanity', 'harassment', 'adult_content'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
    
    return {
      category: randomCategory,
      confidence: confidence,
      severity: this.moderationCategories[randomCategory]?.severity || 'medium'
    };
  }

  async analyzeVideoWithAI(videoData) {
    // Simulate AI video analysis
    const categories = ['adult_content', 'violence', 'gore', 'spam'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
    
    return {
      category: randomCategory,
      confidence: confidence,
      severity: this.moderationCategories[randomCategory]?.severity || 'medium'
    };
  }

  // Action determination
  determineFinalAction(result) {
    if (result.violations.length === 0) {
      result.action = 'allow';
      result.severity = 'low';
      result.confidence = 0.1;
      return;
    }
    
    // Find highest severity violation
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const highestSeverity = result.violations.reduce((max, violation) => 
      severityOrder[violation.severity] > severityOrder[max] ? violation.severity : max, 'low'
    );
    
    result.severity = highestSeverity;
    
    // Calculate overall confidence
    const totalConfidence = result.violations.reduce((sum, violation) => sum + violation.confidence, 0);
    result.confidence = totalConfidence / result.violations.length;
    
    // Determine action based on severity and confidence
    if (highestSeverity === 'critical' && result.confidence > 0.8) {
      result.action = 'block';
    } else if (highestSeverity === 'high' && result.confidence > 0.7) {
      result.action = 'block';
    } else if (highestSeverity === 'medium' && result.confidence > 0.6) {
      result.action = 'flag';
    } else {
      result.action = 'review';
    }
  }

  // User moderation management
  async updateUserModerationStatus(userId, violation) {
    const currentStatus = this.userModerationStatus.get(userId) || {
      violations: 0,
      warnings: 0,
      blocks: 0,
      lastViolation: null,
      status: 'active'
    };
    
    currentStatus.violations += 1;
    currentStatus.lastViolation = new Date().toISOString();
    
    if (violation.severity === 'critical') {
      currentStatus.blocks += 1;
      currentStatus.status = 'blocked';
    } else if (violation.severity === 'high') {
      currentStatus.warnings += 1;
      if (currentStatus.warnings >= 3) {
        currentStatus.status = 'restricted';
      }
    }
    
    this.userModerationStatus.set(userId, currentStatus);
    await this.saveUserModerationStatus();
  }

  // Appeal system
  async submitAppeal(moderationId, userId, reason) {
    if (!this.appealConfig.enabled) {
      throw new Error('Appeal system is disabled');
    }
    
    const userAppeals = this.appeals.filter(a => a.userId === userId);
    if (userAppeals.length >= this.appealConfig.maxAppeals) {
      throw new Error('Maximum appeals reached');
    }
    
    const appeal = {
      id: this.generateAppealId(),
      moderationId: moderationId,
      userId: userId,
      reason: reason,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      decision: null
    };
    
    this.appeals.push(appeal);
    await this.saveAppeals();
    
    return appeal;
  }

  async reviewAppeal(appealId, reviewerId, decision, notes) {
    const appeal = this.appeals.find(a => a.id === appealId);
    if (!appeal) {
      throw new Error('Appeal not found');
    }
    
    appeal.status = 'reviewed';
    appeal.reviewedAt = new Date().toISOString();
    appeal.reviewedBy = reviewerId;
    appeal.decision = decision;
    appeal.notes = notes;
    
    // Update moderation result if appeal is approved
    if (decision === 'approved') {
      const moderationResult = this.moderationHistory.find(m => m.id === appeal.moderationId);
      if (moderationResult) {
        moderationResult.action = 'allow';
        moderationResult.appealApproved = true;
      }
    }
    
    await this.saveAppeals();
    return appeal;
  }

  // Metrics and monitoring
  updateModerationMetrics(result, processingTime) {
    this.moderationMetrics.totalContent += 1;
    
    if (result.action === 'flag') {
      this.moderationMetrics.flaggedContent += 1;
    } else if (result.action === 'block') {
      this.moderationMetrics.blockedContent += 1;
    }
    
    // Update average processing time
    this.moderationMetrics.averageProcessingTime = 
      (this.moderationMetrics.averageProcessingTime * (this.moderationMetrics.totalContent - 1) + processingTime) / 
      this.moderationMetrics.totalContent;
    
    // Update accuracy (simplified)
    this.moderationMetrics.accuracy = 
      (this.moderationMetrics.totalContent - this.moderationMetrics.falsePositives - this.moderationMetrics.falseNegatives) / 
      this.moderationMetrics.totalContent;
  }

  // Data storage
  async storeModerationResult(result) {
    this.moderationHistory.push(result);
    
    if (result.action === 'flag') {
      this.flaggedContent.push(result);
    } else if (result.action === 'block') {
      this.blockedContent.push(result);
    }
    
    // Maintain history size
    if (this.moderationHistory.length > 10000) {
      this.moderationHistory = this.moderationHistory.slice(-10000);
    }
    
    await this.saveModerationHistory();
  }

  // Utility methods
  generateModerationId() {
    return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAppealId() {
    return `appeal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // AI model initialization
  async initializeAIModels() {
    // Initialize AI models for content moderation
    // In production, this would load actual ML models
    this.aiModels.textClassifier = 'initialized';
    this.aiModels.imageClassifier = 'initialized';
    this.aiModels.audioClassifier = 'initialized';
    this.aiModels.sentimentAnalyzer = 'initialized';
  }

  // Persistence
  async loadModerationData() {
    try {
      const stored = await AsyncStorage.getItem('moderation_history');
      if (stored) {
        this.moderationHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading moderation data:', error);
    }
  }

  async saveModerationHistory() {
    try {
      await AsyncStorage.setItem('moderation_history', JSON.stringify(this.moderationHistory));
    } catch (error) {
      console.error('Error saving moderation history:', error);
    }
  }

  async loadModerationRules() {
    try {
      const stored = await AsyncStorage.getItem('moderation_rules');
      if (stored) {
        this.moderationRules = { ...this.moderationRules, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading moderation rules:', error);
    }
  }

  async saveModerationRules() {
    try {
      await AsyncStorage.setItem('moderation_rules', JSON.stringify(this.moderationRules));
    } catch (error) {
      console.error('Error saving moderation rules:', error);
    }
  }

  async saveUserModerationStatus() {
    try {
      const data = Array.from(this.userModerationStatus.entries());
      await AsyncStorage.setItem('user_moderation_status', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user moderation status:', error);
    }
  }

  async saveAppeals() {
    try {
      await AsyncStorage.setItem('appeals', JSON.stringify(this.appeals));
    } catch (error) {
      console.error('Error saving appeals:', error);
    }
  }

  // Health check
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      moderationCapabilities: this.moderationCapabilities,
      moderationCategories: Object.keys(this.moderationCategories),
      moderationRules: Object.keys(this.moderationRules),
      moderationMetrics: this.moderationMetrics,
      moderationHistorySize: this.moderationHistory.length,
      flaggedContentSize: this.flaggedContent.length,
      blockedContentSize: this.blockedContent.length,
      appealsCount: this.appeals.length,
      userModerationStatusSize: this.userModerationStatus.size,
      aiModels: Object.keys(this.aiModels),
      moderationThresholds: this.moderationThresholds,
      appealConfig: this.appealConfig
    };
  }
}

export default new ContentModerationService();
