/**
 * Enhanced Context Service
 * Advanced context-aware conversations with entity resolution, 
 * semantic understanding, and intelligent reference tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import ContextMemoryService from './ContextMemoryService';

interface EnhancedContext {
  // Current conversation state
  currentSubject: string | null; // What we're talking about now
  subjectHistory: string[]; // Previous subjects
  pronounReferences: Map<string, string>; // "it" -> "Python", "he" -> "Elon Musk"
  
  // Thread tracking
  conversationThreads: Thread[];
  activeThread: string | null;
  
  // Semantic understanding
  lastQuestion: string | null;
  questionType: 'what' | 'how' | 'why' | 'when' | 'where' | 'who' | null;
  expectingFollowUp: boolean;
  
  // Entity tracking (enhanced)
  entityContext: Map<string, EntityInfo>;
  
  // Topic depth
  topicDepth: Map<string, number>; // How deep into a topic
  
  // Conversation patterns
  userPatterns: {
    asksFollowUps: boolean;
    detailLevel: 'brief' | 'medium' | 'deep';
    jumpsTopics: boolean;
    likesExamples: boolean;
  };
}

interface Thread {
  id: string;
  startTime: number;
  topic: string;
  messages: number;
  resolved: boolean;
}

interface EntityInfo {
  name: string;
  type: 'person' | 'place' | 'thing' | 'concept';
  lastMentioned: number;
  context: string; // Brief description
  aliases: string[]; // "Python" = ["it", "the language", "Python"]
}

class EnhancedContextService {
  private static instance: EnhancedContextService;
  private contexts: Map<string, EnhancedContext> = new Map();

  private constructor() {
    this.loadContexts();
  }

  static getInstance(): EnhancedContextService {
    if (!EnhancedContextService.instance) {
      EnhancedContextService.instance = new EnhancedContextService();
    }
    return EnhancedContextService.instance;
  }

  /**
   * Process user input with enhanced context awareness
   */
  async processInput(userId: string, input: string): Promise<{
    resolvedInput: string; // Input with pronouns resolved
    context: string; // Context for AI
    isFollowUp: boolean;
    relatedSubject: string | null;
  }> {
    await this.initializeContext(userId);
    const context = this.contexts.get(userId)!;

    // Resolve pronouns and references
    const resolvedInput = this.resolveReferences(input, context);

    // Detect question type
    const questionType = this.detectQuestionType(input);
    context.questionType = questionType;
    context.lastQuestion = input;

    // Check if this is a follow-up
    const isFollowUp = this.isFollowUp(input, context);

    // Extract new subject or use current
    const newSubject = this.extractSubject(input);
    if (newSubject) {
      if (context.currentSubject) {
        context.subjectHistory.push(context.currentSubject);
      }
      context.currentSubject = newSubject;
    }

    // Build rich context string
    const contextString = this.buildRichContext(context, input);

    // Update patterns
    this.updateUserPatterns(context, input);

    await this.saveContexts();

    return {
      resolvedInput,
      context: contextString,
      isFollowUp,
      relatedSubject: context.currentSubject,
    };
  }

  /**
   * Resolve pronouns and references to actual entities
   */
  private resolveReferences(input: string, context: EnhancedContext): string {
    let resolved = input;

    // Pronoun patterns to resolve
    const patterns = [
      { pattern: /\b(it|its|it's)\b/gi, type: 'thing' },
      { pattern: /\b(that|this|these|those)\b/gi, type: 'thing' },
      { pattern: /\b(he|his|him)\b/gi, type: 'person' },
      { pattern: /\b(she|her|hers)\b/gi, type: 'person' },
      { pattern: /\b(they|them|their)\b/gi, type: 'plural' },
    ];

    patterns.forEach(({ pattern, type }) => {
      if (pattern.test(input)) {
        // Find most recent relevant entity
        const relevantEntity = this.getMostRecentEntity(context, type);
        
        if (relevantEntity) {
          // Create clarified version (don't replace, just track)
          const clarification = `[Referring to: ${relevantEntity}]`;
          resolved = `${input} ${clarification}`;
        }
      }
    });

    return resolved;
  }

  /**
   * Get most recent relevant entity
   */
  private getMostRecentEntity(
    context: EnhancedContext, 
    type: 'thing' | 'person' | 'plural'
  ): string | null {
    // Sort entities by recency
    const sorted = Array.from(context.entityContext.entries())
      .sort(([, a], [, b]) => b.lastMentioned - a.lastMentioned);

    // Filter by type
    const filtered = sorted.filter(([, entity]) => {
      if (type === 'person') return entity.type === 'person';
      if (type === 'thing') return ['thing', 'concept', 'place'].includes(entity.type);
      return true; // plural can be anything
    });

    return filtered.length > 0 ? filtered[0][1].name : null;
  }

  /**
   * Detect question type for better context
   */
  private detectQuestionType(input: string): any {
    const lower = input.toLowerCase();
    
    if (lower.match(/^what|what's|what is|what are/)) return 'what';
    if (lower.match(/^how|how do|how can|how to/)) return 'how';
    if (lower.match(/^why|why is|why do/)) return 'why';
    if (lower.match(/^when|when is|when do/)) return 'when';
    if (lower.match(/^where|where is|where can/)) return 'where';
    if (lower.match(/^who|who is|who are/)) return 'who';
    
    return null;
  }

  /**
   * Check if input is a follow-up question
   */
  private isFollowUp(input: string, context: EnhancedContext): boolean {
    const lower = input.toLowerCase();

    // Explicit follow-up indicators
    const followUpPhrases = [
      'what about', 'how about', 'and', 'also',
      'what else', 'tell me more', 'explain',
      'show me', 'give me', 'can you',
      'what if', 'but', 'however'
    ];

    if (followUpPhrases.some(phrase => lower.startsWith(phrase))) {
      return true;
    }

    // Contains pronouns (it, that, this, etc.)
    if (lower.match(/\b(it|that|this|those|these)\b/)) {
      return true;
    }

    // Short questions (likely follow-ups)
    if (input.split(' ').length < 4 && input.includes('?')) {
      return true;
    }

    // Similar topic to last message
    if (context.currentSubject) {
      const hasSimilarTopic = lower.includes(context.currentSubject.toLowerCase());
      return hasSimilarTopic;
    }

    return false;
  }

  /**
   * Extract subject from input
   */
  private extractSubject(input: string): string | null {
    const lower = input.toLowerCase();

    // Common subject patterns
    const patterns = [
      /about\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+/,
      /(Python|JavaScript|React|TypeScript|Java|C\+\+|Ruby|Go|Swift|Kotlin)/i,
      /(machine learning|artificial intelligence|web development|data science)/i,
      /(climate|weather|health|fitness|nutrition)/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Extract from question patterns
    if (lower.startsWith('what is') || lower.startsWith('what are')) {
      const words = input.split(' ').slice(2, 5);
      const subject = words.join(' ').replace(/[?.,!]/g, '');
      if (subject.length > 2) return subject;
    }

    return null;
  }

  /**
   * Build rich context string for AI
   */
  private buildRichContext(context: EnhancedContext, newInput: string): string {
    let contextStr = '';

    // Current subject
    if (context.currentSubject) {
      contextStr += `Current topic: ${context.currentSubject}\n`;
      
      // Topic depth
      const depth = context.topicDepth.get(context.currentSubject) || 0;
      if (depth > 2) {
        contextStr += `(Deep discussion - ${depth} messages about ${context.currentSubject})\n`;
      }
    }

    // Recent subjects
    if (context.subjectHistory.length > 0) {
      contextStr += `Previous topics: ${context.subjectHistory.slice(-3).join(', ')}\n`;
    }

    // Active entities
    if (context.entityContext.size > 0) {
      const recentEntities = Array.from(context.entityContext.entries())
        .sort(([, a], [, b]) => b.lastMentioned - a.lastMentioned)
        .slice(0, 5);
      
      contextStr += 'Active context:\n';
      recentEntities.forEach(([name, info]) => {
        contextStr += `• ${name} (${info.type}): ${info.context}\n`;
      });
    }

    // Pronoun resolution
    const pronouns = this.detectPronouns(newInput);
    if (pronouns.length > 0 && context.currentSubject) {
      contextStr += `\nPronouns "${pronouns.join(', ')}" likely refer to: ${context.currentSubject}\n`;
    }

    // Question context
    if (context.questionType) {
      contextStr += `\nQuestion type: ${context.questionType}\n`;
    }

    // User patterns
    if (context.userPatterns.likesExamples) {
      contextStr += 'User appreciates examples - include them!\n';
    }

    // Previous question context
    if (context.lastQuestion && this.isFollowUp(newInput, context)) {
      contextStr += `\nThis is a follow-up to: "${context.lastQuestion}"\n`;
    }

    return contextStr;
  }

  /**
   * Detect pronouns in text
   */
  private detectPronouns(text: string): string[] {
    const pronouns: string[] = [];
    const lower = text.toLowerCase();

    const pronounList = ['it', 'its', 'that', 'this', 'he', 'she', 'they', 'them'];
    
    pronounList.forEach(pronoun => {
      if (new RegExp(`\\b${pronoun}\\b`, 'i').test(lower)) {
        pronouns.push(pronoun);
      }
    });

    return pronouns;
  }

  /**
   * Update entity context from response
   */
  async updateFromResponse(
    userId: string,
    userInput: string,
    botResponse: string
  ): Promise<void> {
    const context = this.contexts.get(userId);
    if (!context) return;

    // Extract entities from both
    const entities = this.extractEntitiesAdvanced(userInput + ' ' + botResponse);
    
    entities.forEach(entity => {
      context.entityContext.set(entity.name, {
        ...entity,
        lastMentioned: Date.now(),
      });
    });

    // Update topic depth
    if (context.currentSubject) {
      const depth = context.topicDepth.get(context.currentSubject) || 0;
      context.topicDepth.set(context.currentSubject, depth + 1);
    }

    // Track if user likes examples
    if (userInput.toLowerCase().includes('example') || 
        userInput.toLowerCase().includes('show me')) {
      context.userPatterns.likesExamples = true;
    }

    // Track if user asks follow-ups
    if (this.isFollowUp(userInput, context)) {
      context.userPatterns.asksFollowUps = true;
    }

    await this.saveContexts();
  }

  /**
   * Advanced entity extraction
   */
  private extractEntitiesAdvanced(text: string): EntityInfo[] {
    const entities: EntityInfo[] = [];

    // Programming languages
    const languages = [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#',
      'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Scala'
    ];
    languages.forEach(lang => {
      if (text.includes(lang)) {
        entities.push({
          name: lang,
          type: 'thing',
          lastMentioned: Date.now(),
          context: `${lang} programming language`,
          aliases: ['it', 'the language', lang.toLowerCase()]
        });
      }
    });

    // Frameworks/Libraries
    const frameworks = [
      'React', 'Angular', 'Vue', 'Django', 'Flask', 'Express',
      'Node', 'Spring', 'Rails', 'Laravel', 'TensorFlow', 'PyTorch'
    ];
    frameworks.forEach(fw => {
      if (text.includes(fw)) {
        entities.push({
          name: fw,
          type: 'thing',
          lastMentioned: Date.now(),
          context: `${fw} framework/library`,
          aliases: ['it', 'this', fw.toLowerCase()]
        });
      }
    });

    // Concepts
    const concepts = [
      'machine learning', 'artificial intelligence', 'data science',
      'web development', 'mobile development', 'cloud computing',
      'blockchain', 'cybersecurity', 'devops'
    ];
    concepts.forEach(concept => {
      if (text.toLowerCase().includes(concept)) {
        entities.push({
          name: concept,
          type: 'concept',
          lastMentioned: Date.now(),
          context: `${concept} field/concept`,
          aliases: ['it', 'this field', 'that']
        });
      }
    });

    // People (capitalized names)
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const word = words[i].replace(/[^a-zA-Z]/g, '');
      const nextWord = words[i + 1].replace(/[^a-zA-Z]/g, '');
      
      if (word.length > 1 && 
          word[0] === word[0].toUpperCase() &&
          nextWord.length > 1 &&
          nextWord[0] === nextWord[0].toUpperCase()) {
        const name = `${word} ${nextWord}`;
        entities.push({
          name,
          type: 'person',
          lastMentioned: Date.now(),
          context: `Person: ${name}`,
          aliases: ['he', 'she', 'they', name.split(' ')[0]]
        });
      }
    }

    return entities;
  }

  /**
   * Generate smart context prompt for AI
   */
  async generateContextPrompt(userId: string, newMessage: string): Promise<string> {
    const enhancedData = await this.processInput(userId, newMessage);
    const baseContext = await ContextMemoryService.getContext(userId, newMessage);
    
    let prompt = '=== CONVERSATION CONTEXT ===\n\n';

    // Resolved input
    if (enhancedData.resolvedInput !== newMessage) {
      prompt += `User means: ${enhancedData.resolvedInput}\n\n`;
    }

    // Current discussion
    if (enhancedData.relatedSubject) {
      prompt += `Currently discussing: ${enhancedData.relatedSubject}\n`;
    }

    // Follow-up handling
    if (enhancedData.isFollowUp) {
      prompt += `This is a FOLLOW-UP question. Build on previous response.\n`;
    }

    // Recent conversation
    if (baseContext.recentMessages.length > 0) {
      prompt += '\nRecent conversation:\n';
      baseContext.recentMessages.slice(-3).forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'MOTTO';
        prompt += `${role}: ${msg.content.substring(0, 150)}\n`;
      });
    }

    // Rich context
    prompt += `\n${enhancedData.context}`;

    prompt += '\n=== END CONTEXT ===\n';
    prompt += '\nRespond naturally, maintaining the conversation flow. ';
    prompt += 'If this is a follow-up, directly answer without repeating the topic name.\n';

    return prompt;
  }

  /**
   * Update user conversation patterns
   */
  private updateUserPatterns(context: EnhancedContext, input: string): void {
    const lower = input.toLowerCase();

    // Likes examples?
    if (lower.includes('example') || lower.includes('show me')) {
      context.userPatterns.likesExamples = true;
    }

    // Detail level
    if (lower.includes('detail') || lower.includes('explain deeply')) {
      context.userPatterns.detailLevel = 'deep';
    } else if (lower.includes('brief') || lower.includes('quick')) {
      context.userPatterns.detailLevel = 'brief';
    }

    // Jumps topics?
    if (context.subjectHistory.length > 5) {
      const uniqueTopics = new Set(context.subjectHistory.slice(-5)).size;
      context.userPatterns.jumpsTopics = uniqueTopics > 3;
    }
  }

  /**
   * Get conversation insights
   */
  getInsights(userId: string): {
    currentTopic: string | null;
    topicDepth: number;
    conversationStyle: string;
    suggestions: string[];
  } {
    const context = this.contexts.get(userId);
    if (!context) {
      return {
        currentTopic: null,
        topicDepth: 0,
        conversationStyle: 'exploratory',
        suggestions: []
      };
    }

    const currentTopic = context.currentSubject;
    const topicDepth = currentTopic ? (context.topicDepth.get(currentTopic) || 0) : 0;
    
    // Determine conversation style
    let style = 'exploratory';
    if (context.userPatterns.asksFollowUps) style = 'deep-dive';
    if (context.userPatterns.jumpsTopics) style = 'broad';
    if (context.userPatterns.likesExamples) style = 'practical';

    // Generate suggestions
    const suggestions: string[] = [];
    if (currentTopic && topicDepth > 3) {
      suggestions.push(`We've been discussing ${currentTopic} - ready to explore something related?`);
    }
    if (context.subjectHistory.length > 0) {
      const lastTopic = context.subjectHistory[context.subjectHistory.length - 1];
      suggestions.push(`Want to return to ${lastTopic}?`);
    }

    return {
      currentTopic,
      topicDepth,
      conversationStyle: style,
      suggestions
    };
  }

  /**
   * Smart context reset (when topic changes significantly)
   */
  async softReset(userId: string): Promise<void> {
    const context = this.contexts.get(userId);
    if (!context) return;

    // Keep entity context but clear current subject
    if (context.currentSubject) {
      context.subjectHistory.push(context.currentSubject);
    }
    context.currentSubject = null;
    context.questionType = null;
    context.expectingFollowUp = false;

    await this.saveContexts();
  }

  /**
   * Initialize enhanced context
   */
  private async initializeContext(userId: string): Promise<void> {
    if (!this.contexts.has(userId)) {
      const context: EnhancedContext = {
        currentSubject: null,
        subjectHistory: [],
        pronounReferences: new Map(),
        conversationThreads: [],
        activeThread: null,
        lastQuestion: null,
        questionType: null,
        expectingFollowUp: false,
        entityContext: new Map(),
        topicDepth: new Map(),
        userPatterns: {
          asksFollowUps: false,
          detailLevel: 'medium',
          jumpsTopics: false,
          likesExamples: false
        }
      };
      this.contexts.set(userId, context);
      await this.saveContexts();
    }
  }

  // Persistence
  private async loadContexts(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('enhanced_context');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const userId in parsed) {
          const data = parsed[userId];
          data.pronounReferences = new Map(Object.entries(data.pronounReferences || {}));
          data.entityContext = new Map(
            Object.entries(data.entityContext || {}).map(([k, v]: any) => [k, v])
          );
          data.topicDepth = new Map(Object.entries(data.topicDepth || {}));
          this.contexts.set(userId, data);
        }
      }
    } catch (error) {
      console.error('[EnhancedContext] Error loading:', error);
    }
  }

  private async saveContexts(): Promise<void> {
    try {
      const toStore: any = {};
      this.contexts.forEach((context, userId) => {
        toStore[userId] = {
          ...context,
          pronounReferences: Object.fromEntries(context.pronounReferences),
          entityContext: Object.fromEntries(
            Array.from(context.entityContext.entries())
          ),
          topicDepth: Object.fromEntries(context.topicDepth)
        };
      });
      await AsyncStorage.setItem('enhanced_context', JSON.stringify(toStore));
    } catch (error) {
      console.error('[EnhancedContext] Error saving:', error);
    }
  }
}

export default EnhancedContextService.getInstance();
