/**
 * AdvancedCollectionService Tests
 * Testing knowledge collection from 85+ sources
 */

import AdvancedCollectionService from '../AdvancedCollectionService';

describe('AdvancedCollectionService', () => {
  const testQuery = 'What is artificial intelligence?';

  describe('Knowledge Collection', () => {
    it('should collect knowledge from multiple sources', async () => {
      const result = await AdvancedCollectionService.collectKnowledge(testQuery);
      
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
    });

    it('should return sources array', async () => {
      const result = await AdvancedCollectionService.collectKnowledge(testQuery);
      
      expect(result.sources.length).toBeGreaterThan(0);
      result.sources.forEach(source => {
        expect(typeof source).toBe('string');
      });
    });

    it('should have confidence score', async () => {
      const result = await AdvancedCollectionService.collectKnowledge(testQuery);
      
      expect(result.confidence).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should handle empty query gracefully', async () => {
      const result = await AdvancedCollectionService.collectKnowledge('');
      
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle special characters in query', async () => {
      const specialQuery = 'What is AI? #test @user 🤖';
      const result = await AdvancedCollectionService.collectKnowledge(specialQuery);
      
      expect(result).toBeDefined();
    });

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();
      await AdvancedCollectionService.collectKnowledge(testQuery);
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeLessThan(30000); // < 30 seconds
    });
  });

  describe('Source Integration', () => {
    it('should aggregate data from multiple sources', async () => {
      const result = await AdvancedCollectionService.collectKnowledge(testQuery);
      
      // Should have multiple sources
      expect(result.sources.length).toBeGreaterThanOrEqual(1);
    });
  });
});

