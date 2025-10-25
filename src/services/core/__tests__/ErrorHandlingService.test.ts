/**
 * ErrorHandlingService Tests
 * Tests error handling and recovery strategies
 */

import ErrorHandlingService from '../ErrorHandlingService';

describe('ErrorHandlingService', () => {
  describe('Safe Execute', () => {
    it('should return primary result on success', async () => {
      const result = await ErrorHandlingService.safeExecute(
        'test-operation',
        async () => 'success',
        []
      );
      
      expect(result).toBe('success');
    });

    it('should use fallback on primary failure', async () => {
      const result = await ErrorHandlingService.safeExecute(
        'test-operation',
        async () => { throw new Error('Primary failed'); },
        [
          {
            name: 'fallback1',
            priority: 1,
            handler: async () => 'fallback-success'
          }
        ]
      );
      
      expect(result).toBe('fallback-success');
    });

    it('should try multiple fallbacks in order', async () => {
      const result = await ErrorHandlingService.safeExecute(
        'test-operation',
        async () => { throw new Error('Primary failed'); },
        [
          {
            name: 'fallback1',
            priority: 1,
            handler: async () => { throw new Error('Fallback 1 failed'); }
          },
          {
            name: 'fallback2',
            priority: 2,
            handler: async () => 'fallback2-success'
          }
        ]
      );
      
      expect(result).toBe('fallback2-success');
    });

    it('should return null if all strategies fail', async () => {
      const result = await ErrorHandlingService.safeExecute(
        'test-operation',
        async () => { throw new Error('Failed'); },
        [
          {
            name: 'fallback',
            priority: 1,
            handler: async () => { throw new Error('Also failed'); }
          }
        ]
      );
      
      expect(result).toBeNull();
    });
  });

  describe('Retry with Backoff', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      
      const result = await ErrorHandlingService.retryWithBackoff(
        async () => {
          attempts++;
          if (attempts < 2) throw new Error('Not yet');
          return 'success';
        },
        3,
        100
      );
      
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should give up after max retries', async () => {
      const result = await ErrorHandlingService.retryWithBackoff(
        async () => { throw new Error('Always fails'); },
        3,
        10
      );
      
      expect(result).toBeNull();
    });
  });

  describe('Safe Fetch', () => {
    it('should handle network errors gracefully', async () => {
      const result = await ErrorHandlingService.safeFetch(
        'https://invalid-url-that-does-not-exist-12345.com',
        {},
        1,
        1000
      );
      
      expect(result).toBeNull();
    });
  });

  describe('User-Friendly Messages', () => {
    it('should provide friendly error messages', () => {
      const networkError = new Error('Network request failed');
      const message = ErrorHandlingService.getUserFriendlyMessage(
        networkError,
        'fetch'
      );
      
      expect(message).toBeTruthy();
      expect(message).not.toContain('Error:');
      expect(message).not.toContain('Exception');
    });

    it('should detect translation errors', () => {
      const error = new Error('Translation failed');
      const message = ErrorHandlingService.getUserFriendlyMessage(error, 'translation');
      
      expect(message).toContain('translate');
    });
  });

  describe('Safe All Settled', () => {
    it('should separate successes and failures', async () => {
      const promises = [
        Promise.resolve('success1'),
        Promise.reject('failure1'),
        Promise.resolve('success2'),
        Promise.reject('failure2'),
      ];
      
      const result = await ErrorHandlingService.safeAllSettled(promises);
      
      expect(result.success).toHaveLength(2);
      expect(result.failures).toHaveLength(2);
      expect(result.success).toContain('success1');
      expect(result.success).toContain('success2');
    });
  });

  describe('Timeout', () => {
    it('should timeout slow operations', async () => {
      const slowOperation = new Promise(resolve => 
        setTimeout(() => resolve('too-slow'), 2000)
      );
      
      await expect(
        ErrorHandlingService.withTimeout(slowOperation, 500, 'Timed out')
      ).rejects.toThrow('Timed out');
    });

    it('should return result if completes in time', async () => {
      const fastOperation = Promise.resolve('fast');
      
      const result = await ErrorHandlingService.withTimeout(fastOperation, 1000);
      
      expect(result).toBe('fast');
    });
  });
});
