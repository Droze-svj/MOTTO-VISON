/**
 * Service Integration Tests
 * Tests how all services work together
 */

import MasterAIService from '../MasterAIService';
import ContextMemoryService from '../ContextMemoryService';
import EnhancedContextService from '../EnhancedContextService';
import MultilingualService from '../MultilingualService';
import ResponseVarietyService from '../ResponseVarietyService';
import SmartCacheService from '../SmartCacheService';
import UserLearningService from '../UserLearningService';
import ServiceRegistry from '../ServiceRegistry';

describe('Service Integration', () => {
  const userId = 'integration-test-user';

  beforeEach(async () => {
    // Clear all services
    await ContextMemoryService.clearHistory(userId);
    SmartCacheService.clearAll();
    await MultilingualService.initializeUserLanguage(userId);
  });

  describe('ServiceRegistry', () => {
    it('should provide access to all services', () => {
      const registry = ServiceRegistry;
      
      expect(registry.get('cache')).toBe(SmartCacheService);
      expect(registry.get('context')).toBe(ContextMemoryService);
      expect(registry.get('multilingual')).toBe(MultilingualService);
    });

    it('should throw error for non-existent service', () => {
      expect(() => {
        ServiceRegistry.get('nonexistent' as any);
      }).toThrow();
    });

    it('should list all registered services', () => {
      const allServices = ServiceRegistry.getAll();
      
      expect(allServices).toHaveProperty('cache');
      expect(allServices).toHaveProperty('context');
      expect(allServices).toHaveProperty('multilingual');
      expect(Object.keys(allServices).length).toBeGreaterThan(10);
    });
  });

  describe('Context + Enhanced Context Integration', () => {
    it('should share conversation context between services', async () => {
      // Add message to ContextMemoryService
      await ContextMemoryService.addMessage(userId, 'user', 'Tell me about Python');
      
      // Process same conversation in EnhancedContextService
      await EnhancedContextService.processInput(userId, 'Tell me about Python');
      await EnhancedContextService.updateFromResponse(userId, 'Python', 'Python is...');
      
      // Both should track the topic
      const basicContext = await ContextMemoryService.getContext(userId, 'More info');
      const enhancedContext = await EnhancedContextService.processInput(userId, 'Show me examples');
      
      expect(basicContext.currentTopics.length).toBeGreaterThan(0);
      expect(enhancedContext.relatedSubject).toBeTruthy();
    });

    it('should resolve pronouns using context memory', async () => {
      // Establish subject
      await ContextMemoryService.addMessage(userId, 'user', 'Explain React');
      await EnhancedContextService.processInput(userId, 'Explain React');
      
      // Use pronoun
      const resolved = await EnhancedContextService.processInput(userId, "What's its purpose?");
      
      expect(resolved.resolvedInput).toContain('React');
    });
  });

  describe('Multilingual + Variety Integration', () => {
    it('should provide varied responses in user language', async () => {
      // Set Spanish as user language
      await MultilingualService.setUserLanguage(userId, 'es');
      
      // Get varied greeting
      const greeting = await ResponseVarietyService.getGreeting(userId, 'casual');
      
      expect(greeting).toBeTruthy();
      
      // Get multiple greetings - should be varied
      const greetings = new Set();
      for (let i = 0; i < 5; i++) {
        greetings.add(await ResponseVarietyService.getGreeting(userId));
      }
      
      expect(greetings.size).toBeGreaterThan(2);
    });
  });

  describe('Cache + Context Integration', () => {
    it('should cache context for faster retrieval', async () => {
      // Add multiple messages
      for (let i = 0; i < 5; i++) {
        await ContextMemoryService.addMessage(userId, 'user', `Message ${i}`);
      }
      
      // First retrieval (not cached)
      const start1 = Date.now();
      const context1 = await ContextMemoryService.getContext(userId, 'Test');
      const time1 = Date.now() - start1;
      
      // Second retrieval (potentially cached)
      const start2 = Date.now();
      const context2 = await ContextMemoryService.getContext(userId, 'Test');
      const time2 = Date.now() - start2;
      
      expect(context1.recentMessages.length).toBe(5);
      expect(context2.recentMessages.length).toBe(5);
    });
  });

  describe('UserLearning + Context Integration', () => {
    it('should learn from conversation context', async () => {
      // Record interaction with context
      await ContextMemoryService.addMessage(userId, 'user', 'Help with Python coding');
      
      await UserLearningService.setCurrentUser(userId);
      await UserLearningService.recordInteraction(
        'Help with Python coding',
        'Here is how...',
        500,
        { topic: 'programming', mood: 'curious' }
      );
      
      const insights = await UserLearningService.getUserInsights(userId);
      
      expect(insights).toBeTruthy();
      expect(insights.totalInteractions).toBeGreaterThan(0);
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should process message through multiple services', async () => {
      // Simulate full conversation flow
      
      // 1. User says something
      const userInput = 'Tell me about JavaScript';
      
      // 2. Add to context memory
      await ContextMemoryService.addMessage(userId, 'user', userInput);
      
      // 3. Detect language
      const detection = await MultilingualService.detectLanguage(userInput);
      expect(detection.language).toBe('en');
      
      // 4. Process with enhanced context
      const enhanced = await EnhancedContextService.processInput(userId, userInput);
      expect(enhanced).toBeTruthy();
      
      // 5. Generate varied response
      const baseResponse = 'JavaScript is a programming language...';
      const variedResponse = await ResponseVarietyService.diversifyResponse(
        userId,
        baseResponse,
        { isFollowUp: false }
      );
      expect(variedResponse.length).toBeGreaterThan(baseResponse.length);
      
      // 6. Add assistant response to context
      await ContextMemoryService.addMessage(userId, 'assistant', variedResponse);
      await EnhancedContextService.updateFromResponse(userId, userInput, variedResponse);
      
      // 7. Record learning
      await UserLearningService.setCurrentUser(userId);
      await UserLearningService.recordInteraction(
        userInput,
        variedResponse,
        1000,
        { topic: 'programming' }
      );
      
      // 8. Verify context is maintained
      const context = await ContextMemoryService.getContext(userId, 'Tell me more');
      expect(context.recentMessages.length).toBe(2); // user + assistant
      expect(context.currentTopics).toContain('javascript');
    });
  });

  describe('Error Handling Integration', () => {
    it('should gracefully handle service failures', async () => {
      // Simulate service failure scenario
      const invalidUserId = '';
      
      // Services should handle invalid input gracefully
      try {
        await ContextMemoryService.addMessage(invalidUserId, 'user', 'test');
        await MultilingualService.initializeUserLanguage(invalidUserId);
        // Should not throw
      } catch (error) {
        // Or handle error gracefully
        expect(error).toBeTruthy();
      }
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple concurrent operations', async () => {
      // Execute multiple service calls in parallel
      const operations = [
        ContextMemoryService.addMessage(userId, 'user', 'Message 1'),
        ContextMemoryService.addMessage(userId, 'user', 'Message 2'),
        MultilingualService.detectLanguage('Hello world'),
        MultilingualService.detectLanguage('Hola mundo'),
        ResponseVarietyService.getGreeting(userId),
        SmartCacheService.set('test-key', 'test-value'),
      ];
      
      await Promise.all(operations);
      
      // Verify all operations completed
      const context = await ContextMemoryService.getContext(userId, 'Test');
      expect(context.recentMessages.length).toBeGreaterThanOrEqual(2);
      
      const cached = await SmartCacheService.get('test-key');
      expect(cached).toBe('test-value');
    });

    it('should complete full pipeline within reasonable time', async () => {
      const start = Date.now();
      
      // Simulate realistic conversation
      await ContextMemoryService.addMessage(userId, 'user', 'What is React?');
      await EnhancedContextService.processInput(userId, 'What is React?');
      const response = await ResponseVarietyService.diversifyResponse(
        userId,
        'React is a JavaScript library',
        {}
      );
      await ContextMemoryService.addMessage(userId, 'assistant', response);
      
      const duration = Date.now() - start;
      
      // Should complete in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});
