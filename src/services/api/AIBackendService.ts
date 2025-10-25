/**
 * AI Backend Service
 * Connects to FastAPI backend for real AI responses
 */

import { APIClient, API_CONFIG } from '../../config/api';
import ErrorHandlingService from '../core/ErrorHandlingService';

interface ChatRequest {
  userId: string;
  message: string;
  context?: {
    conversationHistory?: any[];
    currentTopics?: string[];
    userProfile?: any;
  };
}

interface ChatResponse {
  response: string;
  sources?: string[];
  confidence?: number;
  metadata?: any;
}

class AIBackendService {
  private static instance: AIBackendService;

  private constructor() {
    console.log('[AI Backend] Service initialized');
  }

  static getInstance(): AIBackendService {
    if (!AIBackendService.instance) {
      AIBackendService.instance = new AIBackendService();
    }
    return AIBackendService.instance;
  }

  /**
   * Send chat message to backend
   */
  async chat(
    userId: string,
    message: string,
    context?: any
  ): Promise<ChatResponse> {
    try {
      const request: ChatRequest = {
        userId,
        message,
        context,
      };

      console.log('[AI Backend] Sending request:', message.substring(0, 50) + '...');

      const response = await APIClient.post<ChatResponse>(
        API_CONFIG.endpoints.chat,
        request
      );

      console.log('[AI Backend] Response received');
      return response;
    } catch (error: any) {
      console.error('[AI Backend] Chat error:', error);
      
      // Return fallback response
      return {
        response: "I'm having trouble connecting to my brain right now. Please try again in a moment! 🙏",
        sources: [],
        confidence: 0,
        metadata: { error: true, errorMessage: error.message },
      };
    }
  }

  /**
   * Chat with retry logic
   */
  async chatWithRetry(
    userId: string,
    message: string,
    context?: any,
    maxRetries: number = 3
  ): Promise<ChatResponse> {
    return await ErrorHandlingService.retryWithBackoff(
      async () => await this.chat(userId, message, context),
      maxRetries,
      1000
    ) as ChatResponse;
  }

  /**
   * Check if backend is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await APIClient.checkHealth();
    } catch (error) {
      console.error('[AI Backend] Health check failed:', error);
      return false;
    }
  }

  /**
   * Send feedback about response
   */
  async sendFeedback(
    userId: string,
    messageId: string,
    feedback: 'positive' | 'negative',
    comment?: string
  ): Promise<void> {
    try {
      await APIClient.post('/api/feedback', {
        userId,
        messageId,
        feedback,
        comment,
      });
      console.log('[AI Backend] Feedback sent');
    } catch (error) {
      console.error('[AI Backend] Feedback error:', error);
    }
  }
}

export default AIBackendService.getInstance();
