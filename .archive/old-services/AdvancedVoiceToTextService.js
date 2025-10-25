import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import { Platform } from 'react-native';
import MetricsService from './MetricsService';
import EventBus from './EventBus';
import ErrorManager from './ErrorManager';
import AIEnhancementService from './AIEnhancementService';

class AdvancedVoiceToTextService {
  constructor() {
    this.isInitialized = false;
    
    // Voice recognition settings
    this.recognitionSettings = {
      language: 'en-GB', // British English
      confidence: 0.8,
      timeout: 10000,
      maxAlternatives: 3,
      continuous: false,
      interimResults: true,
      punctuation: true,
      capitalization: true,
      profanityFilter: false,
      wordTimeOffsets: true,
      enableAutomaticPunctuation: true,
      enableSpeakerDiarization: false,
      enableWordConfidence: true,
      enableWordTimeOffsets: true,
      model: 'latest_long', // Use latest model for better accuracy
      useEnhancedModel: true,
      enableNoiseSuppression: true,
      enableEchoCancellation: true,
      enableVoiceActivityDetection: true,
      enableAutomaticGainControl: true
    };
    
    // Advanced recognition features
    this.advancedFeatures = {
      contextAwareness: true,
      intentRecognition: true,
      entityExtraction: true,
      sentimentAnalysis: true,
      emotionDetection: true,
      speakerIdentification: true,
      noiseAdaptation: true,
      accentAdaptation: true,
      realTimeCorrection: true,
      predictiveText: true,
      grammarCorrection: true,
      spellCorrection: true,
      punctuationCorrection: true,
      capitalizationCorrection: true,
      contextCorrection: true,
      domainAdaptation: true,
      userAdaptation: true,
      learningMode: true
    };
    
    // Recognition state
    this.isListening = false;
    this.isProcessing = false;
    this.currentSession = null;
    this.recognitionQueue = [];
    this.activeRecognitions = new Map();
    
    // Performance metrics
    this.performanceMetrics = {
      totalRecognitions: 0,
      successfulRecognitions: 0,
      averageConfidence: 0,
      averageLatency: 0,
      errorRate: 0,
      accuracyRate: 0,
      userSatisfaction: 0
    };
    
    // Learning system
    this.learningSystem = {
      userPatterns: new Map(),
      correctionHistory: new Map(),
      contextHistory: [],
      accuracyImprovements: new Map(),
      userPreferences: new Map(),
      domainKnowledge: new Map(),
      accentProfiles: new Map(),
      noiseProfiles: new Map()
    };
    
    // Context management
    this.contextManager = {
      conversationContext: [],
      userContext: {},
      domainContext: {},
      temporalContext: {},
      spatialContext: {},
      emotionalContext: {},
      socialContext: {}
    };
    
    // Error correction system
    this.errorCorrection = {
      grammarRules: new Map(),
      spellingRules: new Map(),
      punctuationRules: new Map(),
      capitalizationRules: new Map(),
      contextRules: new Map(),
      userCorrections: new Map(),
      autoCorrections: new Map()
    };
    
    // Real-time processing
    this.realTimeProcessing = {
      isEnabled: true,
      bufferSize: 4096,
      processingInterval: 100,
      confidenceThreshold: 0.7,
      correctionDelay: 500,
      learningDelay: 1000
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize Voice recognition
      await Voice.isAvailable();
      
      // Set up voice recognition with advanced settings
      await this.setupAdvancedRecognition();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load user preferences and learning data
      await this.loadUserData();
      
      // Initialize context awareness
      await this.initializeContextAwareness();
      
      // Initialize error correction system
      await this.initializeErrorCorrection();
      
      this.isInitialized = true;
      console.log('Advanced Voice-to-Text Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Advanced Voice-to-Text Service:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedVoiceToTextService.initialize' });
    }
  }

  async setupAdvancedRecognition() {
    try {
      // Configure voice recognition with advanced settings
      await Voice.setSpeechRecognizer(
        Platform.OS === 'ios' ? 'SFSpeechRecognizer' : 'GoogleSpeechRecognizer'
      );
      
      // Set recognition language
      await Voice.setLanguage(this.recognitionSettings.language);
      
      // Configure advanced recognition parameters
      if (Platform.OS === 'ios') {
        // iOS-specific advanced settings
        await Voice.setSpeechRecognizer('SFSpeechRecognizer');
      } else {
        // Android-specific advanced settings
        await Voice.setSpeechRecognizer('GoogleSpeechRecognizer');
      }
      
      console.log('Advanced recognition setup completed');
    } catch (error) {
      console.error('Error setting up advanced recognition:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Speech recognition event listeners
    Voice.onSpeechStart = this.handleSpeechStart.bind(this);
    Voice.onSpeechEnd = this.handleSpeechEnd.bind(this);
    Voice.onSpeechResults = this.handleSpeechResults.bind(this);
    Voice.onSpeechError = this.handleSpeechError.bind(this);
    Voice.onSpeechPartialResults = this.handleSpeechPartialResults.bind(this);
    Voice.onSpeechVolumeChanged = this.handleSpeechVolumeChanged.bind(this);
    
    // Custom event listeners
    EventBus.on('context_updated', this.handleContextUpdate.bind(this));
    EventBus.on('user_preference_changed', this.handleUserPreferenceChange.bind(this));
    EventBus.on('domain_context_changed', this.handleDomainContextChange.bind(this));
  }

  async startListening(options = {}) {
    if (this.isListening) {
      console.log('Already listening');
      return;
    }
    
    try {
      // Merge options with current settings
      const listeningOptions = { ...this.recognitionSettings, ...options };
      
      // Create new recognition session
      const sessionId = this.generateSessionId();
      this.currentSession = {
        id: sessionId,
        startTime: Date.now(),
        options: listeningOptions,
        results: [],
        partialResults: [],
        confidence: 0,
        context: { ...this.contextManager },
        status: 'starting'
      };
      
      // Start voice recognition
      await Voice.start(listeningOptions.language);
      
      this.isListening = true;
      this.currentSession.status = 'listening';
      
      // Emit listening started event
      await EventBus.emit('voice_listening_started', {
        sessionId,
        timestamp: Date.now(),
        options: listeningOptions
      });
      
      console.log('Advanced voice recognition started');
      return sessionId;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedVoiceToTextService.startListening' });
      throw error;
    }
  }

  async stopListening() {
    if (!this.isListening) {
      console.log('Not currently listening');
      return;
    }
    
    try {
      await Voice.stop();
      
      if (this.currentSession) {
        this.currentSession.endTime = Date.now();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
        this.currentSession.status = 'completed';
        
        // Process final results
        await this.processFinalResults(this.currentSession);
        
        // Emit listening stopped event
        await EventBus.emit('voice_listening_stopped', {
          sessionId: this.currentSession.id,
          timestamp: Date.now(),
          results: this.currentSession.results
        });
      }
      
      this.isListening = false;
      this.currentSession = null;
      
      console.log('Advanced voice recognition stopped');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedVoiceToTextService.stopListening' });
    }
  }

  async cancelListening() {
    try {
      await Voice.cancel();
      this.isListening = false;
      
      if (this.currentSession) {
        this.currentSession.status = 'cancelled';
        this.currentSession = null;
      }
      
      console.log('Voice recognition cancelled');
    } catch (error) {
      console.error('Error cancelling voice recognition:', error);
    }
  }

  handleSpeechStart(event) {
    console.log('Speech recognition started:', event);
    
    if (this.currentSession) {
      this.currentSession.status = 'speaking';
      this.currentSession.speechStartTime = Date.now();
    }
    
    // Emit speech start event
    EventBus.emit('speech_started', {
      sessionId: this.currentSession?.id,
      timestamp: Date.now()
    });
  }

  handleSpeechEnd(event) {
    console.log('Speech recognition ended:', event);
    
    if (this.currentSession) {
      this.currentSession.status = 'processing';
      this.currentSession.speechEndTime = Date.now();
    }
    
    // Emit speech end event
    EventBus.emit('speech_ended', {
      sessionId: this.currentSession?.id,
      timestamp: Date.now()
    });
  }

  async handleSpeechResults(event) {
    console.log('Speech recognition results:', event);
    
    if (!this.currentSession) return;
    
    try {
      const results = event.value || [];
      const processedResults = await this.processRecognitionResults(results);
      
      this.currentSession.results = processedResults;
      this.currentSession.confidence = this.calculateOverallConfidence(processedResults);
      
      // Apply advanced processing
      const enhancedResults = await this.enhanceRecognitionResults(processedResults);
      
      // Update performance metrics
      this.updatePerformanceMetrics(enhancedResults);
      
      // Emit results event
      await EventBus.emit('speech_results_processed', {
        sessionId: this.currentSession.id,
        results: enhancedResults,
        confidence: this.currentSession.confidence,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error processing speech results:', error);
      await ErrorManager.handleError(error, { context: 'AdvancedVoiceToTextService.handleSpeechResults' });
    }
  }

  async handleSpeechPartialResults(event) {
    console.log('Speech recognition partial results:', event);
    
    if (!this.currentSession) return;
    
    try {
      const partialResults = event.value || [];
      const processedPartialResults = await this.processPartialResults(partialResults);
      
      this.currentSession.partialResults = processedPartialResults;
      
      // Apply real-time corrections
      if (this.realTimeProcessing.isEnabled) {
        const correctedResults = await this.applyRealTimeCorrections(processedPartialResults);
        this.currentSession.partialResults = correctedResults;
      }
      
      // Emit partial results event
      await EventBus.emit('speech_partial_results', {
        sessionId: this.currentSession.id,
        results: this.currentSession.partialResults,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error processing partial results:', error);
    }
  }

  handleSpeechError(event) {
    console.error('Speech recognition error:', event);
    
    if (this.currentSession) {
      this.currentSession.status = 'error';
      this.currentSession.error = event.error;
    }
    
    // Update error metrics
    this.performanceMetrics.errorRate = 
      (this.performanceMetrics.errorRate + 1) / (this.performanceMetrics.totalRecognitions + 1);
    
    // Emit error event
    EventBus.emit('speech_error', {
      sessionId: this.currentSession?.id,
      error: event.error,
      timestamp: Date.now()
    });
  }

  handleSpeechVolumeChanged(event) {
    // Handle volume changes for noise adaptation
    if (this.advancedFeatures.noiseAdaptation) {
      this.adaptToNoiseLevel(event.value);
    }
  }

  async processRecognitionResults(results) {
    const processedResults = [];
    
    for (const result of results) {
      const processedResult = {
        text: result,
        confidence: this.calculateConfidence(result),
        timestamp: Date.now(),
        originalText: result,
        corrections: [],
        enhancements: []
      };
      
      // Apply error corrections
      if (this.advancedFeatures.realTimeCorrection) {
        processedResult.corrections = await this.applyErrorCorrections(result);
        processedResult.text = this.applyCorrections(result, processedResult.corrections);
      }
      
      // Apply context corrections
      if (this.advancedFeatures.contextAwareness) {
        processedResult.enhancements = await this.applyContextEnhancements(processedResult.text);
        processedResult.text = this.applyEnhancements(processedResult.text, processedResult.enhancements);
      }
      
      processedResults.push(processedResult);
    }
    
    return processedResults;
  }

  async processPartialResults(partialResults) {
    const processedPartialResults = [];
    
    for (const result of partialResults) {
      const processedResult = {
        text: result,
        confidence: this.calculateConfidence(result),
        timestamp: Date.now(),
        isPartial: true,
        corrections: [],
        enhancements: []
      };
      
      // Apply quick corrections for partial results
      if (this.realTimeProcessing.isEnabled) {
        processedResult.corrections = await this.applyQuickCorrections(result);
        processedResult.text = this.applyCorrections(result, processedResult.corrections);
      }
      
      processedPartialResults.push(processedResult);
    }
    
    return processedPartialResults;
  }

  async enhanceRecognitionResults(results) {
    const enhancedResults = [];
    
    for (const result of results) {
      const enhancedResult = { ...result };
      
      // Apply intent recognition
      if (this.advancedFeatures.intentRecognition) {
        enhancedResult.intent = await this.recognizeIntent(result.text);
      }
      
      // Apply entity extraction
      if (this.advancedFeatures.entityExtraction) {
        enhancedResult.entities = await this.extractEntities(result.text);
      }
      
      // Apply sentiment analysis
      if (this.advancedFeatures.sentimentAnalysis) {
        enhancedResult.sentiment = await this.analyzeSentiment(result.text);
      }
      
      // Apply emotion detection
      if (this.advancedFeatures.emotionDetection) {
        enhancedResult.emotion = await this.detectEmotion(result.text);
      }
      
      // Apply speaker identification
      if (this.advancedFeatures.speakerIdentification) {
        enhancedResult.speaker = await this.identifySpeaker(result.text);
      }
      
      enhancedResults.push(enhancedResult);
    }
    
    return enhancedResults;
  }

  async applyRealTimeCorrections(results) {
    const correctedResults = [];
    
    for (const result of results) {
      const correctedResult = { ...result };
      
      // Apply grammar corrections
      if (this.advancedFeatures.grammarCorrection) {
        correctedResult.grammarCorrections = await this.applyGrammarCorrections(result.text);
        correctedResult.text = this.applyCorrections(result.text, correctedResult.grammarCorrections);
      }
      
      // Apply spell corrections
      if (this.advancedFeatures.spellCorrection) {
        correctedResult.spellCorrections = await this.applySpellCorrections(result.text);
        correctedResult.text = this.applyCorrections(result.text, correctedResult.spellCorrections);
      }
      
      // Apply punctuation corrections
      if (this.advancedFeatures.punctuationCorrection) {
        correctedResult.punctuationCorrections = await this.applyPunctuationCorrections(result.text);
        correctedResult.text = this.applyCorrections(result.text, correctedResult.punctuationCorrections);
      }
      
      correctedResults.push(correctedResult);
    }
    
    return correctedResults;
  }

  async applyErrorCorrections(text) {
    const corrections = [];
    
    // Apply grammar corrections
    const grammarCorrections = await this.applyGrammarCorrections(text);
    corrections.push(...grammarCorrections);
    
    // Apply spell corrections
    const spellCorrections = await this.applySpellCorrections(text);
    corrections.push(...spellCorrections);
    
    // Apply punctuation corrections
    const punctuationCorrections = await this.applyPunctuationCorrections(text);
    corrections.push(...punctuationCorrections);
    
    // Apply capitalization corrections
    const capitalizationCorrections = await this.applyCapitalizationCorrections(text);
    corrections.push(...capitalizationCorrections);
    
    return corrections;
  }

  async applyContextEnhancements(text) {
    const enhancements = [];
    
    // Apply context corrections
    const contextCorrections = await this.applyContextCorrections(text);
    enhancements.push(...contextCorrections);
    
    // Apply domain adaptations
    const domainAdaptations = await this.applyDomainAdaptations(text);
    enhancements.push(...domainAdaptations);
    
    // Apply user adaptations
    const userAdaptations = await this.applyUserAdaptations(text);
    enhancements.push(...userAdaptations);
    
    return enhancements;
  }

  async applyQuickCorrections(text) {
    const corrections = [];
    
    // Apply quick spell corrections
    const quickSpellCorrections = await this.applyQuickSpellCorrections(text);
    corrections.push(...quickSpellCorrections);
    
    // Apply quick punctuation corrections
    const quickPunctuationCorrections = await this.applyQuickPunctuationCorrections(text);
    corrections.push(...quickPunctuationCorrections);
    
    return corrections;
  }

  // Grammar correction methods
  async applyGrammarCorrections(text) {
    const corrections = [];
    
    // Basic grammar rules
    const grammarRules = this.errorCorrection.grammarRules;
    
    for (const [pattern, replacement] of grammarRules) {
      if (text.match(pattern)) {
        corrections.push({
          type: 'grammar',
          original: pattern,
          corrected: replacement,
          confidence: 0.8
        });
      }
    }
    
    return corrections;
  }

  // Spell correction methods
  async applySpellCorrections(text) {
    const corrections = [];
    
    // Basic spell checking
    const words = text.split(' ');
    
    for (const word of words) {
      const correctedWord = await this.correctSpelling(word);
      if (correctedWord !== word) {
        corrections.push({
          type: 'spelling',
          original: word,
          corrected: correctedWord,
          confidence: 0.9
        });
      }
    }
    
    return corrections;
  }

  // Punctuation correction methods
  async applyPunctuationCorrections(text) {
    const corrections = [];
    
    // Basic punctuation rules
    const punctuationRules = this.errorCorrection.punctuationRules;
    
    for (const [pattern, replacement] of punctuationRules) {
      if (text.match(pattern)) {
        corrections.push({
          type: 'punctuation',
          original: pattern,
          corrected: replacement,
          confidence: 0.7
        });
      }
    }
    
    return corrections;
  }

  // Capitalization correction methods
  async applyCapitalizationCorrections(text) {
    const corrections = [];
    
    // Basic capitalization rules
    const capitalizationRules = this.errorCorrection.capitalizationRules;
    
    for (const [pattern, replacement] of capitalizationRules) {
      if (text.match(pattern)) {
        corrections.push({
          type: 'capitalization',
          original: pattern,
          corrected: replacement,
          confidence: 0.8
        });
      }
    }
    
    return corrections;
  }

  // Context correction methods
  async applyContextCorrections(text) {
    const corrections = [];
    
    // Apply context-aware corrections
    const contextRules = this.errorCorrection.contextRules;
    
    for (const [pattern, replacement] of contextRules) {
      if (text.match(pattern)) {
        corrections.push({
          type: 'context',
          original: pattern,
          corrected: replacement,
          confidence: 0.6
        });
      }
    }
    
    return corrections;
  }

  // Domain adaptation methods
  async applyDomainAdaptations(text) {
    const adaptations = [];
    
    // Apply domain-specific adaptations
    const domainKnowledge = this.learningSystem.domainKnowledge;
    
    for (const [domain, knowledge] of domainKnowledge) {
      const domainAdaptations = await this.applyDomainSpecificAdaptations(text, knowledge);
      adaptations.push(...domainAdaptations);
    }
    
    return adaptations;
  }

  // User adaptation methods
  async applyUserAdaptations(text) {
    const adaptations = [];
    
    // Apply user-specific adaptations
    const userPreferences = this.learningSystem.userPreferences;
    
    for (const [preference, value] of userPreferences) {
      const userAdaptations = await this.applyUserSpecificAdaptations(text, preference, value);
      adaptations.push(...userAdaptations);
    }
    
    return adaptations;
  }

  // Quick correction methods
  async applyQuickSpellCorrections(text) {
    const corrections = [];
    
    // Apply quick spell corrections for common mistakes
    const quickSpellRules = new Map([
      ['teh', 'the'],
      ['adn', 'and'],
      ['taht', 'that'],
      ['wih', 'with'],
      ['fro', 'for'],
      ['ot', 'to'],
      ['yu', 'you'],
      ['ur', 'your'],
      ['r', 'are'],
      ['u', 'you']
    ]);
    
    for (const [incorrect, correct] of quickSpellRules) {
      if (text.includes(incorrect)) {
        corrections.push({
          type: 'quick_spelling',
          original: incorrect,
          corrected: correct,
          confidence: 0.95
        });
      }
    }
    
    return corrections;
  }

  async applyQuickPunctuationCorrections(text) {
    const corrections = [];
    
    // Apply quick punctuation corrections
    const quickPunctuationRules = new Map([
      ['  ', ' '], // Double spaces
      [' ,', ','], // Space before comma
      [' .', '.'], // Space before period
      [' !', '!'], // Space before exclamation
      [' ?', '?'], // Space before question mark
      [',,', ','], // Double commas
      ['..', '.'], // Double periods
      ['!!', '!'], // Double exclamations
      ['??', '?']  // Double questions
    ]);
    
    for (const [incorrect, correct] of quickPunctuationRules) {
      if (text.includes(incorrect)) {
        corrections.push({
          type: 'quick_punctuation',
          original: incorrect,
          corrected: correct,
          confidence: 0.9
        });
      }
    }
    
    return corrections;
  }

  // Helper methods
  applyCorrections(text, corrections) {
    let correctedText = text;
    
    for (const correction of corrections) {
      correctedText = correctedText.replace(correction.original, correction.corrected);
    }
    
    return correctedText;
  }

  applyEnhancements(text, enhancements) {
    let enhancedText = text;
    
    for (const enhancement of enhancements) {
      enhancedText = enhancedText.replace(enhancement.original, enhancement.corrected);
    }
    
    return enhancedText;
  }

  calculateConfidence(text) {
    // Simple confidence calculation based on text length and common patterns
    let confidence = 0.5;
    
    // Increase confidence for longer texts
    if (text.length > 10) confidence += 0.1;
    if (text.length > 20) confidence += 0.1;
    if (text.length > 50) confidence += 0.1;
    
    // Increase confidence for proper punctuation
    if (text.includes('.') || text.includes('!') || text.includes('?')) confidence += 0.1;
    
    // Increase confidence for proper capitalization
    if (text[0] === text[0].toUpperCase()) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  calculateOverallConfidence(results) {
    if (results.length === 0) return 0;
    
    const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
    return totalConfidence / results.length;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updatePerformanceMetrics(results) {
    this.performanceMetrics.totalRecognitions++;
    
    if (results.length > 0) {
      this.performanceMetrics.successfulRecognitions++;
      this.performanceMetrics.averageConfidence = 
        (this.performanceMetrics.averageConfidence + this.calculateOverallConfidence(results)) / 2;
    }
  }

  async loadUserData() {
    try {
      // Load user preferences
      const preferences = await AsyncStorage.getItem('voice_to_text_preferences');
      if (preferences) {
        this.learningSystem.userPreferences = new Map(JSON.parse(preferences));
      }
      
      // Load correction history
      const correctionHistory = await AsyncStorage.getItem('voice_correction_history');
      if (correctionHistory) {
        this.learningSystem.correctionHistory = new Map(JSON.parse(correctionHistory));
      }
      
      // Load context history
      const contextHistory = await AsyncStorage.getItem('voice_context_history');
      if (contextHistory) {
        this.learningSystem.contextHistory = JSON.parse(contextHistory);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async saveUserData() {
    try {
      // Save user preferences
      await AsyncStorage.setItem(
        'voice_to_text_preferences',
        JSON.stringify([...this.learningSystem.userPreferences])
      );
      
      // Save correction history
      await AsyncStorage.setItem(
        'voice_correction_history',
        JSON.stringify([...this.learningSystem.correctionHistory])
      );
      
      // Save context history
      await AsyncStorage.setItem(
        'voice_context_history',
        JSON.stringify(this.learningSystem.contextHistory)
      );
      
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  async initializeContextAwareness() {
    // Initialize context awareness system
    this.contextManager.conversationContext = [];
    this.contextManager.userContext = {};
    this.contextManager.domainContext = {};
    this.contextManager.temporalContext = {};
    this.contextManager.spatialContext = {};
    this.contextManager.emotionalContext = {};
    this.contextManager.socialContext = {};
  }

  async initializeErrorCorrection() {
    // Initialize error correction rules
    this.errorCorrection.grammarRules = new Map([
      [/i am going to (\w+)/gi, 'I am going to $1'],
      [/i will (\w+)/gi, 'I will $1'],
      [/i can (\w+)/gi, 'I can $1'],
      [/i should (\w+)/gi, 'I should $1'],
      [/i would (\w+)/gi, 'I would $1'],
      [/i could (\w+)/gi, 'I could $1'],
      [/i have (\w+)/gi, 'I have $1'],
      [/i had (\w+)/gi, 'I had $1'],
      [/i will have (\w+)/gi, 'I will have $1']
    ]);
    
    this.errorCorrection.punctuationRules = new Map([
      [/(\w+)\s+([.!?])/g, '$1$2'],
      [/(\w+)\s*,\s*(\w+)/g, '$1, $2'],
      [/(\w+)\s*;\s*(\w+)/g, '$1; $2'],
      [/(\w+)\s*:\s*(\w+)/g, '$1: $2']
    ]);
    
    this.errorCorrection.capitalizationRules = new Map([
      [/^(\w)/g, (match) => match.toUpperCase()],
      [/\.\s*(\w)/g, (match) => match.toUpperCase()],
      [/\?\s*(\w)/g, (match) => match.toUpperCase()],
      [/!\s*(\w)/g, (match) => match.toUpperCase()]
    ]);
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      isListening: this.isListening,
      isProcessing: this.isProcessing,
      currentSession: this.currentSession ? {
        id: this.currentSession.id,
        status: this.currentSession.status,
        duration: this.currentSession.duration || 0
      } : null,
      performanceMetrics: this.performanceMetrics,
      learningSystem: {
        userPatterns: this.learningSystem.userPatterns.size,
        correctionHistory: this.learningSystem.correctionHistory.size,
        contextHistory: this.learningSystem.contextHistory.length,
        userPreferences: this.learningSystem.userPreferences.size
      },
      advancedFeatures: this.advancedFeatures,
      recognitionSettings: this.recognitionSettings
    };
  }
}

export default new AdvancedVoiceToTextService();
