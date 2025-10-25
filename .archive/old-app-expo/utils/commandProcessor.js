// Command categories
export const COMMAND_CATEGORIES = {
  NAVIGATION: 'navigation',
  MEDIA: 'media',
  COLLECTION: 'collection',
  ANALYTICS: 'analytics',
  UTILITY: 'utility',
};

// Command definitions with metadata
export const COMMANDS = {
  // Navigation commands
  'go to home': {
    category: COMMAND_CATEGORIES.NAVIGATION,
    action: 'navigate',
    params: { screen: 'Home' },
    aliases: ['home', 'main screen', 'go home'],
    confidence: 0.9,
  },
  'go to profile': {
    category: COMMAND_CATEGORIES.NAVIGATION,
    action: 'navigate',
    params: { screen: 'Profile' },
    aliases: ['profile', 'my profile', 'user profile'],
    confidence: 0.9,
  },
  'go to settings': {
    category: COMMAND_CATEGORIES.NAVIGATION,
    action: 'navigate',
    params: { screen: 'Settings' },
    aliases: ['settings', 'preferences', 'options'],
    confidence: 0.9,
  },

  // Media commands
  'play': {
    category: COMMAND_CATEGORIES.MEDIA,
    action: 'mediaControl',
    params: { command: 'play' },
    aliases: ['start', 'resume', 'continue'],
    confidence: 0.95,
  },
  'pause': {
    category: COMMAND_CATEGORIES.MEDIA,
    action: 'mediaControl',
    params: { command: 'pause' },
    aliases: ['stop', 'halt'],
    confidence: 0.95,
  },
  'next': {
    category: COMMAND_CATEGORIES.MEDIA,
    action: 'mediaControl',
    params: { command: 'next' },
    aliases: ['skip', 'next track', 'next item'],
    confidence: 0.9,
  },
  'previous': {
    category: COMMAND_CATEGORIES.MEDIA,
    action: 'mediaControl',
    params: { command: 'previous' },
    aliases: ['back', 'previous track', 'previous item'],
    confidence: 0.9,
  },
  'volume up': {
    category: COMMAND_CATEGORIES.MEDIA,
    action: 'mediaControl',
    params: { command: 'volumeUp' },
    aliases: ['increase volume', 'louder'],
    confidence: 0.85,
  },
  'volume down': {
    category: COMMAND_CATEGORIES.MEDIA,
    action: 'mediaControl',
    params: { command: 'volumeDown' },
    aliases: ['decrease volume', 'quieter'],
    confidence: 0.85,
  },

  // Collection commands
  'create collection': {
    category: COMMAND_CATEGORIES.COLLECTION,
    action: 'collection',
    params: { command: 'create' },
    aliases: ['new collection', 'make collection'],
    confidence: 0.8,
  },
  'add to collection': {
    category: COMMAND_CATEGORIES.COLLECTION,
    action: 'collection',
    params: { command: 'add' },
    aliases: ['save to collection', 'collect'],
    confidence: 0.8,
  },
  'show collections': {
    category: COMMAND_CATEGORIES.COLLECTION,
    action: 'collection',
    params: { command: 'list' },
    aliases: ['list collections', 'my collections'],
    confidence: 0.8,
  },

  // Analytics commands
  'show stats': {
    category: COMMAND_CATEGORIES.ANALYTICS,
    action: 'analytics',
    params: { command: 'show' },
    aliases: ['statistics', 'analytics', 'show analytics'],
    confidence: 0.85,
  },
  'show performance': {
    category: COMMAND_CATEGORIES.ANALYTICS,
    action: 'analytics',
    params: { command: 'performance' },
    aliases: ['performance stats', 'show performance stats'],
    confidence: 0.85,
  },

  // Utility commands
  'help': {
    category: COMMAND_CATEGORIES.UTILITY,
    action: 'help',
    aliases: ['show help', 'commands', 'what can you do'],
    confidence: 0.95,
  },
  'settings': {
    category: COMMAND_CATEGORIES.UTILITY,
    action: 'settings',
    aliases: ['preferences', 'options'],
    confidence: 0.9,
  },
};

