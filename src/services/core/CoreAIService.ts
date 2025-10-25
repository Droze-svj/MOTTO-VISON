/**
 * Core AI Service
 * Consolidates: AdvancedAIService, MLService, NLPService, AIEnhancementService,
 * AdvancedReasoningEngine, PromptEngineeringService, and 30+ AI-related services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import UserLearningService from './UserLearningService';

interface AIModel {
  name: string;
  endpoint: string;
  capabilities: string[];
}

interface ConversationContext {
  history: Array<{role: string; content: string}>;
  intent: string;
  sentiment: string;
  topics: string[];
}

interface AIConfig {
  apiKey?: string;
  baseURL: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}

export class CoreAIService {
  private static instance: CoreAIService;
  private config: AIConfig;
  private conversationMemory: Map<string, ConversationContext>;
  private learningPatterns: Map<string, any>;
  
  // AI Models
  private models = {
    primary: 'gpt-4-turbo-preview',
    reasoning: 'gpt-4',
    creative: 'gpt-4',
    coding: 'gpt-4',
    fast: 'gpt-3.5-turbo'
  };

  private constructor() {
    this.config = {
      baseURL: 'https://api.openai.com/v1',
      defaultModel: this.models.primary,
      temperature: 0.7,
      maxTokens: 2000
    };
    this.conversationMemory = new Map();
    this.learningPatterns = new Map();
  }

  static getInstance(): CoreAIService {
    if (!CoreAIService.instance) {
      CoreAIService.instance = new CoreAIService();
    }
    return CoreAIService.instance;
  }

  /**
   * Initialize AI service with configuration
   */
  async initialize(apiKey?: string): Promise<void> {
    if (apiKey) {
      this.config.apiKey = apiKey;
      await AsyncStorage.setItem('openai_api_key', apiKey);
    } else {
      const stored = await AsyncStorage.getItem('openai_api_key');
      if (stored) this.config.apiKey = stored;
    }
  }

  /**
   * Main chat completion method with adaptive learning
   */
  async chat(
    message: string,
    context?: ConversationContext,
    options?: Partial<AIConfig>
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      // Select optimal model based on intent
      const model = this.selectModel(context?.intent);
      
      // Build conversation history
      const messages = this.buildMessages(message, context);
      
      // Make API call
      const response = await this.callAI(messages, {
        ...this.config,
        ...options,
        defaultModel: model
      });

      // Adapt response based on user learning
      const adaptedResponse = await UserLearningService.adaptResponse(response, {
        topic: context?.topics?.[0],
        intent: context?.intent
      });

      // Record interaction for learning
      const responseTime = Date.now() - startTime;
      await UserLearningService.recordInteraction(
        message,
        adaptedResponse,
        responseTime,
        {
          topic: context?.topics?.[0],
          mood: context?.sentiment
        }
      );

      // Learn from interaction
      await this.learnFromInteraction(message, adaptedResponse, context);

      return adaptedResponse;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  /**
   * Intelligent model selection based on task
   */
  private selectModel(intent?: string): string {
    if (!intent) return this.models.primary;

    const intentMap: Record<string, string> = {
      'coding': this.models.coding,
      'creative': this.models.creative,
      'reasoning': this.models.reasoning,
      'quick': this.models.fast
    };

    return intentMap[intent.toLowerCase()] || this.models.primary;
  }

  /**
   * Build message array for API
   */
  private buildMessages(
    message: string,
    context?: ConversationContext
  ): Array<{role: string; content: string}> {
    const messages: Array<{role: string; content: string}> = [
      {
        role: 'system',
        content: this.getSystemPrompt(context)
      }
    ];

    // Add conversation history
    if (context?.history) {
      messages.push(...context.history.slice(-10)); // Last 10 messages
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    return messages;
  }

  /**
   * Generate system prompt based on context
   */
  private getSystemPrompt(context?: ConversationContext): string {
    let prompt = 'You are MOTTO, a helpful AI assistant. ';

    if (context?.topics && context.topics.length > 0) {
      prompt += `Current topics: ${context.topics.join(', ')}. `;
    }

    if (context?.sentiment) {
      prompt += `User sentiment: ${context.sentiment}. Adapt your tone accordingly. `;
    }

    prompt += 'Be concise, accurate, and helpful.';

    return prompt;
  }

  /**
   * Make API call to OpenAI or compatible endpoint
   */
  private async callAI(
    messages: Array<{role: string; content: string}>,
    config: AIConfig
  ): Promise<string> {
    if (!config.apiKey) {
      // Fallback to local processing
      return this.fallbackProcessing(messages);
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.defaultModel,
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  }

  /**
   * Fallback processing when API is unavailable
   */
  private fallbackProcessing(
    messages: Array<{role: string; content: string}>
  ): string {
    const userMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Simple pattern matching
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
      return 'Hello! How can I help you today?';
    }
    
    if (userMessage.includes('thank')) {
      return "You're welcome! Let me know if you need anything else.";
    }
    
    return "I'm processing your request. For full AI capabilities, please configure your OpenAI API key.";
  }

  /**
   * Learn from interactions to improve responses
   */
  private async learnFromInteraction(
    input: string,
    output: string,
    context?: ConversationContext
  ): Promise<void> {
    // Extract patterns
    const pattern = {
      input: input.toLowerCase(),
      intent: context?.intent,
      sentiment: context?.sentiment,
      timestamp: Date.now()
    };

    // Store in learning engine
    const key = context?.intent || 'general';
    const patterns = this.learningPatterns.get(key) || [];
    patterns.push(pattern);
    this.learningPatterns.set(key, patterns.slice(-100)); // Keep last 100

    // Persist learning data
    await AsyncStorage.setItem(
      'ai_learning_patterns',
      JSON.stringify(Array.from(this.learningPatterns.entries()))
    );
  }

  /**
   * Analyze text for intent, sentiment, entities
   */
  async analyzeText(text: string): Promise<{
    intent: string;
    sentiment: string;
    entities: string[];
    topics: string[];
  }> {
    // Simple rule-based analysis (can be enhanced with ML)
    const lowerText = text.toLowerCase();
    
    // Intent detection
    let intent = 'general';
    if (lowerText.includes('code') || lowerText.includes('program')) intent = 'coding';
    else if (lowerText.includes('create') || lowerText.includes('write')) intent = 'creative';
    else if (lowerText.includes('why') || lowerText.includes('how')) intent = 'reasoning';
    
    // Sentiment detection
    let sentiment = 'neutral';
    const positiveWords = ['good', 'great', 'awesome', 'thanks', 'love'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'worst'];
    
    if (positiveWords.some(word => lowerText.includes(word))) sentiment = 'positive';
    else if (negativeWords.some(word => lowerText.includes(word))) sentiment = 'negative';
    
    return {
      intent,
      sentiment,
      entities: [],
      topics: []
    };
  }

  /**
   * Generate embeddings for semantic search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      // Simple hash-based embedding for fallback
      return this.simpleEmbedding(text);
    }

    try {
      const response = await fetch(`${this.config.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text
        })
      });

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      return this.simpleEmbedding(text);
    }
  }

  /**
   * Simple embedding fallback
   */
  private simpleEmbedding(text: string): number[] {
    const embedding = new Array(384).fill(0);
    for (let i = 0; i < text.length; i++) {
      embedding[i % 384] += text.charCodeAt(i);
    }
    return embedding.map(v => v / text.length);
  }

  /**
   * Stream responses for real-time interaction
   */
  async *streamChat(
    message: string,
    context?: ConversationContext
  ): AsyncGenerator<string, void, unknown> {
    // For now, yield the complete response
    // In production, implement SSE streaming
    const response = await this.chat(message, context);
    yield response;
  }

  /**
   * Clear conversation memory
   */
  clearMemory(userId?: string): void {
    if (userId) {
      this.conversationMemory.delete(userId);
    } else {
      this.conversationMemory.clear();
    }
  }

  /**
   * Get service health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    apiConfigured: boolean;
    modelsAvailable: string[];
  }> {
    return {
      status: this.config.apiKey ? 'healthy' : 'degraded',
      apiConfigured: !!this.config.apiKey,
      modelsAvailable: Object.values(this.models)
    };
  }
}

// Export singleton instance
export default CoreAIService.getInstance();

