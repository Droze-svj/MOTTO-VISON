/**
 * Context Memory Service
 * Remembers conversation history and maintains context across messages
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  topics: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface ConversationContext {
  userId: string;
  messages: ConversationMessage[];
  currentTopics: string[];
  lastInteraction: number;
  conversationSummary: string;
  activeEntities: Map<string, number>; // entity -> last mentioned timestamp
}

class ContextMemoryService {
  private static instance: ContextMemoryService;
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly MAX_MESSAGES = 20; // Keep last 20 messages
  private readonly CONTEXT_WINDOW = 10; // Use last 10 for context

  private constructor() {
    this.loadContexts();
  }

  static getInstance(): ContextMemoryService {
    if (!ContextMemoryService.instance) {
      ContextMemoryService.instance = new ContextMemoryService();
    }
    return ContextMemoryService.instance;
  }

  /**
   * Add message to conversation history
   */
  async addMessage(
    userId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<void> {
    await this.initializeContext(userId);
    const context = this.contexts.get(userId)!;

    const message: ConversationMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      topics: this.extractTopics(content),
      entities: this.extractEntities(content),
      sentiment: this.detectSentiment(content),
    };

    context.messages.push(message);
    
    // Keep only last MAX_MESSAGES
    if (context.messages.length > this.MAX_MESSAGES) {
      context.messages = context.messages.slice(-this.MAX_MESSAGES);
    }

    // Update current topics
    context.currentTopics = this.getCurrentTopics(context.messages);
    
    // Update active entities
    message.entities.forEach(entity => {
      context.activeEntities.set(entity, Date.now());
    });

    // Clean old entities (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    Array.from(context.activeEntities.entries()).forEach(([entity, timestamp]) => {
      if (timestamp < tenMinutesAgo) {
        context.activeEntities.delete(entity);
      }
    });

    context.lastInteraction = Date.now();
    
    await this.saveContexts();
  }

  /**
   * Get relevant context for new message
   */
  async getContext(userId: string, newMessage: string): Promise<{
    recentMessages: ConversationMessage[];
    relevantContext: string;
    currentTopics: string[];
    activeEntities: string[];
  }> {
    await this.initializeContext(userId);
    const context = this.contexts.get(userId)!;

    const recentMessages = context.messages.slice(-this.CONTEXT_WINDOW);
    const currentTopics = context.currentTopics;
    const activeEntities = Array.from(context.activeEntities.keys());

    // Build relevant context string
    const relevantContext = this.buildContextString(
      recentMessages,
      newMessage,
      currentTopics,
      activeEntities
    );

    return {
      recentMessages,
      relevantContext,
      currentTopics,
      activeEntities,
    };
  }

  /**
   * Build context string for AI
   */
  private buildContextString(
    messages: ConversationMessage[],
    newMessage: string,
    topics: string[],
    entities: string[]
  ): string {
    let context = '';

    // Add conversation summary
    if (messages.length > 0) {
      context += 'Recent conversation:\n';
      messages.slice(-5).forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'You';
        context += `${role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
      });
      context += '\n';
    }

    // Add current topics
    if (topics.length > 0) {
      context += `Current topics: ${topics.join(', ')}\n`;
    }

    // Add active entities
    if (entities.length > 0) {
      context += `Mentioned: ${entities.join(', ')}\n`;
    }

    // Add note about context
    if (messages.length > 0) {
      context += `\nNote: Continue the conversation naturally, referring back to previous points when relevant.\n`;
    }

    return context;
  }

  /**
   * Extract topics from text
   */
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const lower = text.toLowerCase();

    // Common topic keywords
    const topicMap: { [key: string]: string[] } = {
      'programming': ['code', 'coding', 'program', 'developer', 'software', 'javascript', 'python', 'react'],
      'learning': ['learn', 'study', 'tutorial', 'course', 'teach', 'education'],
      'health': ['health', 'fitness', 'exercise', 'diet', 'nutrition', 'medical'],
      'finance': ['money', 'finance', 'invest', 'stock', 'crypto', 'budget'],
      'travel': ['travel', 'trip', 'vacation', 'country', 'city', 'hotel'],
      'food': ['food', 'recipe', 'cook', 'meal', 'restaurant', 'eat'],
      'technology': ['tech', 'ai', 'machine learning', 'computer', 'device', 'app'],
      'science': ['science', 'research', 'study', 'experiment', 'theory'],
      'art': ['art', 'design', 'creative', 'draw', 'paint', 'music'],
      'business': ['business', 'company', 'startup', 'entrepreneur', 'market'],
    };

    Object.entries(topicMap).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lower.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  /**
   * Extract entities (people, places, things)
   */
  private extractEntities(text: string): string[] {
    const entities: string[] = [];

    // Simple capitalized words (potential proper nouns)
    const words = text.split(/\s+/);
    words.forEach(word => {
      const cleaned = word.replace(/[^a-zA-Z]/g, '');
      if (cleaned.length > 2 && cleaned[0] === cleaned[0].toUpperCase()) {
        entities.push(cleaned);
      }
    });

    // Common entities
    const commonEntities = [
      'Python', 'JavaScript', 'React', 'Node', 'TypeScript',
      'AWS', 'Google', 'Microsoft', 'Apple', 'Facebook',
      'API', 'SQL', 'HTML', 'CSS', 'Git', 'Docker',
    ];

    commonEntities.forEach(entity => {
      if (text.includes(entity)) {
        entities.push(entity);
      }
    });

    // Remove duplicates
    return [...new Set(entities)];
  }

  /**
   * Detect sentiment
   */
  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const lower = text.toLowerCase();

    const positiveWords = [
      'great', 'good', 'excellent', 'awesome', 'love', 'thanks',
      'perfect', 'nice', 'happy', 'wonderful', 'fantastic', 'amazing'
    ];

    const negativeWords = [
      'bad', 'wrong', 'error', 'problem', 'issue', 'hate',
      'terrible', 'awful', 'frustrated', 'confused', 'stuck', 'help'
    ];

    const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Get current topics from recent messages
   */
  private getCurrentTopics(messages: ConversationMessage[]): string[] {
    const topicCounts = new Map<string, number>();
    
    // Count topics from last 5 messages
    messages.slice(-5).forEach(msg => {
      msg.topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    // Return topics sorted by frequency
    return Array.from(topicCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([topic]) => topic)
      .slice(0, 3);
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(userId: string): string {
    const context = this.contexts.get(userId);
    if (!context || context.messages.length === 0) {
      return 'No conversation yet.';
    }

    const messageCount = context.messages.length;
    const topics = context.currentTopics.join(', ') || 'various topics';
    const lastInteraction = new Date(context.lastInteraction).toLocaleString();

    return `${messageCount} messages about ${topics}. Last active: ${lastInteraction}`;
  }

  /**
   * Clear conversation history
   */
  async clearHistory(userId: string): Promise<void> {
    const context = this.contexts.get(userId);
    if (context) {
      context.messages = [];
      context.currentTopics = [];
      context.activeEntities.clear();
      context.conversationSummary = '';
      await this.saveContexts();
    }
  }

  /**
   * Get conversation statistics
   */
  getStats(userId: string): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    topics: string[];
    entities: string[];
    sentiment: { positive: number; neutral: number; negative: number };
  } {
    const context = this.contexts.get(userId);
    if (!context) {
      return {
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        topics: [],
        entities: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 },
      };
    }

    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    context.messages.forEach(msg => {
      sentimentCounts[msg.sentiment]++;
    });

    return {
      totalMessages: context.messages.length,
      userMessages: context.messages.filter(m => m.role === 'user').length,
      assistantMessages: context.messages.filter(m => m.role === 'assistant').length,
      topics: context.currentTopics,
      entities: Array.from(context.activeEntities.keys()),
      sentiment: sentimentCounts,
    };
  }

  /**
   * Initialize context for user
   */
  private async initializeContext(userId: string): Promise<void> {
    if (!this.contexts.has(userId)) {
      const context: ConversationContext = {
        userId,
        messages: [],
        currentTopics: [],
        lastInteraction: Date.now(),
        conversationSummary: '',
        activeEntities: new Map(),
      };
      this.contexts.set(userId, context);
      await this.saveContexts();
    }
  }

  // Persistence
  private async loadContexts(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('context_memory');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const userId in parsed) {
          const data = parsed[userId];
          data.activeEntities = new Map(Object.entries(data.activeEntities || {}));
          this.contexts.set(userId, data);
        }
      }
    } catch (error) {
      console.error('[ContextMemory] Error loading:', error);
    }
  }

  private async saveContexts(): Promise<void> {
    try {
      const toStore: any = {};
      this.contexts.forEach((context, userId) => {
        toStore[userId] = {
          ...context,
          activeEntities: Object.fromEntries(context.activeEntities),
        };
      });
      await AsyncStorage.setItem('context_memory', JSON.stringify(toStore));
    } catch (error) {
      console.error('[ContextMemory] Error saving:', error);
    }
  }
}

export default ContextMemoryService.getInstance();
