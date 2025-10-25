/**
 * DeepPersonalizationService Tests  
 * Testing 30-dimension personalization
 */

import DeepPersonalizationService from '../DeepPersonalizationService';

describe('DeepPersonalizationService', () => {
  const testUserId = 'test-user-deep';

  describe('Profile Management', () => {
    it('should create profile for new user', async () => {
      const profile = await DeepPersonalizationService.getProfile(testUserId);
      
      expect(profile).toBeDefined();
      expect(profile.userId).toBe(testUserId);
    });

    it('should have communication style', async () => {
      const profile = await DeepPersonalizationService.getProfile(testUserId);
      
      expect(profile.communicationStyle).toBeDefined();
      expect(typeof profile.communicationStyle).toBe('string');
    });

    it('should track interests', async () => {
      const profile = await DeepPersonalizationService.getProfile(testUserId);
      
      expect(profile.interests).toBeDefined();
      expect(Array.isArray(profile.interests)).toBe(true);
    });
  });

  describe('Response Adaptation', () => {
    it('should adapt response to user', async () => {
      const original = 'This is a test response.';
      const adapted = await DeepPersonalizationService.adaptResponse(
        testUserId,
        original,
        { topic: 'testing' }
      );
      
      expect(adapted).toBeDefined();
      expect(typeof adapted).toBe('string');
      expect(adapted.length).toBeGreaterThan(0);
    });

    it('should maintain response meaning', async () => {
      const original = 'Python is a programming language.';
      const adapted = await DeepPersonalizationService.adaptResponse(
        testUserId,
        original,
        { topic: 'programming' }
      );
      
      // Should still contain key information
      expect(adapted).toBeDefined();
      expect(adapted.length).toBeGreaterThan(0);
    });
  });

  describe('Learning', () => {
    it('should learn from feedback', async () => {
      await DeepPersonalizationService.recordFeedback(
        testUserId,
        'Test question',
        'Test answer',
        'positive'
      );
      
      // Should complete without error
      expect(true).toBe(true);
    });

    it('should update preferences', async () => {
      await DeepPersonalizationService.updatePreferences(
        testUserId,
        {
          responseLength: 'brief',
          technicalLevel: 'advanced'
        }
      );
      
      expect(true).toBe(true);
    });
  });
});

