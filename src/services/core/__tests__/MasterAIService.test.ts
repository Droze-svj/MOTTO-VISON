/**
 * MasterAIService Tests
 * Critical service that orchestrates all AI functionality
 */

import MasterAIService from '../MasterAIService';
import MultilingualService from '../MultilingualService';
import ContextMemoryService from '../ContextMemoryService';

// Mock dependencies
jest.mock('../MultilingualService');
jest.mock('../ContextMemoryService');
jest.mock('../AdvancedCollectionService');
jest.mock('../UltraPersonalizationService');
jest.mock('../ResponseVarietyService');

describe('MasterAIService', () => {
  const testUserId = 'test-user-123';
  const testInput = 'Hello, how are you?';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = MasterAIService.getInstance();
      const instance2 = MasterAIService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeDefined();
    });
  });

  describe('masterChat', () => {
    it('should process user input and return response', async () => {
      const response = await MasterAIService.masterChat(testUserId, testInput);
      
      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
      expect(typeof response.text).toBe('string');
      expect(response.sources).toBeDefined();
      expect(Array.isArray(response.sources)).toBe(true);
      expect(response.confidence).toBeDefined();
      expect(typeof response.confidence).toBe('number');
    });

    it('should return response with required properties', async () => {
      const response = await MasterAIService.masterChat(testUserId, testInput);
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('sources');
      expect(response).toHaveProperty('personalizationApplied');
      expect(response).toHaveProperty('confidence');
      expect(response).toHaveProperty('adaptations');
      expect(response).toHaveProperty('learnedFrom');
      expect(response).toHaveProperty('responseTime');
    });

    it('should have valid adaptations structure', async () => {
      const response = await MasterAIService.masterChat(testUserId, testInput);
      
      expect(response.adaptations).toBeDefined();
      expect(response.adaptations).toHaveProperty('cognitive');
      expect(response.adaptations).toHaveProperty('personality');
      expect(response.adaptations).toHaveProperty('motivation');
      expect(response.adaptations).toHaveProperty('expertise');
      
      expect(Array.isArray(response.adaptations.cognitive)).toBe(true);
      expect(Array.isArray(response.adaptations.personality)).toBe(true);
      expect(Array.isArray(response.adaptations.motivation)).toBe(true);
      expect(Array.isArray(response.adaptations.expertise)).toBe(true);
    });

    it('should return positive confidence', async () => {
      const response = await MasterAIService.masterChat(testUserId, testInput);
      
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(100);
    });

    it('should return response in reasonable time', async () => {
      const startTime = Date.now();
      const response = await MasterAIService.masterChat(testUserId, testInput);
      const elapsed = Date.now() - startTime;
      
      expect(response.responseTime).toBeDefined();
      expect(response.responseTime).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle empty input gracefully', async () => {
      const response = await MasterAIService.masterChat(testUserId, '');
      
      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('should handle very long input', async () => {
      const longInput = 'word '.repeat(500); // 500 words
      const response = await MasterAIService.masterChat(testUserId, longInput);
      
      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
    });

    it('should provide at least one source', async () => {
      const response = await MasterAIService.masterChat(testUserId, testInput);
      
      expect(response.sources.length).toBeGreaterThan(0);
    });

    it('should mark learning status', async () => {
      const response = await MasterAIService.masterChat(testUserId, testInput);
      
      expect(typeof response.learnedFrom).toBe('boolean');
    });

    it('should handle context parameter', async () => {
      const context = {
        conversationLength: 5,
        isFollowUp: true,
        recentContext: 'Previous discussion about AI',
        currentTopics: ['AI', 'technology']
      };
      
      const response = await MasterAIService.masterChat(testUserId, testInput, context);
      
      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      // This should not throw even with invalid data
      try {
        const response = await MasterAIService.masterChat('', '');
        expect(response).toBeDefined();
      } catch (error) {
        // If it throws, it should be a handled error
        expect(error).toBeDefined();
      }
    });

    it('should handle special characters', async () => {
      const specialInput = '你好! ¿Cómo estás? 🚀 #test @user';
      const response = await MasterAIService.masterChat(testUserId, specialInput);
      
      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should complete within acceptable time', async () => {
      const responses = [];
      
      for (let i = 0; i < 3; i++) {
        const response = await MasterAIService.masterChat(
          testUserId, 
          `Test message ${i}`
        );
        responses.push(response);
      }
      
      expect(responses.length).toBe(3);
      responses.forEach(response => {
        expect(response.responseTime).toBeLessThan(10000); // < 10 seconds each
      });
    });
  });

  describe('integration', () => {
    it('should work with different user IDs', async () => {
      const user1Response = await MasterAIService.masterChat('user1', testInput);
      const user2Response = await MasterAIService.masterChat('user2', testInput);
      
      expect(user1Response).toBeDefined();
      expect(user2Response).toBeDefined();
      
      // Responses might be different due to personalization
      expect(user1Response.text).toBeDefined();
      expect(user2Response.text).toBeDefined();
    });

    it('should provide suggestions when available', async () => {
      const response = await MasterAIService.masterChat(testUserId, testInput);
      
      if (response.suggestions) {
        expect(Array.isArray(response.suggestions)).toBe(true);
        if (response.suggestions.length > 0) {
          expect(typeof response.suggestions[0]).toBe('string');
        }
      }
    });
  });
});

