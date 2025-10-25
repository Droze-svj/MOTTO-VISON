/**
 * React Hook for Master AI Service
 * Provides easy access to complete AI capabilities
 */

import { useState, useCallback, useEffect } from 'react';
import MasterAIService from '../services/core/MasterAIService';
import ContextMemoryService from '../services/core/ContextMemoryService';

interface MasterResponse {
  text: string;
  sources: string[];
  personalizationApplied: string[];
  confidence: number;
  adaptations: any;
  learnedFrom: boolean;
  responseTime: number;
  suggestions?: string[];
}

interface UseMasterAIReturn {
  chat: (userInput: string, context?: any) => Promise<MasterResponse | null>;
  isLoading: boolean;
  error: string | null;
  lastResponse: MasterResponse | null;
  clearError: () => void;
  getConversationContext: () => Promise<any>;
}

export const useMasterAI = (userId: string): UseMasterAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<MasterResponse | null>(null);

  const chat = useCallback(async (
    userInput: string,
    context?: any
  ): Promise<MasterResponse | null> => {
    if (!userInput.trim()) {
      setError('Please enter a message');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get conversation context
      const conversationContext = await ContextMemoryService.getContext(userId, userInput);

      // Merge with provided context
      const fullContext = {
        ...context,
        recentContext: conversationContext.relevantContext,
        currentTopics: conversationContext.currentTopics,
        conversationLength: conversationContext.recentMessages.length,
      };

      // Call Master AI
      const response = await MasterAIService.masterChat(userId, userInput, fullContext);

      setLastResponse(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while processing your request';
      setError(errorMessage);
      console.error('[useMasterAI] Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const getConversationContext = useCallback(async () => {
    try {
      return await ContextMemoryService.getContext(userId, '');
    } catch (err) {
      console.error('[useMasterAI] Context error:', err);
      return null;
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    chat,
    isLoading,
    error,
    lastResponse,
    clearError,
    getConversationContext,
  };
};

export default useMasterAI;
