import AsyncStorage from '@react-native-async-storage/async-storage';
import MetricsService from './MetricsService';
import EventBus from './EventBus';
import ErrorManager from './ErrorManager';
import AIEnhancementService from './AIEnhancementService';

class IntelligentVoiceCommandProcessor {
  constructor() {
    this.isInitialized = false;
    
    // Intent recognition system
    this.intentRecognition = {
      intents: new Map(),
      patterns: new Map(),
      confidence: new Map(),
      context: new Map(),
      entities: new Map(),
      slots: new Map()
    };
    
    // Command processing
    this.commandProcessing = {
      commands: new Map(),
      aliases: new Map(),
      contexts: new Map(),
      parameters: new Map(),
      validations: new Map(),
      executions: new Map()
    };
    
    // Natural language understanding
    this.nlu = {
      entities: new Map(),
      relationships: new Map(),
      sentiment: new Map(),
      emotion: new Map(),
      context: new Map(),
      ambiguity: new Map(),
      resolution: new Map()
    };
    
    // Learning system
    this.learningSystem = {
      userPatterns: new Map(),
      commandHistory: new Map(),
      successRates: new Map(),
      userPreferences: new Map(),
      contextLearning: new Map(),
      intentLearning: new Map(),
      entityLearning: new Map()
    };
    
    // Performance metrics
    this.performanceMetrics = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      averageConfidence: 0,
      averageLatency: 0,
      userSatisfaction: 0,
      intentAccuracy: 0,
      entityAccuracy: 0,
      contextAccuracy: 0
    };
    
    // Initialize default intents and commands
    this.initializeDefaultIntents();
    this.initializeDefaultCommands();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load user data and learning patterns
      await this.loadUserData();
      
      // Initialize intent recognition
      await this.initializeIntentRecognition();
      
      // Initialize command processing
      await this.initializeCommandProcessing();
      
