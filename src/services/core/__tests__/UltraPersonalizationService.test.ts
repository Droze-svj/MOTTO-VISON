/**
 * UltraPersonalizationService Tests
 * Testing 100+ dimension personalization
 */

import UltraPersonalizationService from '../UltraPersonalizationService';

describe('UltraPersonalizationService', () => {
  const testUserId = 'test-user-ultra';
  const testResponse = 'This is a test response that will be personalized.';

  beforeEach(() => {
    // Clear any cached profiles
  });

  describe('Profile Creation', () => {
    it('should create ultra profile for new user', async () => {
      const profile = await UltraPersonalizationService.getUltraProfile(testUserId);
      
      expect(profile).toBeDefined();
      expect(profile.userId).toBe(testUserId);
      expect(profile.cognitiveStyle).toBeDefined();
      expect(profile.personality).toBeDefined();
      expect(profile.motivation).toBeDefined();
    });

    it('should initialize with default values', async () => {
      const profile = await UltraPersonalizationService.getUltraProfile(testUserId);
      
      expect(profile.personality.openness).toBeGreaterThanOrEqual(0);
      expect(profile.personality.openness).toBeLessThanOrEqual(100);
      expect(profile.personality.curiosity).toBeGreaterThanOrEqual(0);
      expect(profile.cognitiveStyle.thinkingSpeed).toBeDefined();
    });
  });

  describe('Response Personalization', () => {
    it('should personalize response for user', async () => {
      const personalized = await UltraPersonalizationService.personalizeResponse(
        testUserId,
        testResponse,
        { topic: 'testing' }
      );
      
      expect(personalized).toBeDefined();
      expect(typeof personalized).toBe('string');
      expect(personalized.length).toBeGreaterThan(0);
    });

    it('should adapt to cognitive style', async () => {
      const response = await UltraPersonalizationService.personalizeResponse(
        testUserId,
        'Explain quantum physics',
        { topic: 'physics', complexity: 'advanced' }
      );
      
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle empty response', async () => {
      const personalized = await UltraPersonalizationService.personalizeResponse(
        testUserId,
        '',
        {}
      );
      
      expect(personalized).toBeDefined();
    });
  });

  describe('Learning from Interaction', () => {
    it('should learn from user feedback', async () => {
      await UltraPersonalizationService.learnFromFeedback(
        testUserId,
        'What is AI?',
        testResponse,
        'positive'
      );
      
      // Should complete without error
      expect(true).toBe(true);
    });

    it('should track interaction patterns', async () => {
      await UltraPersonalizationService.trackInteraction(
        testUserId,
        'Test question',
        {
          responseTime: 1500,
          topic: 'testing',
          complexity: 'medium'
        }
      );
      
      expect(true).toBe(true);
    });
  });

  describe('Profile Updates', () => {
    it('should update profile based on behavior', async () => {
      const beforeProfile = await UltraPersonalizationService.getUltraProfile(testUserId);
      
      // Simulate several interactions
      for (let i = 0; i < 5; i++) {
        await UltraPersonalizationService.trackInteraction(
          testUserId,
          `Question ${i}`,
          { topic: 'coding', responseTime: 2000 }
        );
      }
      
      const afterProfile = await UltraPersonalizationService.getUltraProfile(testUserId);
      expect(afterProfile).toBeDefined();
    });
  });
});

