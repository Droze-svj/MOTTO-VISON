/**
 * User Learning Hook
 * Access user learning and personalization features
 */

import {useState, useEffect, useCallback} from 'react';
import UserLearningService from '../services/core/UserLearningService';

interface UserInsights {
  totalInteractions: number;
  favoriteTopics: string[];
  communicationStyle: string;
  personalityTraits: string[];
  learningProgress: number;
  recommendations: string[];
}

export function useUserLearning() {
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      const userInsights = UserLearningService.getUserInsights();
      const topics = UserLearningService.getSuggestedTopics();
      
      setInsights(userInsights);
      setSuggestedTopics(topics);
    } catch (error) {
      console.error('Failed to load user insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordFeedback = useCallback(async (
    userInput: string,
    botResponse: string,
    reaction: 'positive' | 'negative' | 'neutral'
  ) => {
    await UserLearningService.recordInteraction(
      userInput,
      botResponse,
      0,
      {userReaction: reaction}
    );
    await loadInsights();
  }, [loadInsights]);

  const resetLearning = useCallback(async () => {
    await UserLearningService.resetLearning();
    await loadInsights();
  }, [loadInsights]);

  const exportData = useCallback(async (): Promise<string> => {
    return await UserLearningService.exportLearningData();
  }, []);

  const getSuggestions = useCallback((): string[] => {
    return UserLearningService.predictNextQuestion();
  }, []);

  return {
    insights,
    loading,
    suggestedTopics,
    recordFeedback,
    resetLearning,
    exportData,
    getSuggestions,
    refresh: loadInsights
  };
}
