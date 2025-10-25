/**
 * ResponseVarietyService Tests
 * Tests anti-repetition and variety system
 */

import ResponseVarietyService from '../ResponseVarietyService';

describe('ResponseVarietyService', () => {
  const userId = 'test-user-variety';

  describe('Greeting Variety', () => {
    it('should return different greetings', async () => {
      const greetings = new Set<string>();
      
      // Get 10 greetings
      for (let i = 0; i < 10; i++) {
        const greeting = await ResponseVarietyService.getGreeting(userId, 'casual');
        greetings.add(greeting);
      }
      
      // Should have at least 5 different greetings
      expect(greetings.size).toBeGreaterThanOrEqual(5);
    });

    it('should support different greeting styles', async () => {
      const casual = await ResponseVarietyService.getGreeting(userId, 'casual');
      const formal = await ResponseVarietyService.getGreeting(userId, 'formal');
      
      expect(casual).toBeTruthy();
      expect(formal).toBeTruthy();
      // They should be different styles
      expect(casual).not.toBe(formal);
    });
  });

  describe('Transition Variety', () => {
    it('should return different transitions', async () => {
      const transitions = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        const transition = await ResponseVarietyService.getTransition(userId);
        transitions.add(transition);
      }
      
      expect(transitions.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Response Diversification', () => {
    it('should make responses varied', async () => {
      const baseResponse = 'Hello! Let me help you. Here is the answer.';
      
      const varied = await ResponseVarietyService.makeVaried(userId, baseResponse);
      
      expect(varied).toBeTruthy();
      expect(typeof varied).toBe('string');
    });

    it('should add greetings and closings', async () => {
      const baseResponse = 'The answer is 42.';
      
      const diversified = await ResponseVarietyService.diversifyResponse(
        userId,
        baseResponse,
        { isFollowUp: false }
      );
      
      expect(diversified.length).toBeGreaterThan(baseResponse.length);
    });
  });

  describe('Variety Stats', () => {
    it('should track phrase usage', async () => {
      await ResponseVarietyService.getGreeting(userId);
      await ResponseVarietyService.getGreeting(userId);
      await ResponseVarietyService.getGreeting(userId);
      
      const stats = ResponseVarietyService.getVarietyStats(userId);
      
      expect(stats.uniquePhrases).toBeGreaterThan(0);
      expect(stats.conversationLength).toBeGreaterThan(0);
    });
  });

  describe('Anti-Repetition', () => {
    it('should avoid recently used phrases', async () => {
      const firstGreeting = await ResponseVarietyService.getGreeting(userId, 'casual');
      const secondGreeting = await ResponseVarietyService.getGreeting(userId, 'casual');
      const thirdGreeting = await ResponseVarietyService.getGreeting(userId, 'casual');
      
      // Within first few calls, should see variety
      const unique = new Set([firstGreeting, secondGreeting, thirdGreeting]);
      expect(unique.size).toBeGreaterThanOrEqual(2);
    });
  });
});
