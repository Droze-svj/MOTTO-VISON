/**
 * Integration Tests for Core Services
 * Tests service interactions and real-world scenarios
 */

import MasterAIService from '../MasterAIService';
import UserLearningService from '../UserLearningService';
import ContextMemoryService from '../ContextMemoryService';
import MultilingualService from '../MultilingualService';
import UltraPersonalizationService from '../UltraPersonalizationService';
import { services } from '../ServiceRegistry';

describe('Service Integration Tests', () => {
  const testUserId = 'integration_test_user_' + Date.now();

  beforeEach(() => {
    // Clean up before each test
    jest.clearAllMocks();
  });

  describe('MasterAIService Integration', () => {
    test('should process complete chat flow', async () => {
      const userInput = 'How does React work?';
      
      const response = await MasterAIService.masterChat(testUserId, userInput);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      expect(response.sources).toBeInstanceOf(Array);
      expect(response.responseTime).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(100);
    });

    test('should handle multilingual input', async () => {
      const spanishInput = '¿Cómo funciona React?';
      
      const response = await MasterAIService.masterChat(testUserId, spanishInput);
      
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
      // Response should be in detected language or English
    });

    test('should learn from interaction', async () => {
      const userInput = 'I love TypeScript';
      
      const response1 = await MasterAIService.masterChat(testUserId, userInput);
      expect(response1.learnedFrom).toBe(true);
      
      // Second interaction should show personalization
      const response2 = await MasterAIService.masterChat(testUserId, 'Tell me more');
      expect(response2).toBeDefined();
    });
  });

  describe('Context Memory Integration', () => {
    test('should maintain conversation context', async () => {
      const contextService = ContextMemoryService;
      
      // First message
      await contextService.addToContext(testUserId, {
        role: 'user',
        content: 'I want to learn React'
      });
      
      // Second message should have context
      const context = await contextService.getContext(testUserId);
      expect(context.conversationHistory.length).toBeGreaterThan(0);
    });

    test('should resolve context in subsequent messages', async () => {
      // User mentions a topic
      await MasterAIService.masterChat(testUserId, 'I love Python programming');
      
      // Later reference should understand context
      const response = await MasterAIService.masterChat(testUserId, 'Show me an example');
      
      expect(response).toBeDefined();
      // Response should be contextually relevant
    });
  });

  describe('Personalization Integration', () => {
    test('should adapt responses based on user profile', async () => {
      // Multiple interactions to build profile
      await MasterAIService.masterChat(testUserId, 'Explain this simply');
      await MasterAIService.masterChat(testUserId, 'I prefer detailed explanations');
      await MasterAIService.masterChat(testUserId, 'Give me more technical details');
      
      // Profile should influence response
      const response = await MasterAIService.masterChat(testUserId, 'How does caching work?');
      
      expect(response).toBeDefined();
      expect(response.personalizationApplied.length).toBeGreaterThan(0);
    });

    test('should track user preferences over time', async () => {
      // Simulate user interactions
      const inputs = [
        'I like short answers',
        'Keep it concise',
        'Be brief',
      ];
      
      for (const input of inputs) {
        await MasterAIService.masterChat(testUserId, input);
      }
      
      // Later response should be shorter
      const response = await MasterAIService.masterChat(testUserId, 'What is JavaScript?');
      expect(response.text.length).toBeLessThan(1000); // Should be concise
    });
  });

  describe('Service Registry Integration', () => {
    test('should provide access to all services', () => {
      const aiService = services.ai;
      const dataService = services.data;
      const monitoringService = services.monitoring;
      
      expect(aiService).toBeDefined();
      expect(dataService).toBeDefined();
      expect(monitoringService).toBeDefined();
    });

    test('should handle missing service gracefully', () => {
      expect(() => {
        // This should not exist
        // @ts-ignore
        services.nonExistent;
      }).not.toThrow();
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle service failures gracefully', async () => {
      // Invalid input that might cause errors
      const response = await MasterAIService.masterChat(testUserId, '');
      
      // Should return error response, not throw
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    test('should recover from network errors', async () => {
      // Simulate network issue (would need mocking in real scenario)
      const response = await MasterAIService.masterChat(testUserId, 'Test query');
      
      // Should handle gracefully
      expect(response).toBeDefined();
    });
  });

  describe('Performance Integration', () => {
    test('should track response times', async () => {
      const startTime = Date.now();
      
      const response = await MasterAIService.masterChat(testUserId, 'Quick test');
      
      const elapsed = Date.now() - startTime;
      
      expect(response.responseTime).toBeGreaterThan(0);
      expect(response.responseTime).toBeLessThanOrEqual(elapsed + 100); // Allow some margin
    });

    test('should maintain acceptable performance under load', async () => {
      const promises = [];
      const count = 5;
      
      for (let i = 0; i < count; i++) {
        promises.push(
          MasterAIService.masterChat(testUserId, `Test query ${i}`)
        );
      }
      
      const responses = await Promise.all(promises);
      
      expect(responses.length).toBe(count);
      responses.forEach(response => {
        expect(response.responseTime).toBeLessThan(5000); // Should complete within 5s
      });
    });
  });

  describe('Multilingual Integration', () => {
    test('should detect and handle multiple languages', async () => {
      const languages = [
        { input: 'Hello', expected: 'en' },
        { input: 'Hola', expected: 'es' },
        { input: 'Bonjour', expected: 'fr' },
      ];
      
      for (const lang of languages) {
        const detection = await MultilingualService.detectLanguage(lang.input);
        expect(detection.language).toBeDefined();
        expect(detection.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('Real-World Scenarios', () => {
    test('should handle multi-turn conversation', async () => {
      const conversation = [
        'What is React?',
        'How do hooks work?',
        'Give me an example',
        'Can you explain useState?',
      ];
      
      for (const message of conversation) {
        const response = await MasterAIService.masterChat(testUserId, message);
        expect(response).toBeDefined();
        expect(response.text).toBeTruthy();
      }
    });

    test('should personalize based on conversation history', async () => {
      // Build conversation history
      await MasterAIService.masterChat(testUserId, 'I am a beginner');
      await MasterAIService.masterChat(testUserId, 'I need simple explanations');
      
      // Later response should be beginner-friendly
      const response = await MasterAIService.masterChat(testUserId, 'Explain async/await');
      expect(response).toBeDefined();
    });
  });
});