      // Initialize natural language understanding
      await this.initializeNLU();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('Intelligent Voice Command Processor initialized successfully');
    } catch (error) {
      console.error('Error initializing Intelligent Voice Command Processor:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentVoiceCommandProcessor.initialize' });
    }
  }

  initializeDefaultIntents() {
    // Navigation intents
    this.intentRecognition.intents.set('navigate', {
      name: 'navigate',
      description: 'Navigate to a specific screen or section',
      patterns: [
        'go to {screen}',
        'navigate to {screen}',
        'open {screen}',
        'show {screen}',
        'take me to {screen}',
        'switch to {screen}',
        'go to the {screen}',
        'open the {screen}',
        'show me the {screen}'
      ],
      entities: ['screen'],
      confidence: 0.9,
      context: ['navigation', 'ui']
    });
    
    // Search intents
    this.intentRecognition.intents.set('search', {
      name: 'search',
      description: 'Search for information or content',
      patterns: [
        'search for {query}',
        'find {query}',
        'look for {query}',
        'search {query}',
        'find me {query}',
        'look up {query}',
        'google {query}',
        'search the web for {query}'
      ],
      entities: ['query'],
      confidence: 0.9,
      context: ['search', 'information']
    });
    
    // Communication intents
    this.intentRecognition.intents.set('send_message', {
      name: 'send_message',
      description: 'Send a message or communication',
      patterns: [
        'send message to {recipient}',
        'text {recipient}',
        'message {recipient}',
        'send {message} to {recipient}',
        'text {recipient} {message}',
        'message {recipient} {message}'
      ],
      entities: ['recipient', 'message'],
      confidence: 0.8,
      context: ['communication', 'messaging']
    });
    
    // Media intents
    this.intentRecognition.intents.set('play_media', {
      name: 'play_media',
      description: 'Play media content',
      patterns: [
        'play {media}',
        'start {media}',
        'begin {media}',
        'play the {media}',
        'start playing {media}',
        'play music',
        'play video',
        'play audio'
      ],
      entities: ['media'],
      confidence: 0.9,
      context: ['media', 'entertainment']
    });
    
    // Control intents
    this.intentRecognition.intents.set('control', {
      name: 'control',
      description: 'Control device or app functions',
      patterns: [
        'turn on {device}',
        'turn off {device}',
        'enable {feature}',
        'disable {feature}',
        'activate {feature}',
        'deactivate {feature}',
        'start {process}',
        'stop {process}'
      ],
      entities: ['device', 'feature', 'process'],
      confidence: 0.8,
      context: ['control', 'device']
    });
    
    // Information intents
    this.intentRecognition.intents.set('get_information', {
      name: 'get_information',
      description: 'Get information or ask questions',
      patterns: [
        'what is {topic}',
        'tell me about {topic}',
        'explain {topic}',
        'how does {topic} work',
        'what are {topic}',
        'who is {person}',
        'when is {event}',
        'where is {location}',
        'why is {topic}',
        'how to {action}'
      ],
      entities: ['topic', 'person', 'event', 'location', 'action'],
      confidence: 0.9,
      context: ['information', 'question']
    });
    
    // Task intents
    this.intentRecognition.intents.set('create_task', {
      name: 'create_task',
      description: 'Create or manage tasks',
      patterns: [
        'create task {task}',
        'add task {task}',
        'new task {task}',
        'remind me to {task}',
        'schedule {task}',
        'plan {task}',
        'organize {task}'
      ],
      entities: ['task'],
      confidence: 0.8,
      context: ['productivity', 'task_management']
    });
    
    // Settings intents
    this.intentRecognition.intents.set('change_settings', {
      name: 'change_settings',
      description: 'Change app or device settings',
      patterns: [
        'change {setting} to {value}',
        'set {setting} to {value}',
        'update {setting} to {value}',
        'modify {setting} to {value}',
        'adjust {setting} to {value}',
        'configure {setting} to {value}'
      ],
      entities: ['setting', 'value'],
      confidence: 0.8,
      context: ['settings', 'configuration']
    });
    
    // Help intents
    this.intentRecognition.intents.set('help', {
      name: 'help',
      description: 'Get help or assistance',
      patterns: [
        'help',
        'help me',
        'what can you do',
        'what are your commands',
        'show me commands',
        'list commands',
        'how do I {action}',
        'can you help me with {topic}'
      ],
      entities: ['action', 'topic'],
      confidence: 0.9,
      context: ['help', 'assistance']
    });
    
    // Emergency intents
    this.intentRecognition.intents.set('emergency', {
      name: 'emergency',
      description: 'Emergency or urgent situations',
      patterns: [
        'emergency',
        'help me',
        'call emergency',
        'call 911',
        'urgent',
        'critical',
        'danger',
        'sos'
      ],
      entities: [],
      confidence: 0.95,
      context: ['emergency', 'urgent']
    });
  }

  initializeDefaultCommands() {
    // Navigation commands
    this.commandProcessing.commands.set('navigate', {
      name: 'navigate',
      description: 'Navigate to a specific screen',
      parameters: ['screen'],
      validation: (params) => this.validateScreen(params.screen),
      execution: async (params) => await this.executeNavigation(params),
      aliases: ['go', 'open', 'show', 'switch']
    });
    
    // Search commands
    this.commandProcessing.commands.set('search', {
      name: 'search',
      description: 'Search for information',
      parameters: ['query'],
      validation: (params) => this.validateQuery(params.query),
      execution: async (params) => await this.executeSearch(params),
      aliases: ['find', 'look', 'google']
    });
    
    // Media commands
    this.commandProcessing.commands.set('play_media', {
      name: 'play_media',
      description: 'Play media content',
      parameters: ['media'],
      validation: (params) => this.validateMedia(params.media),
      execution: async (params) => await this.executeMediaPlayback(params),
      aliases: ['play', 'start', 'begin']
    });
    
    // Control commands
    this.commandProcessing.commands.set('control', {
      name: 'control',
      description: 'Control device functions',
      parameters: ['device', 'action'],
      validation: (params) => this.validateControl(params),
      execution: async (params) => await this.executeControl(params),
      aliases: ['turn', 'enable', 'disable', 'activate']
    });
    
    // Information commands
    this.commandProcessing.commands.set('get_information', {
      name: 'get_information',
      description: 'Get information or ask questions',
      parameters: ['topic'],
      validation: (params) => this.validateTopic(params.topic),
      execution: async (params) => await this.executeInformationRequest(params),
      aliases: ['what', 'tell', 'explain', 'how']
    });
    
    // Task commands
    this.commandProcessing.commands.set('create_task', {
      name: 'create_task',
      description: 'Create or manage tasks',
      parameters: ['task'],
      validation: (params) => this.validateTask(params.task),
      execution: async (params) => await this.executeTaskCreation(params),
      aliases: ['create', 'add', 'new', 'remind', 'schedule']
    });
    
    // Settings commands
    this.commandProcessing.commands.set('change_settings', {
      name: 'change_settings',
      description: 'Change app settings',
      parameters: ['setting', 'value'],
      validation: (params) => this.validateSettings(params),
      execution: async (params) => await this.executeSettingsChange(params),
      aliases: ['change', 'set', 'update', 'modify', 'adjust']
    });
    
    // Help commands
    this.commandProcessing.commands.set('help', {
      name: 'help',
      description: 'Get help or assistance',
      parameters: ['topic'],
      validation: (params) => true,
      execution: async (params) => await this.executeHelp(params),
      aliases: ['help', 'assist', 'guide']
    });
    
    // Emergency commands
    this.commandProcessing.commands.set('emergency', {
      name: 'emergency',
      description: 'Handle emergency situations',
      parameters: [],
      validation: (params) => true,
      execution: async (params) => await this.executeEmergency(params),
      aliases: ['emergency', 'urgent', 'critical', 'sos']
    });
  }

  async processVoiceCommand(transcript, context = {}) {
    const startTime = Date.now();
    
    try {
      // Update performance metrics
      this.performanceMetrics.totalCommands++;
      
      // Step 1: Preprocess the transcript
      const preprocessedTranscript = await this.preprocessTranscript(transcript);
      
      // Step 2: Recognize intent
      const intentResult = await this.recognizeIntent(preprocessedTranscript, context);
      
      // Step 3: Extract entities
      const entities = await this.extractEntities(preprocessedTranscript, intentResult);
      
      // Step 4: Resolve ambiguity
      const resolvedIntent = await this.resolveAmbiguity(intentResult, entities, context);
      
      // Step 5: Validate command
      const validationResult = await this.validateCommand(resolvedIntent, entities);
      
      // Step 6: Execute command
      const executionResult = await this.executeCommand(resolvedIntent, entities, context);
      
      // Step 7: Learn from the interaction
      await this.learnFromInteraction(transcript, intentResult, entities, executionResult);
      
      // Update performance metrics
      const latency = Date.now() - startTime;
      this.updatePerformanceMetrics(executionResult, latency);
      
      return {
        success: executionResult.success,
        intent: resolvedIntent,
        entities: entities,
        result: executionResult.result,
        confidence: intentResult.confidence,
        latency: latency,
        transcript: transcript,
        preprocessed: preprocessedTranscript
      };
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      await ErrorManager.handleError(error, { context: 'IntelligentVoiceCommandProcessor.processVoiceCommand' });
      
      this.performanceMetrics.failedCommands++;
      
      return {
        success: false,
        error: error.message,
        transcript: transcript,
        latency: Date.now() - startTime
      };
    }
  }

  async preprocessTranscript(transcript) {
    // Clean and normalize the transcript
    let preprocessed = transcript.toLowerCase().trim();
    
    // Remove extra whitespace
    preprocessed = preprocessed.replace(/\s+/g, ' ');
    
    // Remove common filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally'];
    for (const filler of fillerWords) {
      preprocessed = preprocessed.replace(new RegExp(`\\b${filler}\\b`, 'g'), '');
    }
    
    // Normalize contractions
    const contractions = {
      "don't": "do not",
      "can't": "cannot",
      "won't": "will not",
      "isn't": "is not",
      "aren't": "are not",
      "wasn't": "was not",
      "weren't": "were not",
      "hasn't": "has not",
      "haven't": "have not",
      "hadn't": "had not",
      "doesn't": "does not",
      "didn't": "did not",
      "wouldn't": "would not",
      "couldn't": "could not",
      "shouldn't": "should not",
      "i'm": "i am",
      "you're": "you are",
      "he's": "he is",
      "she's": "she is",
      "it's": "it is",
      "we're": "we are",
      "they're": "they are",
      "i'll": "i will",
      "you'll": "you will",
      "he'll": "he will",
      "she'll": "she will",
      "it'll": "it will",
      "we'll": "we will",
      "they'll": "they will",
      "i've": "i have",
      "you've": "you have",
      "he's": "he has",
      "she's": "she has",
      "it's": "it has",
      "we've": "we have",
      "they've": "they have",
      "i'd": "i would",
      "you'd": "you would",
      "he'd": "he would",
      "she'd": "she would",
      "it'd": "it would",
      "we'd": "we would",
      "they'd": "they would"
    };
    
    for (const [contraction, expansion] of Object.entries(contractions)) {
      preprocessed = preprocessed.replace(new RegExp(`\\b${contraction}\\b`, 'g'), expansion);
    }
    
    // Remove extra whitespace again
    preprocessed = preprocessed.replace(/\s+/g, ' ').trim();
    
    return preprocessed;
  }

  async recognizeIntent(transcript, context = {}) {
    const intentScores = new Map();
    
    // Score each intent based on pattern matching
    for (const [intentName, intent] of this.intentRecognition.intents) {
      let score = 0;
      let matchedPattern = null;
      let extractedEntities = {};
      
      // Check patterns
      for (const pattern of intent.patterns) {
        const patternScore = this.calculatePatternScore(transcript, pattern);
        if (patternScore > score) {
          score = patternScore;
          matchedPattern = pattern;
          extractedEntities = this.extractEntitiesFromPattern(transcript, pattern);
        }
      }
      
      // Apply context boost
      if (context && this.isContextRelevant(intent.context, context)) {
        score *= 1.2;
      }
      
      // Apply confidence boost
      score *= intent.confidence;
      
      intentScores.set(intentName, {
        score: score,
        pattern: matchedPattern,
        entities: extractedEntities,
        confidence: intent.confidence
      });
    }
    
    // Find the best intent
    let bestIntent = null;
    let bestScore = 0;
    
    for (const [intentName, result] of intentScores) {
      if (result.score > bestScore) {
        bestScore = result.score;
        bestIntent = {
          name: intentName,
          score: result.score,
          pattern: result.pattern,
          entities: result.entities,
          confidence: result.confidence
        };
      }
    }
    
    return bestIntent || {
      name: 'unknown',
      score: 0,
      pattern: null,
      entities: {},
      confidence: 0
    };
  }

  calculatePatternScore(transcript, pattern) {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\{(\w+)\}/g, '([^\\s]+)')
      .replace(/\s+/g, '\\s+');
    
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    const match = transcript.match(regex);
    
    if (match) {
      // Calculate score based on match quality
      let score = 1.0;
      
      // Boost score for exact matches
      if (transcript === pattern.replace(/\{(\w+)\}/g, '').trim()) {
        score = 1.5;
      }
      
      // Boost score for longer patterns
      const patternLength = pattern.split(' ').length;
      score += patternLength * 0.1;
      
      return score;
    }
    
    return 0;
  }

  extractEntitiesFromPattern(transcript, pattern) {
    const entities = {};
    const regexPattern = pattern.replace(/\{(\w+)\}/g, '([^\\s]+)');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    const match = transcript.match(regex);
    
    if (match) {
      const entityNames = pattern.match(/\{(\w+)\}/g);
      if (entityNames) {
        for (let i = 0; i < entityNames.length; i++) {
          const entityName = entityNames[i].replace(/[{}]/g, '');
          entities[entityName] = match[i + 1];
        }
      }
    }
    
    return entities;
  }

  async extractEntities(transcript, intentResult) {
    const entities = { ...intentResult.entities };
    
    // Extract additional entities using NLP
    const nlpEntities = await this.extractNLPEntities(transcript);
    
    // Merge entities
    for (const [key, value] of Object.entries(nlpEntities)) {
      if (!entities[key]) {
        entities[key] = value;
      }
    }
    
    return entities;
  }

  async extractNLPEntities(transcript) {
    const entities = {};
    
    // Extract common entity types
    entities.person = this.extractPersonEntities(transcript);
    entities.location = this.extractLocationEntities(transcript);
    entities.time = this.extractTimeEntities(transcript);
    entities.date = this.extractDateEntities(transcript);
    entities.number = this.extractNumberEntities(transcript);
    entities.currency = this.extractCurrencyEntities(transcript);
    entities.organization = this.extractOrganizationEntities(transcript);
    
    return entities;
  }

  extractPersonEntities(transcript) {
    // Simple person name extraction
    const personPatterns = [
      /(?:call|text|message|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /(?:to|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];
    
    for (const pattern of personPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractLocationEntities(transcript) {
    // Simple location extraction
    const locationPatterns = [
      /(?:in|at|to|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /(?:go to|navigate to|travel to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];
    
    for (const pattern of locationPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractTimeEntities(transcript) {
    // Simple time extraction
    const timePatterns = [
      /(?:at|around|about)\s+(\d{1,2}:\d{2})/g,
      /(?:at|around|about)\s+(\d{1,2})\s*(?:am|pm)/g,
      /(?:in|after)\s+(\d+)\s*(?:minutes?|hours?|days?)/g
    ];
    
    for (const pattern of timePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractDateEntities(transcript) {
    // Simple date extraction
    const datePatterns = [
      /(?:on|at)\s+(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(?:on|at)\s+(\d{1,2}\/\d{1,2})/g,
      /(?:on|at)\s+(today|tomorrow|yesterday)/g
    ];
    
    for (const pattern of datePatterns) {
      const match = transcript.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractNumberEntities(transcript) {
    // Simple number extraction
    const numberPatterns = [
      /(\d+)/g,
      /(?:number|count|amount)\s+(\d+)/g
    ];
    
    for (const pattern of numberPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractCurrencyEntities(transcript) {
    // Simple currency extraction
    const currencyPatterns = [
      /\$(\d+(?:\.\d{2})?)/g,
      /(\d+(?:\.\d{2})?)\s*dollars?/g
    ];
    
    for (const pattern of currencyPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractOrganizationEntities(transcript) {
    // Simple organization extraction
    const orgPatterns = [
      /(?:at|for|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];
    
    for (const pattern of orgPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  async resolveAmbiguity(intentResult, entities, context) {
    // If confidence is high enough, return as is
    if (intentResult.confidence > 0.8) {
      return intentResult;
    }
    
    // Use context to resolve ambiguity
    if (context && context.recentIntents) {
      const recentIntent = context.recentIntents[context.recentIntents.length - 1];
      if (recentIntent && this.isIntentRelated(intentResult.name, recentIntent.name)) {
        intentResult.confidence += 0.2;
      }
    }
    
    // Use user preferences to resolve ambiguity
    const userPreference = this.learningSystem.userPreferences.get(intentResult.name);
    if (userPreference && userPreference.confidence > 0.7) {
      intentResult.confidence += 0.1;
    }
    
    return intentResult;
  }

  async validateCommand(intentResult, entities) {
    const command = this.commandProcessing.commands.get(intentResult.name);
    if (!command) {
      return { valid: false, error: 'Command not found' };
    }
    
    // Validate parameters
    if (command.validation) {
      const validationResult = command.validation(entities);
      if (!validationResult) {
        return { valid: false, error: 'Invalid parameters' };
      }
    }
    
    return { valid: true };
  }

  async executeCommand(intentResult, entities, context) {
    const command = this.commandProcessing.commands.get(intentResult.name);
    if (!command) {
      return { success: false, error: 'Command not found' };
    }
    
    try {
      const result = await command.execution(entities, context);
      return { success: true, result: result };
    } catch (error) {
      console.error('Error executing command:', error);
      return { success: false, error: error.message };
    }
  }

  async learnFromInteraction(transcript, intentResult, entities, executionResult) {
    // Learn from successful interactions
    if (executionResult.success) {
      // Update success rates
      const currentRate = this.learningSystem.successRates.get(intentResult.name) || 0;
      this.learningSystem.successRates.set(intentResult.name, currentRate + 0.1);
      
      // Update user patterns
      const pattern = `${transcript} -> ${intentResult.name}`;
      const currentCount = this.learningSystem.userPatterns.get(pattern) || 0;
      this.learningSystem.userPatterns.set(pattern, currentCount + 1);
      
      // Update context learning
      if (entities.context) {
        const contextPattern = `${entities.context} -> ${intentResult.name}`;
        const currentContextCount = this.learningSystem.contextLearning.get(contextPattern) || 0;
        this.learningSystem.contextLearning.set(contextPattern, currentContextCount + 1);
      }
    }
    
    // Learn from failed interactions
    else {
      // Update failure patterns
      const failurePattern = `${transcript} -> FAILED`;
      const currentFailureCount = this.learningSystem.userPatterns.get(failurePattern) || 0;
      this.learningSystem.userPatterns.set(failurePattern, currentFailureCount + 1);
    }
    
    // Save learning data
    await this.saveUserData();
  }

  updatePerformanceMetrics(executionResult, latency) {
    if (executionResult.success) {
      this.performanceMetrics.successfulCommands++;
    } else {
      this.performanceMetrics.failedCommands++;
    }
    
    this.performanceMetrics.averageLatency = 
      (this.performanceMetrics.averageLatency + latency) / 2;
  }

  // Validation methods
  validateScreen(screen) {
    const validScreens = ['home', 'settings', 'profile', 'chat', 'search', 'media', 'tasks'];
    return validScreens.includes(screen.toLowerCase());
  }

  validateQuery(query) {
    return query && query.length > 0;
  }

  validateMedia(media) {
    return media && media.length > 0;
  }

  validateControl(params) {
    return params.device && params.action;
  }

  validateTopic(topic) {
    return topic && topic.length > 0;
  }

  validateTask(task) {
    return task && task.length > 0;
  }

  validateSettings(params) {
    return params.setting && params.value;
  }

  // Execution methods
  async executeNavigation(params) {
    // Execute navigation logic
    return { screen: params.screen, success: true };
  }

  async executeSearch(params) {
    // Execute search logic
    return { query: params.query, success: true };
  }

  async executeMediaPlayback(params) {
    // Execute media playback logic
    return { media: params.media, success: true };
  }

  async executeControl(params) {
    // Execute control logic
    return { device: params.device, action: params.action, success: true };
  }

  async executeInformationRequest(params) {
    // Execute information request logic
    return { topic: params.topic, success: true };
  }

  async executeTaskCreation(params) {
    // Execute task creation logic
    return { task: params.task, success: true };
  }

  async executeSettingsChange(params) {
    // Execute settings change logic
    return { setting: params.setting, value: params.value, success: true };
  }

  async executeHelp(params) {
    // Execute help logic
    return { topic: params.topic, success: true };
  }

  async executeEmergency(params) {
    // Execute emergency logic
    return { emergency: true, success: true };
  }

  // Helper methods
  isContextRelevant(intentContexts, context) {
    if (!intentContexts || !context) return false;
    
    for (const intentContext of intentContexts) {
      if (context[intentContext]) {
        return true;
      }
    }
    
    return false;
  }

  isIntentRelated(intent1, intent2) {
    // Define related intents
    const relatedIntents = {
      'navigate': ['search', 'get_information'],
      'search': ['navigate', 'get_information'],
      'get_information': ['search', 'navigate'],
      'play_media': ['control'],
      'control': ['play_media']
    };
    
    return relatedIntents[intent1]?.includes(intent2) || false;
  }

  setupEventListeners() {
    EventBus.on('context_updated', this.handleContextUpdate.bind(this));
    EventBus.on('user_preference_changed', this.handleUserPreferenceChange.bind(this));
  }

  handleContextUpdate(context) {
    // Update context for better intent recognition
    this.contextManager = { ...this.contextManager, ...context };
  }

  handleUserPreferenceChange(preferences) {
    // Update user preferences for better command processing
    this.learningSystem.userPreferences = new Map([
      ...this.learningSystem.userPreferences,
      ...preferences
    ]);
  }

  async loadUserData() {
    try {
      // Load user patterns
      const patterns = await AsyncStorage.getItem('voice_command_patterns');
      if (patterns) {
        this.learningSystem.userPatterns = new Map(JSON.parse(patterns));
      }
      
      // Load success rates
      const successRates = await AsyncStorage.getItem('voice_command_success_rates');
      if (successRates) {
        this.learningSystem.successRates = new Map(JSON.parse(successRates));
      }
      
      // Load user preferences
      const preferences = await AsyncStorage.getItem('voice_command_preferences');
      if (preferences) {
        this.learningSystem.userPreferences = new Map(JSON.parse(preferences));
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async saveUserData() {
    try {
      // Save user patterns
      await AsyncStorage.setItem(
        'voice_command_patterns',
        JSON.stringify([...this.learningSystem.userPatterns])
      );
      
      // Save success rates
      await AsyncStorage.setItem(
        'voice_command_success_rates',
        JSON.stringify([...this.learningSystem.successRates])
      );
      
      // Save user preferences
      await AsyncStorage.setItem(
        'voice_command_preferences',
        JSON.stringify([...this.learningSystem.userPreferences])
      );
      
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  async initializeIntentRecognition() {
    // Initialize intent recognition system
    console.log('Intent recognition system initialized');
  }

  async initializeCommandProcessing() {
    // Initialize command processing system
    console.log('Command processing system initialized');
  }

  async initializeNLU() {
    // Initialize natural language understanding
    console.log('NLU system initialized');
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      performanceMetrics: this.performanceMetrics,
      learningSystem: {
        userPatterns: this.learningSystem.userPatterns.size,
        successRates: this.learningSystem.successRates.size,
        userPreferences: this.learningSystem.userPreferences.size,
        contextLearning: this.learningSystem.contextLearning.size
      },
      intentRecognition: {
        intents: this.intentRecognition.intents.size,
        patterns: this.intentRecognition.patterns.size
      },
      commandProcessing: {
        commands: this.commandProcessing.commands.size,
        aliases: this.commandProcessing.aliases.size
      }
    };
  }
}

export default new IntelligentVoiceCommandProcessor();
