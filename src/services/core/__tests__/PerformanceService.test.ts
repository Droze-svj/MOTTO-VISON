/**
 * PerformanceService Tests
 * Tests performance optimization features
 */

import PerformanceService from '../PerformanceService';

describe('PerformanceService', () => {
  describe('Parallel Processing', () => {
    it('should run tasks in parallel', async () => {
      const startTime = Date.now();
      
      const tasks = [
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'result1';
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'result2';
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'result3';
        }
      ];
      
      const results = await PerformanceService.runParallel(tasks);
      const duration = Date.now() - startTime;
      
      // Should complete in ~100ms (parallel) not ~300ms (sequential)
      expect(duration).toBeLessThan(200);
      expect(results).toHaveLength(3);
      expect(results).toContain('result1');
      expect(results).toContain('result2');
      expect(results).toContain('result3');
    });
  });

  describe('Lazy Execution', () => {
    it('should skip when condition false', async () => {
      let executed = false;
      
      const result = await PerformanceService.lazyExecute(
        async () => {
          executed = true;
          return 'result';
        },
        () => false
      );
      
      expect(executed).toBe(false);
      expect(result).toBeNull();
    });

    it('should execute when condition true', async () => {
      let executed = false;
      
      const result = await PerformanceService.lazyExecute(
        async () => {
          executed = true;
          return 'result';
        },
        () => true
      );
      
      expect(executed).toBe(true);
      expect(result).toBe('result');
    });
  });

  describe('Memoization', () => {
    it('should cache expensive computations', async () => {
      let callCount = 0;
      
      const expensiveFn = async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'expensive-result';
      };
      
      // First call
      const result1 = await PerformanceService.memoize('test-key', expensiveFn, 60000);
      expect(result1).toBe('expensive-result');
      expect(callCount).toBe(1);
      
      // Second call (should use cache)
      const result2 = await PerformanceService.memoize('test-key', expensiveFn, 60000);
      expect(result2).toBe('expensive-result');
      expect(callCount).toBe(1); // Not called again!
    });

    it('should recompute after TTL expires', async () => {
      let callCount = 0;
      
      const fn = async () => {
        callCount++;
        return `result-${callCount}`;
      };
      
      // First call
      await PerformanceService.memoize('ttl-test', fn, 50);
      expect(callCount).toBe(1);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should recompute
      await PerformanceService.memoize('ttl-test', fn, 50);
      expect(callCount).toBe(2);
    });
  });

  describe('Phase Timing', () => {
    it('should track phase duration', () => {
      PerformanceService.startPhase('test-phase');
      
      // Simulate work
      const start = Date.now();
      while (Date.now() - start < 50) {
        // Wait
      }
      
      const duration = PerformanceService.endPhase('test-phase');
      
      expect(duration).toBeGreaterThanOrEqual(45);
      expect(duration).toBeLessThan(100);
    });

    it('should provide metrics', () => {
      PerformanceService.startPhase('phase1');
      PerformanceService.endPhase('phase1');
      
      const metrics = PerformanceService.getMetrics();
      
      expect(metrics).toHaveProperty('phaseTimings');
      expect(metrics).toHaveProperty('phaseAverages');
    });
  });
});
