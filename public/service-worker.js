/**
 * MOTTO Service Worker - Offline Support
 * Handles offline caching, request interception, and background sync
 */

const CACHE_NAME = 'motto-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_CACHE_NAME = 'motto-static-v1';
const API_CACHE_NAME = 'motto-api-v1';

// Resources to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different request types
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first, fallback to cache
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.startsWith('/static/')) {
    // Static assets - cache first, fallback to network
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // HTML pages - network first with offline fallback
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

/**
 * Network-first strategy for API requests
 * Tries network, falls back to cache if offline
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This request is cached for offline use',
        cached: true 
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
}

/**
 * Cache-first strategy for static assets
 * Checks cache first, falls back to network
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Failed to fetch:', request.url);
    throw error;
  }
}

/**
 * Network-first with offline fallback for HTML pages
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, serving offline page');
    
    // Check if we have a cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort - return basic offline message
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your connection.</p></body></html>',
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
}

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncQueuedRequests());
  }
});

/**
 * Sync queued requests when back online
 */
async function syncQueuedRequests() {
  // Implementation would depend on your request queueing system
  console.log('[Service Worker] Syncing queued requests');
  
  // Example: Get queued requests from IndexedDB and send them
  // This is a placeholder - implement based on your needs
}

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls));
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearCache());
  }
});

/**
 * Cache additional URLs on demand
 */
async function cacheUrls(urls) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  return cache.addAll(urls);
}

/**
 * Clear all caches
 */
async function clearCache() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map(name => caches.delete(name)));
}

