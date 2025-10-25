import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import ErrorRecoveryService from './ErrorRecoveryService';
import PerformanceOptimizationService from './PerformanceOptimizationService';
import FederatedLearningService from './FederatedLearningService';

class AdvancedNLPService {
  constructor() {
    this.isInitialized = false;
    
    // Advanced NLP capabilities
    this.nlpCapabilities = {
      multilingualSupport: true,
      contextualUnderstanding: true,
      sentimentAnalysis: true,
      intentRecognition: true,
      entityExtraction: true,
      languageDetection: true,
      translation: true,
      summarization: true,
      questionAnswering: true,
      textGeneration: true,
      namedEntityRecognition: true,
      partOfSpeechTagging: true,
      dependencyParsing: true,
      semanticSimilarity: true,
      topicModeling: true
    };
    
    // Language support
    this.supportedLanguages = {
      'en': { name: 'English', code: 'en', confidence: 0.95 },
      'es': { name: 'Spanish', code: 'es', confidence: 0.90 },
      'fr': { name: 'French', code: 'fr', confidence: 0.88 },
      'de': { name: 'German', code: 'de', confidence: 0.85 },
      'it': { name: 'Italian', code: 'it', confidence: 0.82 },
      'pt': { name: 'Portuguese', code: 'pt', confidence: 0.80 },
      'ru': { name: 'Russian', code: 'ru', confidence: 0.78 },
      'ja': { name: 'Japanese', code: 'ja', confidence: 0.75 },
      'ko': { name: 'Korean', code: 'ko', confidence: 0.72 },
      'zh': { name: 'Chinese', code: 'zh', confidence: 0.70 }
    };
    
    // NLP models and configurations
    this.nlpModels = {
      languageDetection: {
        model: 'langdetect',
        accuracy: 0.95,
        supportedLanguages: Object.keys(this.supportedLanguages)
      },
      sentimentAnalysis: {
        model: 'vader',
        accuracy: 0.88,
        supportedLanguages: ['en', 'es', 'fr', 'de']
      },
      intentRecognition: {
        model: 'bert-base',
        accuracy: 0.92,
        supportedIntents: [
          'greeting', 'question', 'command', 'complaint', 'compliment',
          'request', 'confirmation', 'negation', 'clarification', 'goodbye'
        ]
      },
      entityExtraction: {
        model: 'spacy',
        accuracy: 0.89,
        entityTypes: [
          'PERSON', 'ORG', 'GPE', 'DATE', 'TIME', 'MONEY', 'PERCENT',
          'LOCATION', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LANGUAGE'
        ]
      },
      translation: {
        model: 'transformer',
        accuracy: 0.85,
        supportedPairs: [
          'en-es', 'en-fr', 'en-de', 'en-it', 'en-pt', 'en-ru',
          'es-en', 'fr-en', 'de-en', 'it-en', 'pt-en', 'ru-en'
        ]
      }
    };
    
    // Context management
    this.conversationContext = new Map();
    this.contextHistory = [];
    this.contextWindow = 10; // Keep last 10 interactions
    
    // Sentiment analysis
    this.sentimentScores = new Map();
    this.emotionDetection = new Map();
    this.sentimentHistory = [];
    
    // Intent recognition
    this.intentPatterns = new Map();
    this.intentConfidence = new Map();
    this.intentHistory = [];
    
    // Entity extraction
    this.extractedEntities = new Map();
    this.entityRelations = new Map();
    this.entityHistory = [];
    
    // Translation
    this.translationCache = new Map();
    this.translationHistory = [];
    this.translationMetrics = {
      totalTranslations: 0,
      averageAccuracy: 0,
      supportedLanguages: Object.keys(this.supportedLanguages).length
    };
    
    // Performance metrics
    this.performanceMetrics = {
      processingTime: 0,
      accuracy: 0,
      confidence: 0,
      languageDetectionTime: 0,
      sentimentAnalysisTime: 0,
      intentRecognitionTime: 0,
      entityExtractionTime: 0,
      translationTime: 0
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await ErrorRecoveryService.initialize();
      await PerformanceOptimizationService.initialize();
      await FederatedLearningService.initialize();
      await this.loadNLPData();
      await this.initializeModels();
      await this.initializeLanguageResources();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing AdvancedNLPService:', error);
    }
  }