// Lightweight NLP keyword maps to infer commands from natural language
const KEYWORD_TO_COMMAND = [
  { keywords: ['go', 'open', 'navigate', 'take me', 'bring me'], target: 'go to ' },
  { keywords: ['settings', 'preferences', 'options'], target: 'go to settings' },
  { keywords: ['profile', 'account'], target: 'go to profile' },
  { keywords: ['home', 'main'], target: 'go to home' },
  { keywords: ['stats', 'statistics', 'analytics'], target: 'show stats' },
  { keywords: ['performance'], target: 'show performance' },
  { keywords: ['play', 'resume', 'continue'], target: 'play' },
  { keywords: ['pause', 'stop'], target: 'pause' },
  { keywords: ['next', 'skip'], target: 'next' },
  { keywords: ['previous', 'back'], target: 'previous' },
  { keywords: ['louder', 'increase volume', 'volume up'], target: 'volume up' },
  { keywords: ['quieter', 'decrease volume', 'volume down'], target: 'volume down' },
  { keywords: ['collections', 'my collections'], target: 'show collections' },
  { keywords: ['help', 'what can you do'], target: 'help' },
];

// Lightweight command handler registry (action -> async handler)
const _commandHandlers = new Map();

export function registerCommandHandler(action, handler) {
  if (typeof action !== 'string' || typeof handler !== 'function') return;
  _commandHandlers.set(action, handler);
}

export function clearCommandHandlers() {
  _commandHandlers.clear();
}

export function getCommandHandler(action) {
  return _commandHandlers.get(action);
}

// Command processor class for efficient command matching
export class CommandProcessor {
  constructor(options = {}) {
    this.minConfidence = options.minConfidence || 0.8;
    this.commandCache = new Map();
    this.commandHistory = [];
    this.maxHistorySize = options.maxHistorySize || 50;
  }

  // Process a voice command with improved matching
  processCommand(text) {
    if (!text) return null;

    const normalizedText = text.toLowerCase().trim();
    
    // Check cache first
    if (this.commandCache.has(normalizedText)) {
      return this.commandCache.get(normalizedText);
    }

    // Check for exact matches
    if (COMMANDS[normalizedText]) {
      this.cacheCommand(normalizedText, COMMANDS[normalizedText]);
      return COMMANDS[normalizedText];
    }

    // Check aliases
    for (const [command, data] of Object.entries(COMMANDS)) {
      if (data.aliases && data.aliases.includes(normalizedText)) {
        this.cacheCommand(normalizedText, data);
        return data;
      }
    }

    // Fuzzy matching for similar commands
    const similarCommands = this.findSimilarCommands(normalizedText);
    if (similarCommands.length > 0) {
      const bestMatch = similarCommands[0];
      this.cacheCommand(normalizedText, bestMatch.command);
      return bestMatch.command;
    }

    // Natural language interpretation fallback
    const inferred = this.inferCommandKeyFromText(normalizedText);
    if (inferred && COMMANDS[inferred]) {
      this.cacheCommand(normalizedText, COMMANDS[inferred]);
      return COMMANDS[inferred];
    }

    return null;
  }

