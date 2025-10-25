/**
 * Response Variety Service
 * Ensures MOTTO never sounds repetitive - always fresh and engaging!
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface ResponseHistory {
  userId: string;
  recentPhrases: { phrase: string; timestamp: number; count: number }[];
  recentGreetings: string[];
  recentTransitions: string[];
  recentClosings: string[];
  phrasesUsed: Map<string, number>; // phrase -> usage count
  lastResponseTime: number;
  conversationLength: number;
}

class ResponseVarietyService {
  private static instance: ResponseVarietyService;
  private histories: Map<string, ResponseHistory> = new Map();
  
  // Diverse phrase banks (100+ variations each)
  private readonly GREETINGS = {
    casual: [
      "Hey there!", "Hi!", "Hello!", "Hey!", "Yo!", "What's up!", 
      "Heya!", "Hiya!", "Greetings!", "Welcome back!", "Good to see you!",
      "There you are!", "Perfect timing!", "Great to hear from you!",
      "Nice to see you again!", "Back again!", "Let's go!", "Ready when you are!",
      "Let's dive in!", "Excited to help!", "Always happy to assist!"
    ],
    formal: [
      "Hello.", "Greetings.", "Good day.", "Welcome.", "Salutations.",
      "It's a pleasure.", "Pleased to assist.", "At your service.",
      "How may I help?", "Ready to assist.", "Here to support you."
    ],
    enthusiastic: [
      "Hey! 🌟", "Awesome to see you! ✨", "Let's do this! 🚀",
      "Excited to help! 💪", "Ready to rock! 🎸", "Let's make magic! ✨",
      "Pumped to assist! 🔥", "Let's crush this! 💥", "Game on! 🎮"
    ],
    empathetic: [
      "I'm here for you.", "Let's work through this together.",
      "I understand.", "I'm listening.", "Take your time.",
      "No worries at all.", "I've got you.", "We'll figure this out."
    ],
    timeSpecific: [
      "Good morning! ☀️", "Good afternoon! 🌤️", "Good evening! 🌙",
      "Hope you're having a great morning!", "Afternoon! How's your day?",
      "Evening! Ready to wrap things up?"
    ]
  };

  private readonly TRANSITIONS = {
    standard: [
      "Let me help with that.", "I can assist with that.", "Sure thing!",
      "Absolutely!", "Of course!", "No problem!", "Got it!",
      "On it!", "Consider it done!", "I'll take care of that.",
      "Happy to help!", "Let's tackle this.", "I'm on it!",
      "Coming right up!", "Right away!", "Let's get started!"
    ],
    understanding: [
      "I see what you mean.", "That makes sense.", "I understand.",
      "Got you.", "Makes perfect sense.", "I follow.",
      "Clear as day.", "Understood.", "I hear you.",
      "That's a great question.", "Interesting thought!",
      "Good point!", "I can see why you'd ask that."
    ],
    encouraging: [
      "You're on the right track!", "Great question!",
      "Love the curiosity!", "Smart thinking!",
      "That's exactly the right question to ask!",
      "You're thinking like a pro!", "Excellent approach!",
      "That shows real insight!", "You're really getting it!"
    ],
    exploratory: [
      "Let's explore that.", "Let's dig into this.",
      "Let me break this down.", "Here's what's happening.",
      "Let me explain.", "Here's the deal.", "Let's unpack this.",
      "Let me show you.", "Allow me to clarify.",
      "Let's walk through this together."
    ]
  };

  private readonly CLOSINGS = {
    helpful: [
      "Hope that helps!", "Let me know if you need more!",
      "Feel free to ask anything else!", "Any other questions?",
      "Happy to clarify more!", "Want to dive deeper?",
      "Need anything else?", "Anything else I can help with?",
      "Is there more you'd like to know?", "Shall we continue?"
    ],
    encouraging: [
      "You've got this! 💪", "Keep up the great work!",
      "You're doing amazing!", "Great progress!",
      "Crushing it! 🎉", "Way to go!", "Nice work!",
      "Keep it up!", "You're on fire! 🔥", "Impressive!"
    ],
    casual: [
      "Cheers!", "Take care!", "Good luck!", "Have fun!",
      "Enjoy!", "Rock on! 🎸", "Stay awesome!",
      "Catch you later!", "Until next time!", "Peace! ✌️"
    ],
    professional: [
      "Best regards.", "All the best.", "Wishing you success.",
      "Looking forward to helping more.", "Please don't hesitate to reach out.",
      "At your service.", "Always here to help."
    ],
    inviting: [
      "What else are you curious about?",
      "What's next on your mind?",
      "Ready for the next challenge?",
      "What else can I help you discover?",
      "Shall we tackle something else?",
      "What other questions do you have?"
    ]
  };

  private readonly AFFIRMATIONS = [
    "Exactly!", "Precisely!", "Spot on!", "Absolutely right!",
    "You nailed it!", "That's it!", "Bingo!", "Perfect!",
    "Right on!", "Correct!", "Indeed!", "For sure!",
    "100%!", "Couldn't have said it better!", "That's the way!",
    "You're absolutely right!", "Exactly my thinking!",
    "That's exactly it!", "You got it!", "Bull's eye!"
  ];

  private readonly CLARIFICATIONS = [
    "To clarify:", "In other words:", "Put simply:",
    "Breaking it down:", "Here's what I mean:", "Let me explain:",
    "Essentially:", "The key point is:", "What this means is:",
    "To put it another way:", "More specifically:", "The bottom line:",
    "In essence:", "Fundamentally:", "At its core:",
    "The main idea is:", "Simply put:", "The gist is:"
  ];

  private readonly ELABORATIONS = [
    "Let me elaborate:", "Diving deeper:", "More detail:",
    "To expand on that:", "Going further:", "Additionally:",
    "What's more:", "On top of that:", "Building on that:",
    "Taking it further:", "To add to that:", "Furthermore:",
    "Another layer:", "Digging deeper:", "Looking closer:",
    "Expanding on that:", "In more depth:", "Zooming in:"
  ];

  private readonly EXAMPLES_INTRO = [
    "For example:", "Here's an example:", "Consider this:",
    "Take this case:", "Imagine:", "Let's say:",
    "Picture this:", "Think of it like this:", "Say you have:",
    "Here's how:", "An example would be:", "To illustrate:",
    "Case in point:", "A good example is:", "Let me show you:",
    "Visualize this:", "Here's a scenario:", "For instance:"
  ];

  private readonly ENTHUSIASM = [
    "Awesome!", "Fantastic!", "Brilliant!", "Excellent!",
    "Terrific!", "Superb!", "Outstanding!", "Incredible!",
    "Amazing!", "Wonderful!", "Fabulous!", "Spectacular!",
    "Magnificent!", "Phenomenal!", "Remarkable!", "Impressive!",
    "Stellar!", "Epic!", "Cool!", "Sweet!", "Nice!"
  ];

  private constructor() {
    this.loadHistories();
  }

  static getInstance(): ResponseVarietyService {
    if (!ResponseVarietyService.instance) {
      ResponseVarietyService.instance = new ResponseVarietyService();
    }
    return ResponseVarietyService.instance;
  }

  /**
   * Get a varied greeting (never repeats recently used ones)
   */
  async getGreeting(
    userId: string,
    style: 'casual' | 'formal' | 'enthusiastic' | 'empathetic' | 'timeSpecific' = 'casual',
    timeOfDay?: number
  ): Promise<string> {
    await this.initializeUser(userId);
    const history = this.histories.get(userId)!;

    // Time-specific greetings based on hour
    if (style === 'timeSpecific' && timeOfDay !== undefined) {
      if (timeOfDay >= 5 && timeOfDay < 12) {
        return this.getUnusedPhrase(history, this.GREETINGS.timeSpecific.slice(0, 2), 'greetings');
      } else if (timeOfDay >= 12 && timeOfDay < 17) {
        return this.getUnusedPhrase(history, this.GREETINGS.timeSpecific.slice(2, 4), 'greetings');
      } else {
        return this.getUnusedPhrase(history, this.GREETINGS.timeSpecific.slice(4), 'greetings');
      }
    }

    return this.getUnusedPhrase(history, this.GREETINGS[style], 'greetings');
  }

  /**
   * Get a varied transition phrase
   */
  async getTransition(
    userId: string,
    type: 'standard' | 'understanding' | 'encouraging' | 'exploratory' = 'standard'
  ): Promise<string> {
    await this.initializeUser(userId);
    const history = this.histories.get(userId)!;
    return this.getUnusedPhrase(history, this.TRANSITIONS[type], 'transitions');
  }

  /**
   * Get a varied closing
   */
  async getClosing(
    userId: string,
    type: 'helpful' | 'encouraging' | 'casual' | 'professional' | 'inviting' = 'helpful'
  ): Promise<string> {
    await this.initializeUser(userId);
    const history = this.histories.get(userId)!;
    return this.getUnusedPhrase(history, this.CLOSINGS[type], 'closings');
  }

  /**
   * Get a random affirmation
   */
  getAffirmation(userId: string): string {
    const history = this.histories.get(userId);
    if (!history) return this.AFFIRMATIONS[0];
    return this.getUnusedPhrase(history, this.AFFIRMATIONS);
  }

  /**
   * Get a random clarification phrase
   */
  getClarification(userId: string): string {
    const history = this.histories.get(userId);
    if (!history) return this.CLARIFICATIONS[0];
    return this.getUnusedPhrase(history, this.CLARIFICATIONS);
  }

  /**
   * Get a random elaboration phrase
   */
  getElaboration(userId: string): string {
    const history = this.histories.get(userId);
    if (!history) return this.ELABORATIONS[0];
    return this.getUnusedPhrase(history, this.ELABORATIONS);
  }

  /**
   * Get a random example introduction
   */
  getExampleIntro(userId: string): string {
    const history = this.histories.get(userId);
    if (!history) return this.EXAMPLES_INTRO[0];
    return this.getUnusedPhrase(history, this.EXAMPLES_INTRO);
  }

  /**
   * Get a random enthusiasm expression
   */
  getEnthusiasm(userId: string): string {
    const history = this.histories.get(userId);
    if (!history) return this.ENTHUSIASM[0];
    return this.getUnusedPhrase(history, this.ENTHUSIASM);
  }

  /**
   * Make response varied by replacing repetitive phrases
   */
  async makeVaried(userId: string, response: string): Promise<string> {
    await this.initializeUser(userId);
    const history = this.histories.get(userId)!;

    let varied = response;

    // Replace common repetitive patterns
    const patterns = [
      // Greetings
      { old: /^(Hello|Hi|Hey)[!,.]?\s*/i, replacement: async () => await this.getGreeting(userId, 'casual') + ' ' },
      
      // Transitions
      { old: /(Let me help|I can help|Sure|Absolutely)[!,.]?\s*/gi, replacement: async () => await this.getTransition(userId) + ' ' },
      
      // "Here's" variations
      { old: /Here's /gi, replacement: () => this.getRandomVariation([
        "Here's ", "Here you have ", "Check out ", "Take a look at ",
        "Have a look at ", "See ", "Notice ", "Observe "
      ]) },
      
      // "I'll" variations
      { old: /I'll /gi, replacement: () => this.getRandomVariation([
        "I'll ", "I will ", "I'm going to ", "Let me ",
        "I can ", "Allow me to ", "I'd be happy to "
      ]) },
      
      // "You can" variations
      { old: /You can /gi, replacement: () => this.getRandomVariation([
        "You can ", "You're able to ", "Feel free to ", "You have the option to ",
        "You could ", "You might ", "Consider ", "Try "
      ]) },
      
      // "This means" variations
      { old: /This means /gi, replacement: () => this.getRandomVariation([
        "This means ", "What this tells us is ", "In other words, ",
        "Essentially, ", "Put simply, ", "The upshot is ", "Basically, "
      ]) },
      
      // "For example" variations
      { old: /For example[,:]?\s*/gi, replacement: () => this.getExampleIntro(userId) + ' ' },
      
      // "Great" variations
      { old: /Great /gi, replacement: () => this.getRandomVariation([
        "Great ", "Excellent ", "Fantastic ", "Wonderful ",
        "Perfect ", "Awesome ", "Terrific ", "Brilliant "
      ]) }
    ];

    // Apply replacements with tracking
    for (const pattern of patterns) {
      const matches = varied.match(pattern.old);
      if (matches) {
        for (const match of matches) {
          const replacement = typeof pattern.replacement === 'function' 
            ? await pattern.replacement() 
            : pattern.replacement;
          varied = varied.replace(match, replacement);
          this.trackPhrase(history, replacement);
        }
      }
    }

    // Remove excessive repetition of same word
    varied = this.removeExcessiveRepetition(varied);

    // Vary sentence structure
    varied = this.varySentenceStructure(varied);

    return varied;
  }

  /**
   * Diversify response structure
   */
  async diversifyResponse(
    userId: string,
    baseResponse: string,
    context: {
      isFollowUp?: boolean;
      userMood?: string;
      conversationLength?: number;
    }
  ): Promise<string> {
    await this.initializeUser(userId);
    const history = this.histories.get(userId)!;

    // Determine style based on context
    let greetingStyle: any = 'casual';
    let transitionType: any = 'standard';
    let closingType: any = 'helpful';

    if (context.userMood === 'frustrated') {
      greetingStyle = 'empathetic';
      transitionType = 'understanding';
    } else if (context.conversationLength && context.conversationLength > 10) {
      greetingStyle = 'enthusiastic';
      transitionType = 'encouraging';
      closingType = 'encouraging';
    }

    // Build varied response
    let response = baseResponse;

    // Add greeting if not a follow-up
    if (!context.isFollowUp && !response.match(/^(hello|hi|hey|greetings)/i)) {
      const greeting = await this.getGreeting(userId, greetingStyle);
      response = `${greeting} ${response}`;
    }

    // Make core content varied
    response = await this.makeVaried(userId, response);

    // Add varied closing
    if (!response.match(/(hope|feel free|let me know|any)/i)) {
      const closing = await this.getClosing(userId, closingType);
      response = `${response}\n\n${closing}`;
    }

    // Track this response
    this.trackResponse(history, response);

    return response;
  }

  /**
   * Get unused phrase from list (avoids recent ones)
   */
  private getUnusedPhrase(
    history: ResponseHistory,
    phrases: string[],
    type?: 'greetings' | 'transitions' | 'closings'
  ): string {
    // Get recent phrases of this type
    let recent: string[] = [];
    if (type === 'greetings') recent = history.recentGreetings;
    else if (type === 'transitions') recent = history.recentTransitions;
    else if (type === 'closings') recent = history.recentClosings;

    // Filter out recently used
    const unused = phrases.filter(p => !recent.includes(p));
    
    // If all used, reset and use least recently used
    const available = unused.length > 0 ? unused : phrases;
    
    // Get least used phrase
    const leastUsed = available.sort((a, b) => {
      const countA = history.phrasesUsed.get(a) || 0;
      const countB = history.phrasesUsed.get(b) || 0;
      return countA - countB;
    });

    const selected = leastUsed[Math.floor(Math.random() * Math.min(3, leastUsed.length))];
    
    // Track usage
    if (type) {
      recent.push(selected);
      if (recent.length > 5) recent.shift();
    }
    
    this.trackPhrase(history, selected);
    
    return selected;
  }

  /**
   * Get random variation (simple helper)
   */
  private getRandomVariation(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Remove excessive repetition of same word
   */
  private removeExcessiveRepetition(text: string): string {
    // Find words repeated more than 2 times in close proximity
    const words = text.split(/\s+/);
    const result: string[] = [];
    const recentWords = new Map<string, number>();

    for (const word of words) {
      const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
      const lastSeen = recentWords.get(lower) || -10;
      const distance = result.length - lastSeen;

      // If same word appeared within last 5 words, use synonym
      if (distance < 5 && lower.length > 3) {
        const synonym = this.getSynonym(lower);
        result.push(synonym || word);
      } else {
        result.push(word);
      }

      recentWords.set(lower, result.length - 1);
    }

    return result.join(' ');
  }

  /**
   * Get synonym for common words
   */
  private getSynonym(word: string): string | null {
    const synonyms: { [key: string]: string[] } = {
      'great': ['excellent', 'wonderful', 'fantastic', 'terrific'],
      'good': ['nice', 'fine', 'solid', 'sound'],
      'help': ['assist', 'support', 'aid', 'guide'],
      'show': ['demonstrate', 'display', 'reveal', 'present'],
      'make': ['create', 'build', 'construct', 'form'],
      'use': ['utilize', 'employ', 'apply', 'leverage'],
      'get': ['obtain', 'acquire', 'receive', 'gain'],
      'give': ['provide', 'offer', 'supply', 'present'],
      'see': ['notice', 'observe', 'view', 'spot'],
      'know': ['understand', 'comprehend', 'realize', 'grasp']
    };

    if (synonyms[word]) {
      return synonyms[word][Math.floor(Math.random() * synonyms[word].length)];
    }

    return null;
  }

  /**
   * Vary sentence structure to avoid monotony
   */
  private varySentenceStructure(text: string): string {
    // Split into sentences
    const sentences = text.split(/([.!?]+\s+)/);
    
    // Check for monotonous patterns (e.g., all starting with "You can")
    const starts = sentences
      .filter((s, i) => i % 2 === 0) // Only actual sentences
      .map(s => s.trim().split(' ')[0])
      .filter(w => w);

    const startCounts = new Map<string, number>();
    starts.forEach(start => {
      startCounts.set(start, (startCounts.get(start) || 0) + 1);
    });

    // If more than 2 sentences start the same way, vary them
    startCounts.forEach((count, start) => {
      if (count > 2 && start.length > 2) {
        let replaced = 0;
        for (let i = 0; i < sentences.length; i += 2) {
          if (sentences[i].trim().startsWith(start) && replaced > 0) {
            // Vary the start
            if (start === 'You') {
              sentences[i] = sentences[i].replace(/^You /, 'Try to ');
            } else if (start === 'The') {
              sentences[i] = sentences[i].replace(/^The /, 'This ');
            } else if (start === 'It') {
              sentences[i] = sentences[i].replace(/^It /, 'This ');
            }
          }
          if (sentences[i].trim().startsWith(start)) replaced++;
        }
      }
    });

    return sentences.join('');
  }

  /**
   * Track phrase usage
   */
  private trackPhrase(history: ResponseHistory, phrase: string): void {
    history.phrasesUsed.set(phrase, (history.phrasesUsed.get(phrase) || 0) + 1);
    
    // Track recent phrases
    const recent = { phrase, timestamp: Date.now(), count: history.phrasesUsed.get(phrase)! };
    history.recentPhrases.push(recent);
    
    // Keep only last 50
    if (history.recentPhrases.length > 50) {
      history.recentPhrases.shift();
    }
  }

  /**
   * Track full response
   */
  private trackResponse(history: ResponseHistory, response: string): void {
    history.lastResponseTime = Date.now();
    history.conversationLength++;
  }

  /**
   * Initialize user history
   */
  private async initializeUser(userId: string): Promise<void> {
    if (!this.histories.has(userId)) {
      const history: ResponseHistory = {
        userId,
        recentPhrases: [],
        recentGreetings: [],
        recentTransitions: [],
        recentClosings: [],
        phrasesUsed: new Map(),
        lastResponseTime: Date.now(),
        conversationLength: 0
      };
      this.histories.set(userId, history);
      await this.saveHistories();
    }
  }

  /**
   * Get variety stats for user
   */
  getVarietyStats(userId: string): {
    uniquePhrases: number;
    mostUsedPhrases: { phrase: string; count: number }[];
    conversationLength: number;
  } {
    const history = this.histories.get(userId);
    if (!history) return { uniquePhrases: 0, mostUsedPhrases: [], conversationLength: 0 };

    const sorted = Array.from(history.phrasesUsed.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));

    return {
      uniquePhrases: history.phrasesUsed.size,
      mostUsedPhrases: sorted,
      conversationLength: history.conversationLength
    };
  }

  /**
   * Reset user history (for testing or fresh start)
   */
  async resetUser(userId: string): Promise<void> {
    this.histories.delete(userId);
    await this.saveHistories();
  }

  // Persistence
  private async loadHistories(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('response_variety_histories');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const userId in parsed) {
          const data = parsed[userId];
          data.phrasesUsed = new Map(Object.entries(data.phrasesUsed));
          this.histories.set(userId, data);
        }
      }
    } catch (error) {
      console.error('[ResponseVariety] Error loading histories:', error);
    }
  }

  private async saveHistories(): Promise<void> {
    try {
      const toStore: any = {};
      this.histories.forEach((history, userId) => {
        toStore[userId] = {
          ...history,
          phrasesUsed: Object.fromEntries(history.phrasesUsed)
        };
      });
      await AsyncStorage.setItem('response_variety_histories', JSON.stringify(toStore));
    } catch (error) {
      console.error('[ResponseVariety] Error saving histories:', error);
    }
  }
}

export default ResponseVarietyService.getInstance();
