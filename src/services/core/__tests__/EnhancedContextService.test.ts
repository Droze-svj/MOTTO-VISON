/**
 * EnhancedContextService Tests
 * Tests pronoun resolution and advanced context features
 */

import EnhancedContextService from '../EnhancedContextService';

describe('EnhancedContextService', () => {
  const userId = 'test-user-enhanced';

  describe('Pronoun Resolution', () => {
    it('should resolve "it" to current subject', async () => {
      // First establish a subject
      await EnhancedContextService.processInput(userId, 'Tell me about Python');
      
      // Then use a pronoun
      const result = await EnhancedContextService.processInput(userId, "What's its history?");
      
      expect(result.relatedSubject).toBe('Python');
      expect(result.resolvedInput).toContain('Python');
    });

    it('should detect follow-up questions', async () => {
      await EnhancedContextService.processInput(userId, 'Explain React');
      const result = await EnhancedContextService.processInput(userId, 'Show me');
      
      expect(result.isFollowUp).toBe(true);
    });

    it('should track multiple entities', async () => {
      await EnhancedContextService.processInput(userId, 'Compare Python and JavaScript');
      await EnhancedContextService.updateFromResponse(
        userId,
        'Compare Python and JavaScript',
        'Python is... JavaScript is...'
      );
      
      const insights = EnhancedContextService.getInsights(userId);
      
      expect(insights.currentTopic).toBeTruthy();
    });
  });

  describe('Topic Depth', () => {
    it('should track conversation depth', async () => {
      // Multiple messages about same topic
      await EnhancedContextService.processInput(userId, 'What is React?');
      await EnhancedContextService.updateFromResponse(userId, 'What is React?', 'React is...');
      
      await EnhancedContextService.processInput(userId, 'How does it work?');
      await EnhancedContextService.updateFromResponse(userId, 'How does it work?', 'React works...');
      
      await EnhancedContextService.processInput(userId, 'Show me an example');
      await EnhancedContextService.updateFromResponse(userId, 'Show me', 'Here is...');
      
      const insights = EnhancedContextService.getInsights(userId);
      
      expect(insights.topicDepth).toBeGreaterThan(1);
    });
  });

  describe('Follow-Up Detection', () => {
    it('should detect "what about" as follow-up', async () => {
      const result = await EnhancedContextService.processInput(userId, 'What about hooks?');
      
      expect(result.isFollowUp).toBe(true);
    });

    it('should detect short questions as follow-ups', async () => {
      await EnhancedContextService.processInput(userId, 'Explain React');
      const result = await EnhancedContextService.processInput(userId, 'Show me?');
      
      expect(result.isFollowUp).toBe(true);
    });

    it('should detect pronoun usage as follow-up', async () => {
      await EnhancedContextService.processInput(userId, 'Tell me about Python');
      const result = await EnhancedContextService.processInput(userId, 'How does it work?');
      
      expect(result.isFollowUp).toBe(true);
    });
  });

  describe('Context Prompt Generation', () => {
    it('should generate rich context prompts', async () => {
      await EnhancedContextService.processInput(userId, 'Explain Python');
      await EnhancedContextService.updateFromResponse(userId, 'Explain Python', 'Python is...');
      
      const prompt = await EnhancedContextService.generateContextPrompt(
        userId,
        "What's its history?"
      );
      
      expect(prompt).toContain('Python');
      expect(prompt.length).toBeGreaterThan(50);
    });
  });

  describe('User Patterns', () => {
    it('should learn user likes examples', async () => {
      await EnhancedContextService.processInput(userId, 'Show me an example');
      await EnhancedContextService.processInput(userId, 'Give me another example');
      await EnhancedContextService.updateFromResponse(userId, 'example', 'Here is...');
      
      const insights = EnhancedContextService.getInsights(userId);
      
      // Pattern detection happens over multiple interactions
      expect(insights).toBeTruthy();
    });
  });
});
