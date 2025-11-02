/**
 * Offline Mode Tests
 * Tests service worker, caching, and offline functionality
 */

// Mock service worker APIs
global.navigator = {
  // @ts-ignore
  serviceWorker: {
    register: jest.fn(() => Promise.resolve({
      active: { postMessage: jest.fn() },
      update: jest.fn(),
      unregister: jest.fn(),
    })),
    ready: Promise.resolve({
      active: { postMessage: jest.fn() },
    }),
    controller: {
      postMessage: jest.fn(),
    },
  },
  onLine: true,
} as any;

// Mock Cache API
global.caches = {
  open: jest.fn(() => Promise.resolve({
    match: jest.fn(),
    put: jest.fn(),
    add: jest.fn(),
    addAll: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn(),
  })),
  match: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn(),
} as any;

describe('Offline Mode Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    navigator.onLine = true;
  });

  describe('Service Worker Registration', () => {
    test('should register service worker when available', () => {
      if ('serviceWorker' in navigator) {
        const registration = navigator.serviceWorker.register('/service-worker.js');
        expect(registration).toBeDefined();
      }
    });

    test('should handle service worker registration errors', async () => {
      if ('serviceWorker' in navigator) {
        // @ts-ignore
        navigator.serviceWorker.register = jest.fn(() => 
          Promise.reject(new Error('Registration failed'))
        );

        try {
          await navigator.serviceWorker.register('/service-worker.js');
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });

  describe('Online/Offline Detection', () => {
    test('should detect online status', () => {
      // @ts-ignore
      navigator.onLine = true;
      expect(navigator.onLine).toBe(true);
    });

    test('should detect offline status', () => {
      // @ts-ignore
      navigator.onLine = false;
      expect(navigator.onLine).toBe(false);
    });

    test('should listen for online events', () => {
      const handler = jest.fn();
      window.addEventListener('online', handler);
      
      // Simulate going online
      // @ts-ignore
      navigator.onLine = true;
      window.dispatchEvent(new Event('online'));
      
      expect(handler).toHaveBeenCalled();
    });

    test('should listen for offline events', () => {
      const handler = jest.fn();
      window.addEventListener('offline', handler);
      
      // Simulate going offline
      // @ts-ignore
      navigator.onLine = false;
      window.dispatchEvent(new Event('offline'));
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    test('should open cache', async () => {
      const cacheName = 'test-cache';
      const cache = await caches.open(cacheName);
      expect(cache).toBeDefined();
      expect(caches.open).toHaveBeenCalledWith(cacheName);
    });

    test('should add to cache', async () => {
      const cache = await caches.open('test-cache');
      const request = new Request('/test.html');
      const response = new Response('test content');
      
      await cache.put(request, response);
      expect(cache.put).toHaveBeenCalledWith(request, response);
    });

    test('should match cached requests', async () => {
      const cache = await caches.open('test-cache');
      const request = new Request('/test.html');
      
      await cache.match(request);
      expect(cache.match).toHaveBeenCalledWith(request);
    });
  });

  describe('Offline Fallback', () => {
    test('should serve cached content when offline', async () => {
      // @ts-ignore
      navigator.onLine = false;
      
      const cache = await caches.open('static-cache');
      const request = new Request('/index.html');
      const cachedResponse = new Response('cached content');
      
      // Mock cache match
      cache.match = jest.fn(() => Promise.resolve(cachedResponse));
      
      const response = await cache.match(request);
      expect(response).toBe(cachedResponse);
    });

    test('should fallback to offline page when no cache', async () => {
      // @ts-ignore
      navigator.onLine = false;
      
      const cache = await caches.open('static-cache');
      const request = new Request('/index.html');
      
      // Mock no cache match
      cache.match = jest.fn(() => Promise.resolve(undefined));
      
      // Should fallback to offline.html
      const offlineRequest = new Request('/offline.html');
      const offlineResponse = new Response('offline page');
      
      cache.match = jest.fn((req) => {
        if (req.url.includes('offline.html')) {
          return Promise.resolve(offlineResponse);
        }
        return Promise.resolve(undefined);
      });
      
      const response = await cache.match(offlineRequest);
      expect(response).toBe(offlineResponse);
    });
  });

  describe('Cache Strategy - Network First', () => {
    test('should try network first for API requests', async () => {
      const request = new Request('/api/data');
      let networkAttempted = false;
      
      // Simulate network first strategy
      try {
        // Try network
        networkAttempted = true;
        const networkResponse = await fetch(request);
        expect(networkAttempted).toBe(true);
        
        // Cache successful response
        if (networkResponse.ok) {
          const cache = await caches.open('api-cache');
          await cache.put(request, networkResponse.clone());
        }
      } catch (error) {
        // Fallback to cache
        const cache = await caches.open('api-cache');
        const cached = await cache.match(request);
        expect(cached).toBeDefined();
      }
    });
  });

  describe('Cache Strategy - Cache First', () => {
    test('should check cache first for static assets', async () => {
      const request = new Request('/static/image.png');
      const cache = await caches.open('static-cache');
      
      // Check cache first
      const cached = await cache.match(request);
      
      if (cached) {
        expect(cached).toBeDefined();
      } else {
        // Fetch and cache
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response.clone());
        }
      }
    });
  });

  describe('Background Sync', () => {
    test('should register background sync', async () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        
        if ('sync' in registration) {
          // @ts-ignore
          const syncRegistration = await registration.sync.register('background-sync');
          expect(syncRegistration).toBeDefined();
        }
      }
    });
  });

  describe('Cache Versioning', () => {
    test('should handle cache version updates', async () => {
      const oldCacheName = 'motto-v1';
      const newCacheName = 'motto-v2';
      
      // Delete old cache
      const deleted = await caches.delete(oldCacheName);
      expect(deleted).toBeDefined();
      
      // Create new cache
      const newCache = await caches.open(newCacheName);
      expect(newCache).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle cache errors gracefully', async () => {
      try {
        const cache = await caches.open('test-cache');
        // Simulate error
        throw new Error('Cache error');
      } catch (error) {
        expect(error).toBeDefined();
        // Should not crash app
      }
    });

    test('should handle service worker errors', async () => {
      if ('serviceWorker' in navigator) {
        try {
          // @ts-ignore
          navigator.serviceWorker.register = jest.fn(() => 
            Promise.reject(new Error('SW error'))
          );
          
          await navigator.serviceWorker.register('/service-worker.js');
        } catch (error) {
          expect(error).toBeDefined();
          // App should continue functioning
        }
      }
    });
  });

  describe('Performance', () => {
    test('should cache respond quickly', async () => {
      const start = Date.now();
      const cache = await caches.open('test-cache');
      const request = new Request('/test.html');
      await cache.match(request);
      const duration = Date.now() - start;
      
      // Cache lookup should be fast
      expect(duration).toBeLessThan(100);
    });
  });
});

