/**
 * FreeKnowledgeService Tests
 * Testing free knowledge source integration
 */

import FreeKnowledgeService from '../FreeKnowledgeService';

describe('FreeKnowledgeService', () => {
  describe('Knowledge Search', () => {
    it('should search free knowledge sources', async () => {
      const result = await FreeKnowledgeService.searchFreeKnowledge('Python programming');
      
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
    });

    it('should return confidence score', async () => {
      const result = await FreeKnowledgeService.searchFreeKnowledge('JavaScript');
      
      expect(result.confidence).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should handle technical queries', async () => {
      const result = await FreeKnowledgeService.searchFreeKnowledge('React hooks');
      
      expect(result).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should handle general knowledge queries', async () => {
      const result = await FreeKnowledgeService.searchFreeKnowledge('World history');
      
      expect(result).toBeDefined();
    });

    it('should handle empty query', async () => {
      const result = await FreeKnowledgeService.searchFreeKnowledge('');
      
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should provide at least one source', async () => {
      const result = await FreeKnowledgeService.searchFreeKnowledge('TypeScript');
      
      expect(result.sources.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should complete search quickly', async () => {
      const startTime = Date.now();
      await FreeKnowledgeService.searchFreeKnowledge('Quick test');
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeLessThan(10000); // < 10 seconds
    });

    it('should handle multiple concurrent searches', async () => {
      const searches = [
        FreeKnowledgeService.searchFreeKnowledge('Topic 1'),
        FreeKnowledgeService.searchFreeKnowledge('Topic 2'),
        FreeKnowledgeService.searchFreeKnowledge('Topic 3'),
      ];
      
      const results = await Promise.all(searches);
      
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.summary).toBeDefined();
      });
    });
  });
});

