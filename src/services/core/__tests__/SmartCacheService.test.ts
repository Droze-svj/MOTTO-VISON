/**
 * SmartCacheService Tests
 * Tests multi-layer caching system
 */

import SmartCacheService from '../SmartCacheService';

describe('SmartCacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    SmartCacheService.clearAll();
  });

  describe('Basic Caching', () => {
    it('should store and retrieve values', async () => {
      await SmartCacheService.set('test-key', 'test-value', 60000);
      const result = await SmartCacheService.get('test-key');
      
      expect(result).toBe('test-value');
    });

    it('should return null for non-existent keys', async () => {
      const result = await SmartCacheService.get('nonexistent');
      
      expect(result).toBeNull();
    });

    it('should handle different data types', async () => {
      await SmartCacheService.set('string', 'value');
      await SmartCacheService.set('number', 42);
      await SmartCacheService.set('object', { foo: 'bar' });
      await SmartCacheService.set('array', [1, 2, 3]);
      
      expect(await SmartCacheService.get('string')).toBe('value');
      expect(await SmartCacheService.get('number')).toBe(42);
      expect(await SmartCacheService.get('object')).toEqual({ foo: 'bar' });
      expect(await SmartCacheService.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', async () => {
      await SmartCacheService.set('short-lived', 'value', 100); // 100ms TTL
      
      // Should exist immediately
      const immediate = await SmartCacheService.get('short-lived');
      expect(immediate).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be expired
      const expired = await SmartCacheService.get('short-lived');
      expect(expired).toBeNull();
    });
  });

  describe('Fallback', () => {
    it('should use fallback when key not found', async () => {
      const result = await SmartCacheService.get(
        'missing-key',
        async () => 'fallback-value'
      );
      
      expect(result).toBe('fallback-value');
    });

    it('should cache fallback result', async () => {
      let callCount = 0;
      const fallback = async () => {
        callCount++;
        return 'expensive-result';
      };

      // First call - uses fallback
      const first = await SmartCacheService.get('key', fallback);
      expect(first).toBe('expensive-result');
      expect(callCount).toBe(1);

      // Second call - uses cache
      const second = await SmartCacheService.get('key');
      expect(second).toBe('expensive-result');
      expect(callCount).toBe(1); // Fallback not called again!
    });
  });

  describe('Invalidation', () => {
    it('should invalidate by pattern', async () => {
      await SmartCacheService.set('user:123', 'data1');
      await SmartCacheService.set('user:456', 'data2');
      await SmartCacheService.set('system:config', 'data3');
      
      // Invalidate user keys
      const count = await SmartCacheService.invalidate(/^user:/);
      
      expect(count).toBeGreaterThan(0);
      expect(await SmartCacheService.get('user:123')).toBeNull();
      expect(await SmartCacheService.get('user:456')).toBeNull();
      expect(await SmartCacheService.get('system:config')).toBe('data3');
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', async () => {
      await SmartCacheService.set('key', 'value');
      
      // Hit
      await SmartCacheService.get('key');
      
      // Miss
      await SmartCacheService.get('nonexistent');
      
      const stats = SmartCacheService.getStats();
      
      expect(stats.totalHits).toBeGreaterThan(0);
      expect(stats.totalMisses).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });
});
