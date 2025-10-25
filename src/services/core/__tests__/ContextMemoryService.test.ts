/**
 * ContextMemoryService Tests
 * Tests conversation memory and context tracking
 */

import ContextMemoryService from '../ContextMemoryService';

describe('ContextMemoryService', () => {
  const userId = 'test-user-123';

  beforeEach(async () => {
    // Clear history before each test
    await ContextMemoryService.clearHistory(userId);
  });

  describe('Message Storage', () => {
    it('should add and retrieve messages', async () => {
      await ContextMemoryService.addMessage(userId, 'user', 'Hello');
      await ContextMemoryService.addMessage(userId, 'assistant', 'Hi there!');
      
      const context = await ContextMemoryService.getContext(userId, 'New message');
      
      expect(context.recentMessages).toHaveLength(2);
      expect(context.recentMessages[0].content).toBe('Hello');
      expect(context.recentMessages[1].content).toBe('Hi there!');
    });

    it('should limit messages to MAX_MESSAGES', async () => {
      // Add 25 messages (more than limit of 20)
      for (let i = 0; i < 25; i++) {
        await ContextMemoryService.addMessage(userId, 'user', `Message ${i}`);
      }
      
      const context = await ContextMemoryService.getContext(userId, 'Test');
      
      // Should only keep last 20 (or limit set in service)
      expect(context.recentMessages.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Topic Extraction', () => {
    it('should extract topics from messages', async () => {
      await ContextMemoryService.addMessage(
        userId,
        'user',
        'Tell me about Python programming'
      );
      
      const context = await ContextMemoryService.getContext(userId, 'More info');
      
      expect(context.currentTopics).toContain('programming');
    });

    it('should track multiple topics', async () => {
      await ContextMemoryService.addMessage(userId, 'user', 'Learn React');
      await ContextMemoryService.addMessage(userId, 'assistant', 'React is...');
      await ContextMemoryService.addMessage(userId, 'user', 'And JavaScript?');
      
      const context = await ContextMemoryService.getContext(userId, 'Test');
      
      expect(context.currentTopics.length).toBeGreaterThan(0);
    });
  });

  describe('Entity Extraction', () => {
    it('should extract entities from text', async () => {
      await ContextMemoryService.addMessage(
        userId,
        'user',
        'Tell me about Python and React'
      );
      
      const context = await ContextMemoryService.getContext(userId, 'More');
      
      expect(context.recentMessages[0].entities).toContain('Python');
      expect(context.recentMessages[0].entities).toContain('React');
    });
  });

  describe('Sentiment Detection', () => {
    it('should detect positive sentiment', async () => {
      await ContextMemoryService.addMessage(
        userId,
        'user',
        'Thank you! This is great and wonderful!'
      );
      
      const context = await ContextMemoryService.getContext(userId, 'Test');
      
      expect(context.recentMessages[0].sentiment).toBe('positive');
    });

    it('should detect negative sentiment', async () => {
      await ContextMemoryService.addMessage(
        userId,
        'user',
        'This is terrible and I hate it'
      );
      
      const context = await ContextMemoryService.getContext(userId, 'Test');
      
      expect(context.recentMessages[0].sentiment).toBe('negative');
    });

    it('should detect neutral sentiment', async () => {
      await ContextMemoryService.addMessage(
        userId,
        'user',
        'What is the capital of France?'
      );
      
      const context = await ContextMemoryService.getContext(userId, 'Test');
      
      expect(context.recentMessages[0].sentiment).toBe('neutral');
    });
  });

  describe('Statistics', () => {
    it('should provide conversation statistics', async () => {
      await ContextMemoryService.addMessage(userId, 'user', 'Hello');
      await ContextMemoryService.addMessage(userId, 'assistant', 'Hi');
      await ContextMemoryService.addMessage(userId, 'user', 'How are you?');
      
      const stats = ContextMemoryService.getStats(userId);
      
      expect(stats.totalMessages).toBe(3);
      expect(stats.userMessages).toBe(2);
      expect(stats.assistantMessages).toBe(1);
    });
  });

  describe('Context Building', () => {
    it('should build relevant context string', async () => {
      await ContextMemoryService.addMessage(userId, 'user', 'Explain Python');
      await ContextMemoryService.addMessage(userId, 'assistant', 'Python is...');
      
      const context = await ContextMemoryService.getContext(
        userId,
        'Show me an example'
      );
      
      expect(context.relevantContext).toBeTruthy();
      expect(typeof context.relevantContext).toBe('string');
    });
  });
});