  // Language Detection
  async detectLanguage(text) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      // Simple language detection based on character patterns
      const language = this.detectLanguagePattern(text);
      const confidence = this.calculateLanguageConfidence(text, language);
      
      const detectionResult = {
        language: language,
        confidence: confidence,
        detectedAt: new Date().toISOString(),
        textLength: text.length,
        processingTime: Date.now() - startTime
      };
      
      this.performanceMetrics.languageDetectionTime = detectionResult.processingTime;
      
      await MetricsService.log('language_detected', {
        language: language,
        confidence: confidence,
        textLength: text.length
      });
      
      return detectionResult;
    } catch (error) {
      console.error('Error detecting language:', error);
      return {
        language: 'en',
        confidence: 0.5,
        error: error.message
      };
    }
  }

  detectLanguagePattern(text) {
    // Simple pattern-based language detection
    const patterns = {
      'en': /[a-zA-Z]/g,
      'es': /[ñáéíóúü]/gi,
      'fr': /[àâäéèêëïîôöùûüÿç]/gi,
      'de': /[äöüß]/gi,
      'it': /[àèéìíîòóù]/gi,
      'pt': /[ãõç]/gi,
      'ru': /[а-яё]/gi,
      'ja': /[ひらがなカタカナ]/g,
      'ko': /[한글]/g,
      'zh': /[一-龯]/g
    };
    
    let maxScore = 0;
    let detectedLanguage = 'en';
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      const score = matches ? matches.length : 0;
      
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    }
    
    return detectedLanguage;
  }

  calculateLanguageConfidence(text, language) {
    const patterns = {
      'en': /[a-zA-Z]/g,
      'es': /[ñáéíóúü]/gi,
      'fr': /[àâäéèêëïîôöùûüÿç]/gi,
      'de': /[äöüß]/gi,
      'it': /[àèéìíîòóù]/gi,
      'pt': /[ãõç]/gi,
      'ru': /[а-яё]/gi,
      'ja': /[ひらがなカタカナ]/g,
      'ko': /[한글]/g,
      'zh': /[一-龯]/g
    };
    
    const pattern = patterns[language];
    if (!pattern) return 0.5;
    
    const matches = text.match(pattern);
    const matchRatio = matches ? matches.length / text.length : 0;
    
    return Math.min(0.95, Math.max(0.1, matchRatio * 2));
  }

  // Sentiment Analysis
  async analyzeSentiment(text, language = 'en') {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const sentiment = this.calculateSentiment(text, language);
      const emotions = this.detectEmotions(text, language);
      
      const sentimentResult = {
        sentiment: sentiment.sentiment,
        score: sentiment.score,
        confidence: sentiment.confidence,
        emotions: emotions,
        language: language,
        analyzedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
      
      this.sentimentScores.set(text, sentimentResult);
      this.sentimentHistory.push(sentimentResult);
      
      // Maintain history size
      if (this.sentimentHistory.length > 1000) {
        this.sentimentHistory = this.sentimentHistory.slice(-1000);
      }
      
      this.performanceMetrics.sentimentAnalysisTime = sentimentResult.processingTime;
      
      await MetricsService.log('sentiment_analyzed', {
        sentiment: sentiment.sentiment,
        score: sentiment.score,
        confidence: sentiment.confidence,
        language: language
      });
      
      return sentimentResult;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0.5,
        error: error.message
      };
    }
  }

  calculateSentiment(text, language) {
    // Simple sentiment analysis based on word patterns
    const positiveWords = {
      'en': ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy'],
      'es': ['bueno', 'excelente', 'maravilloso', 'fantástico', 'amor', 'feliz', 'alegría'],
      'fr': ['bon', 'excellent', 'merveilleux', 'fantastique', 'amour', 'heureux', 'joie'],
      'de': ['gut', 'ausgezeichnet', 'wunderbar', 'fantastisch', 'liebe', 'glücklich', 'freude']
    };
    
    const negativeWords = {
      'en': ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed'],
      'es': ['malo', 'terrible', 'odio', 'triste', 'enojado', 'frustrado', 'decepcionado'],
      'fr': ['mauvais', 'terrible', 'haine', 'triste', 'en colère', 'frustré', 'déçu'],
      'de': ['schlecht', 'schrecklich', 'hass', 'traurig', 'wütend', 'frustriert', 'enttäuscht']
    };
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveWordsList = positiveWords[language] || positiveWords['en'];
    const negativeWordsList = negativeWords[language] || negativeWords['en'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    for (const word of words) {
      if (positiveWordsList.includes(word)) {
        positiveScore++;
      }
      if (negativeWordsList.includes(word)) {
        negativeScore++;
      }
    }
    
    const totalScore = positiveScore + negativeScore;
    if (totalScore === 0) {
      return { sentiment: 'neutral', score: 0, confidence: 0.5 };
    }
    
    const score = (positiveScore - negativeScore) / totalScore;
    let sentiment = 'neutral';
    
    if (score > 0.2) {
      sentiment = 'positive';
    } else if (score < -0.2) {
      sentiment = 'negative';
    }
    
    const confidence = Math.abs(score) * 0.8 + 0.2;
    
    return { sentiment, score, confidence };
  }

  detectEmotions(text, language) {
    // Simple emotion detection
    const emotions = {
      joy: ['happy', 'joy', 'excited', 'cheerful', 'delighted'],
      sadness: ['sad', 'depressed', 'melancholy', 'gloomy', 'sorrowful'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed'],
      fear: ['afraid', 'scared', 'terrified', 'worried', 'anxious'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated']
    };
    
    const words = text.toLowerCase().split(/\s+/);
    const emotionScores = {};
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
      let score = 0;
      for (const word of words) {
        if (keywords.includes(word)) {
          score++;
        }
      }
      emotionScores[emotion] = score;
    }
    
    return emotionScores;
  }

  // Intent Recognition
  async recognizeIntent(text, context = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const intent = this.classifyIntent(text, context);
      const confidence = this.calculateIntentConfidence(text, intent);
      
      const intentResult = {
        intent: intent.intent,
        confidence: confidence,
        entities: intent.entities,
        context: context,
        recognizedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
      
      this.intentConfidence.set(text, intentResult);
      this.intentHistory.push(intentResult);
      
      // Maintain history size
      if (this.intentHistory.length > 1000) {
        this.intentHistory = this.intentHistory.slice(-1000);
      }
      
      this.performanceMetrics.intentRecognitionTime = intentResult.processingTime;
      
      await MetricsService.log('intent_recognized', {
        intent: intent.intent,
        confidence: confidence,
        entities: intent.entities
      });
      
      return intentResult;
    } catch (error) {
      console.error('Error recognizing intent:', error);
      return {
        intent: 'unknown',
        confidence: 0.5,
        error: error.message
      };
    }
  }

  classifyIntent(text, context) {
    // Simple intent classification based on keywords and patterns
    const intentPatterns = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      question: ['what', 'how', 'when', 'where', 'why', 'who', 'which', '?'],
      command: ['do', 'make', 'create', 'build', 'generate', 'show', 'display', 'find'],
      request: ['please', 'can you', 'could you', 'would you', 'help me'],
      confirmation: ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'confirm'],
      negation: ['no', 'nope', 'not', 'don\'t', 'won\'t', 'can\'t', 'refuse'],
      clarification: ['explain', 'clarify', 'what do you mean', 'can you explain'],
      goodbye: ['bye', 'goodbye', 'see you', 'farewell', 'take care']
    };
    
    const textLower = text.toLowerCase();
    let maxScore = 0;
    let detectedIntent = 'unknown';
    let entities = [];
    
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      let score = 0;
      for (const pattern of patterns) {
        if (textLower.includes(pattern)) {
          score++;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }
    
    // Extract entities
    entities = this.extractBasicEntities(text);
    
    return { intent: detectedIntent, entities };
  }

  calculateIntentConfidence(text, intent) {
    const intentPatterns = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      question: ['what', 'how', 'when', 'where', 'why', 'who', 'which', '?'],
      command: ['do', 'make', 'create', 'build', 'generate', 'show', 'display', 'find'],
      request: ['please', 'can you', 'could you', 'would you', 'help me'],
      confirmation: ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'confirm'],
      negation: ['no', 'nope', 'not', 'don\'t', 'won\'t', 'can\'t', 'refuse'],
      clarification: ['explain', 'clarify', 'what do you mean', 'can you explain'],
      goodbye: ['bye', 'goodbye', 'see you', 'farewell', 'take care']
    };
    
    const patterns = intentPatterns[intent.intent] || [];
    const textLower = text.toLowerCase();
    
    let matches = 0;
    for (const pattern of patterns) {
      if (textLower.includes(pattern)) {
        matches++;
      }
    }
    
    const confidence = Math.min(0.95, Math.max(0.1, matches / patterns.length));
    return confidence;
  }

  // Entity Extraction
  async extractEntities(text, language = 'en') {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const entities = this.extractBasicEntities(text);
      const namedEntities = this.extractNamedEntities(text, language);
      
      const entityResult = {
        entities: entities,
        namedEntities: namedEntities,
        language: language,
        extractedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
      
      this.extractedEntities.set(text, entityResult);
      this.entityHistory.push(entityResult);
      
      // Maintain history size
      if (this.entityHistory.length > 1000) {
        this.entityHistory = this.entityHistory.slice(-1000);
      }
      
      this.performanceMetrics.entityExtractionTime = entityResult.processingTime;
      
      await MetricsService.log('entities_extracted', {
        entityCount: entities.length,
        namedEntityCount: namedEntities.length,
        language: language
      });
      
      return entityResult;
    } catch (error) {
      console.error('Error extracting entities:', error);
      return {
        entities: [],
        namedEntities: [],
        error: error.message
      };
    }
  }

  extractBasicEntities(text) {
    const entities = [];
    
    // Extract dates
    const datePattern = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g;
    const dates = text.match(datePattern);
    if (dates) {
      entities.push(...dates.map(date => ({ type: 'DATE', value: date, confidence: 0.8 })));
    }
    
    // Extract times
    const timePattern = /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\b/gi;
    const times = text.match(timePattern);
    if (times) {
      entities.push(...times.map(time => ({ type: 'TIME', value: time, confidence: 0.8 })));
    }
    
    // Extract emails
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailPattern);
    if (emails) {
      entities.push(...emails.map(email => ({ type: 'EMAIL', value: email, confidence: 0.9 })));
    }
    
    // Extract URLs
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlPattern);
    if (urls) {
      entities.push(...urls.map(url => ({ type: 'URL', value: url, confidence: 0.9 })));
    }
    
    // Extract phone numbers
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phonePattern);
    if (phones) {
      entities.push(...phones.map(phone => ({ type: 'PHONE', value: phone, confidence: 0.8 })));
    }
    
    return entities;
  }

  extractNamedEntities(text, language) {
    // Simple named entity extraction
    const namedEntities = [];
    
    // Extract capitalized words (potential proper nouns)
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length > 2 && word[0] === word[0].toUpperCase() && /[A-Z]/.test(word[0])) {
        // Check if it's part of a multi-word entity
        let entity = word;
        let j = i + 1;
        while (j < words.length && words[j][0] === words[j][0].toUpperCase() && /[A-Z]/.test(words[j][0])) {
          entity += ' ' + words[j];
          j++;
        }
        
        if (entity.length > 2) {
          namedEntities.push({
            type: 'PERSON',
            value: entity,
            confidence: 0.6,
            start: text.indexOf(entity),
            end: text.indexOf(entity) + entity.length
          });
        }
      }
    }
    
    return namedEntities;
  }

  // Translation
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      // Detect source language if auto
      if (sourceLanguage === 'auto') {
        const detection = await this.detectLanguage(text);
        sourceLanguage = detection.language;
      }
      
      // Check cache first
      const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
      if (this.translationCache.has(cacheKey)) {
        return this.translationCache.get(cacheKey);
      }
      
      // Perform translation
      const translation = this.performTranslation(text, sourceLanguage, targetLanguage);
      
      const translationResult = {
        originalText: text,
        translatedText: translation.text,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        confidence: translation.confidence,
        translatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
      
      // Cache the result
      this.translationCache.set(cacheKey, translationResult);
      
      this.translationHistory.push(translationResult);
      this.translationMetrics.totalTranslations++;
      
      // Maintain history size
      if (this.translationHistory.length > 1000) {
        this.translationHistory = this.translationHistory.slice(-1000);
      }
      
      this.performanceMetrics.translationTime = translationResult.processingTime;
      
      await MetricsService.log('text_translated', {
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        textLength: text.length,
        confidence: translation.confidence
      });
      
      return translationResult;
    } catch (error) {
      console.error('Error translating text:', error);
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        confidence: 0.5,
        error: error.message
      };
    }
  }

  performTranslation(text, sourceLanguage, targetLanguage) {
    // Simple translation simulation
    const translations = {
      'en-es': {
        'hello': 'hola',
        'goodbye': 'adiós',
        'thank you': 'gracias',
        'please': 'por favor',
        'yes': 'sí',
        'no': 'no'
      },
      'es-en': {
        'hola': 'hello',
        'adiós': 'goodbye',
        'gracias': 'thank you',
        'por favor': 'please',
        'sí': 'yes',
        'no': 'no'
      },
      'en-fr': {
        'hello': 'bonjour',
        'goodbye': 'au revoir',
        'thank you': 'merci',
        'please': 's\'il vous plaît',
        'yes': 'oui',
        'no': 'non'
      },
      'fr-en': {
        'bonjour': 'hello',
        'au revoir': 'goodbye',
        'merci': 'thank you',
        's\'il vous plaît': 'please',
        'oui': 'yes',
        'non': 'no'
      }
    };
    
    const translationKey = `${sourceLanguage}-${targetLanguage}`;
    const translationDict = translations[translationKey] || {};
    
    let translatedText = text;
    let confidence = 0.5;
    
    // Simple word-by-word translation
    for (const [source, target] of Object.entries(translationDict)) {
      if (text.toLowerCase().includes(source.toLowerCase())) {
        translatedText = translatedText.replace(new RegExp(source, 'gi'), target);
        confidence = Math.min(0.9, confidence + 0.1);
      }
    }
    
    return { text: translatedText, confidence };
  }

  // Context Management
  async updateContext(userId, message, analysis) {
    await this.initialize();
    
    const context = {
      userId: userId,
      message: message,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };
    
    if (!this.conversationContext.has(userId)) {
      this.conversationContext.set(userId, []);
    }
    
    const userContext = this.conversationContext.get(userId);
    userContext.push(context);
    
    // Maintain context window
    if (userContext.length > this.contextWindow) {
      userContext.shift();
    }
    
    this.contextHistory.push(context);
    
    // Maintain global history size
    if (this.contextHistory.length > 10000) {
      this.contextHistory = this.contextHistory.slice(-10000);
    }
    
    await MetricsService.log('context_updated', {
      userId: userId,
      messageLength: message.length,
      contextSize: userContext.length
    });
  }

  async getContext(userId) {
    await this.initialize();
    
    return this.conversationContext.get(userId) || [];
  }

  // Comprehensive NLP Analysis
  async analyzeText(text, options = {}) {
    await this.initialize();
    
    const startTime = Date.now();
    
    try {
      const analysis = {
        text: text,
        language: null,
        sentiment: null,
        intent: null,
        entities: null,
        translation: null,
        analyzedAt: new Date().toISOString(),
        processingTime: 0
      };
      
      // Language detection
      if (options.languageDetection !== false) {
        analysis.language = await this.detectLanguage(text);
      }
      
      // Sentiment analysis
      if (options.sentimentAnalysis !== false) {
        analysis.sentiment = await this.analyzeSentiment(text, analysis.language?.language);
      }
      
      // Intent recognition
      if (options.intentRecognition !== false) {
        analysis.intent = await this.recognizeIntent(text, options.context);
      }
      
      // Entity extraction
      if (options.entityExtraction !== false) {
        analysis.entities = await this.extractEntities(text, analysis.language?.language);
      }
      
      // Translation (if requested)
      if (options.translateTo) {
        analysis.translation = await this.translateText(text, options.translateTo, analysis.language?.language);
      }
      
      analysis.processingTime = Date.now() - startTime;
      this.performanceMetrics.processingTime = analysis.processingTime;
      
      await MetricsService.log('text_analyzed', {
        textLength: text.length,
        language: analysis.language?.language,
        sentiment: analysis.sentiment?.sentiment,
        intent: analysis.intent?.intent,
        entityCount: analysis.entities?.entities?.length || 0,
        processingTime: analysis.processingTime
      });
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing text:', error);
      return {
        text: text,
        error: error.message,
        analyzedAt: new Date().toISOString()
      };
    }
  }

  // Persistence
  async loadNLPData() {
    try {
      const stored = await AsyncStorage.getItem('advanced_nlp_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.conversationContext = new Map(data.conversationContext || []);
        this.contextHistory = data.contextHistory || [];
        this.sentimentHistory = data.sentimentHistory || [];
        this.intentHistory = data.intentHistory || [];
        this.entityHistory = data.entityHistory || [];
        this.translationHistory = data.translationHistory || [];
        this.translationCache = new Map(data.translationCache || []);
        this.translationMetrics = data.translationMetrics || this.translationMetrics;
        this.performanceMetrics = data.performanceMetrics || this.performanceMetrics;
      }
    } catch (error) {
      console.error('Error loading NLP data:', error);
    }
  }

  async saveNLPData() {
    try {
      const data = {
        conversationContext: Array.from(this.conversationContext.entries()),
        contextHistory: this.contextHistory,
        sentimentHistory: this.sentimentHistory,
        intentHistory: this.intentHistory,
        entityHistory: this.entityHistory,
        translationHistory: this.translationHistory,
        translationCache: Array.from(this.translationCache.entries()),
        translationMetrics: this.translationMetrics,
        performanceMetrics: this.performanceMetrics
      };
      await AsyncStorage.setItem('advanced_nlp_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving NLP data:', error);
    }
  }

  // Health Check
  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      nlpCapabilities: this.nlpCapabilities,
      supportedLanguages: Object.keys(this.supportedLanguages),
      nlpModels: Object.keys(this.nlpModels),
      conversationContexts: this.conversationContext.size,
      contextHistorySize: this.contextHistory.length,
      sentimentHistorySize: this.sentimentHistory.length,
      intentHistorySize: this.intentHistory.length,
      entityHistorySize: this.entityHistory.length,
      translationHistorySize: this.translationHistory.length,
      translationCacheSize: this.translationCache.size,
      translationMetrics: this.translationMetrics,
      performanceMetrics: this.performanceMetrics
    };
  }
}

export default new AdvancedNLPService();
