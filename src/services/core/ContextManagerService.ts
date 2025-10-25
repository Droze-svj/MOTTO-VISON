/**
 * Context Manager Service
 * Manages conversation context and memory for better AI responses
 */

import {Message} from '../../types';
import DataService from './DataService';

interface ConversationSession {
  id: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  messages: Message[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  summary?: string;
}

interface ContextWindow {
  shortTerm: Message[];  // Last 10 messages
  mediumTerm: string[];  // Summaries of recent conversations
  longTerm: string[];    // Important facts and preferences
  entities: Map<string, any>;  // Extracted entities
}

export class ContextManagerService {
  private static instance: ContextManagerService;
  private currentSession: ConversationSession | null = null;
  private contextWindow: ContextWindow;
  private readonly STORAGE_PREFIX = 'context_';

  private constructor() {
    this.contextWindow = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      entities: new Map()
    };
  }

  static getInstance(): ContextManagerService {
    if (!ContextManagerService.instance) {
      ContextManagerService.instance = new ContextManagerService();
    }
    return ContextManagerService.instance;
  }

  // ============================================
  // Session Management
  // ============================================

  async startSession(userId: string): Promise<void> {
    this.currentSession = {
      id: `session_${Date.now()}`,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      messages: [],
      topics: [],
      sentiment: 'neutral'
    };

    // Load previous context
    await this.loadContext(userId);
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    // Generate session summary
    const summary = await this.generateSessionSummary();
    this.currentSession.summary = summary;

    // Save session
    await DataService.set(
      `${this.STORAGE_PREFIX}session_${this.currentSession.id}`,
      this.currentSession,
      {ttl: 7 * 24 * 60 * 60 * 1000} // 7 days
    );

    // Update medium-term memory
    if (summary) {
      this.contextWindow.mediumTerm.push(summary);
      if (this.contextWindow.mediumTerm.length > 10) {
        this.contextWindow.mediumTerm.shift();
      }
    }

    await this.saveContext();
    this.currentSession = null;
  }

  // ============================================
  // Message Processing
  // ============================================

  async addMessage(message: Message): Promise<void> {
    if (!this.currentSession) {
      await this.startSession('default');
    }

    // Add to session
    this.currentSession!.messages.push(message);
    this.currentSession!.lastActivity = Date.now();

    // Add to short-term memory
    this.contextWindow.shortTerm.push(message);
    if (this.contextWindow.shortTerm.length > 10) {
      const removed = this.contextWindow.shortTerm.shift();
      // Consider moving to medium-term if important
      if (removed && this.isImportant(removed)) {
        await this.extractToLongTerm(removed);
      }
    }

    // Extract entities
    await this.extractEntities(message);

    // Update topics
    const topics = this.extractTopics(message.text);
    topics.forEach(topic => {
      if (!this.currentSession!.topics.includes(topic)) {
        this.currentSession!.topics.push(topic);
      }
    });
  }

  // ============================================
  // Context Building
  // ============================================

  buildContextForAI(): {
    recentMessages: Message[];
    relevantContext: string[];
    userPreferences: string[];
    conversationSummary: string;
  } {
    const context = {
      recentMessages: this.contextWindow.shortTerm.slice(-5),
      relevantContext: this.contextWindow.mediumTerm,
      userPreferences: this.contextWindow.longTerm,
      conversationSummary: this.generateCurrentSummary()
    };

    return context;
  }

  private generateCurrentSummary(): string {
    if (!this.currentSession || this.currentSession.messages.length === 0) {
      return 'New conversation';
    }

    const duration = Date.now() - this.currentSession.startTime;
    const minutes = Math.floor(duration / 60000);
    
    return `Conversation for ${minutes} min about ${this.currentSession.topics.join(', ') || 'general topics'}. ${this.currentSession.messages.length} messages exchanged.`;
  }

  // ============================================
  // Entity Extraction
  // ============================================