  // Find similar commands using Levenshtein distance
  findSimilarCommands(text) {
    const results = [];

    for (const [command, data] of Object.entries(COMMANDS)) {
      const similarity = this.calculateSimilarity(text, command);
      if (similarity >= this.minConfidence) {
        results.push({
          command: data,
          similarity,
        });
      }

      // Check aliases
      if (data.aliases) {
        for (const alias of data.aliases) {
          const aliasSimilarity = this.calculateSimilarity(text, alias);
          if (aliasSimilarity >= this.minConfidence) {
            results.push({
              command: data,
              similarity: aliasSimilarity,
            });
          }
        }
      }
    }

    // Sort by similarity
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  // Calculate string similarity (Levenshtein distance)
  calculateSimilarity(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return 1 - track[str2.length][str1.length] / maxLength;
  }

  // Cache command for faster future lookups
  cacheCommand(text, command) {
    this.commandCache.set(text, command);
    if (this.commandCache.size > 100) {
      // Remove oldest entries if cache gets too large
      const firstKey = this.commandCache.keys().next().value;
      this.commandCache.delete(firstKey);
    }
  }

  // Natural language → known command key
  inferCommandKeyFromText(text) {
    const t = (text || '').toLowerCase();
    // Direct screen hints like "go to <screen>"
    if (/(go to|open|navigate)/.test(t)) {
      if (t.includes('home')) return 'go to home';
      if (t.includes('profile')) return 'go to profile';
      if (t.includes('setting') || t.includes('preferences') || t.includes('options')) return 'go to settings';
    }

    // Keyword mapping list
    for (const mapping of KEYWORD_TO_COMMAND) {
      if (mapping.keywords.some(k => t.includes(k))) {
        // Some mappings specify explicit command keys
        if (COMMANDS[mapping.target]) return mapping.target;
        // Or a prefix like 'go to '
        if (mapping.target.startsWith('go to ')) {
          const screen = t.split(' ').pop();
          const candidate = `${mapping.target}${screen}`.trim();
          if (COMMANDS[candidate]) return candidate;
        }
      }
    }

    // Simple normalizations
    if (/^help( me)?/.test(t)) return 'help';
    if (/^play(\b|\s)/.test(t)) return 'play';
    if (/^pause(\b|\s)/.test(t)) return 'pause';
    if (/volume\s*(up|increase|louder)/.test(t)) return 'volume up';
    if (/volume\s*(down|decrease|quieter)/.test(t)) return 'volume down';
    if (/analytics|stats|statistics/.test(t)) return 'show stats';

    return null;
  }

  // Return near-miss suggestions for a text input
  getNearMissSuggestions(text, limit = 3) {
    const normalized = (text || '').toLowerCase().trim();
    const scored = [];
    for (const [command, data] of Object.entries(COMMANDS)) {
      const score = this.calculateSimilarity(normalized, command);
      if (score >= 0.6) scored.push({ command, score });
      if (data.aliases) {
        for (const alias of data.aliases) {
          const aScore = this.calculateSimilarity(normalized, alias.toLowerCase());
          if (aScore >= 0.6) scored.push({ command, score: aScore });
        }
      }
    }
    scored.sort((a, b) => b.score - a.score);
    const uniq = [];
    const seen = new Set();
    for (const s of scored) {
      if (!seen.has(s.command)) {
        uniq.push(s.command);
        seen.add(s.command);
      }
      if (uniq.length >= limit) break;
    }
    return uniq;
  }

  // Execute a matched command by delegating to a registered action handler
  async executeCommand(commandKey, params = {}) {
    try {
      if (!commandKey) {
        return { success: false, message: 'No command provided' };
      }

      const config = COMMANDS[commandKey];
      if (!config || !config.action) {
        return { success: false, message: 'Unknown command' };
      }

      const handler = getCommandHandler(config.action);
      if (typeof handler !== 'function') {
        return { success: false, message: `No handler for action: ${config.action}` };
      }

      const mergedParams = { ...(config.params || {}), ...(params || {}) };
      const result = await handler(mergedParams, { command: commandKey, config });
      this.addToHistory(commandKey);
      return {
        success: !!(result && result.success !== false),
        message: (result && result.message) || 'Executed',
        data: result && result.data,
      };
    } catch (error) {
      return { success: false, message: error?.message || 'Execution failed' };
    }
  }

  // Add command to history
  addToHistory(command) {
    this.commandHistory.unshift({
      command,
      timestamp: Date.now(),
    });

    // Trim history if it gets too long
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.pop();
    }
  }

  // Get command history
  getHistory() {
    return this.commandHistory;
  }

  // Clear command history
  clearHistory() {
    this.commandHistory = [];
  }

  // Get commands by category
  getCommandsByCategory(category) {
    return Object.entries(COMMANDS)
      .filter(([_, data]) => data.category === category)
      .map(([command, data]) => ({
        command,
        ...data,
      }));
  }

  // Get all available commands
  getAllCommands() {
    return Object.entries(COMMANDS).map(([command, data]) => ({
      command,
      ...data,
    }));
  }
} 