  private async extractEntities(message: Message): Promise<void> {
    const text = message.text.toLowerCase();
    
    // Simple entity extraction (can be enhanced with NLP)
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      url: /https?:\/\/[^\s]+/g,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      date: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    };

    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        const existing = this.contextWindow.entities.get(type) || [];
        this.contextWindow.entities.set(type, [...existing, ...matches]);
      }
    });
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const keywords = {
      'coding': ['code', 'program', 'python', 'javascript', 'typescript', 'function'],
      'AI': ['ai', 'machine learning', 'neural', 'model', 'gpt'],
      'health': ['health', 'exercise', 'diet', 'fitness', 'medical'],
      'productivity': ['task', 'todo', 'organize', 'schedule', 'plan'],
      'creative': ['create', 'design', 'art', 'music', 'write']
    };

    const lowerText = text.toLowerCase();
    Object.entries(keywords).forEach(([topic, words]) => {
      if (words.some(word => lowerText.includes(word))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // ============================================
  // Importance & Summarization
  // ============================================

  private isImportant(message: Message): boolean {
    const text = message.text.toLowerCase();
    
    // Consider important if:
    // - Contains questions
    // - Long messages (>50 chars)
    // - Contains specific keywords
    const importantKeywords = ['remember', 'important', 'always', 'never', 'prefer', 'like', 'love', 'hate'];
    
    return (
      text.includes('?') ||
      text.length > 50 ||
      importantKeywords.some(kw => text.includes(kw))
    );
  }

  private async extractToLongTerm(message: Message): Promise<void> {
    // Extract key facts to long-term memory
    const fact = `User ${message.role === 'user' ? 'said' : 'was told'}: "${message.text.substring(0, 100)}"`;
    
    this.contextWindow.longTerm.push(fact);
    if (this.contextWindow.longTerm.length > 20) {
      this.contextWindow.longTerm.shift();
    }
  }

  private async generateSessionSummary(): Promise<string> {
    if (!this.currentSession || this.currentSession.messages.length === 0) {
      return '';
    }

    const topics = this.currentSession.topics.join(', ') || 'general';
    const messageCount = this.currentSession.messages.length;
    
    return `Discussed ${topics} (${messageCount} messages)`;
  }

  // ============================================
  // Persistence
  // ============================================

  private async saveContext(): Promise<void> {
    if (!this.currentSession) return;

    const contextData = {
      shortTerm: this.contextWindow.shortTerm.slice(-10),
      mediumTerm: this.contextWindow.mediumTerm,
      longTerm: this.contextWindow.longTerm,
      entities: Object.fromEntries(this.contextWindow.entities)
    };

    await DataService.set(
      `${this.STORAGE_PREFIX}${this.currentSession.userId}`,
      contextData,
      {ttl: 30 * 24 * 60 * 60 * 1000} // 30 days
    );
  }

  private async loadContext(userId: string): Promise<void> {
    const stored = await DataService.get<any>(`${this.STORAGE_PREFIX}${userId}`);
    
    if (stored) {
      this.contextWindow.shortTerm = stored.shortTerm || [];
      this.contextWindow.mediumTerm = stored.mediumTerm || [];
      this.contextWindow.longTerm = stored.longTerm || [];
      this.contextWindow.entities = new Map(Object.entries(stored.entities || {}));
    }
  }

  // ============================================
  // Public API
  // ============================================

  getRecentContext(): Message[] {
    return this.contextWindow.shortTerm.slice(-10);
  }

  getEntities(type?: string): any[] {
    if (type) {
      return this.contextWindow.entities.get(type) || [];
    }
    
    const all: any[] = [];
    this.contextWindow.entities.forEach(values => all.push(...values));
    return all;
  }

  getCurrentTopics(): string[] {
    return this.currentSession?.topics || [];
  }

  async clearContext(): Promise<void> {
    this.contextWindow = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      entities: new Map()
    };
    
    if (this.currentSession) {
      await DataService.remove(`${this.STORAGE_PREFIX}${this.currentSession.userId}`);
    }
  }
}

export default ContextManagerService.getInstance();

