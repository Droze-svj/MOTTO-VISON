# Offline Support Documentation

## Overview

MOTTO includes comprehensive offline support through Service Workers, allowing the app to function even without an active internet connection.

## Features

### 1. Service Worker
**Location**: `public/service-worker.js`

**Capabilities**:
- Static asset caching
- API response caching
- Offline page fallback
- Background sync support
- Cache management

### 2. Caching Strategies

#### Static Assets (Cache First)
- Images, CSS, JS files
- Cached immediately on install
- Served from cache if available, network as fallback

#### API Requests (Network First)
- API responses cached for offline use
- Network attempted first, cache fallback
- Returns cached data when offline

#### HTML Pages (Network First with Offline Fallback)
- Network first for latest content
- Falls back to cached version if offline
- Shows offline page if no cache available

### 3. Offline Page
**Location**: `public/offline.html`

Custom offline experience with:
- User-friendly offline message
- Auto-retry when connection restored
- Visual feedback

## Registration

The service worker is automatically registered when the app loads:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
}
```

## Cache Management

### Cache Versions
- `motto-static-v1`: Static assets
- `motto-api-v1`: API responses
- Versioned to allow cache updates

### Clearing Cache
```javascript
// Clear all caches
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({
    type: 'CLEAR_CACHE'
  });
}
```

### Pre-caching Additional URLs
```javascript
navigator.serviceWorker.controller.postMessage({
  type: 'CACHE_URLS',
  urls: ['/api/important-data', '/static/asset.png']
});
```

## Background Sync

The service worker supports background sync for queued requests:

```javascript
// Queue request for background sync
navigator.serviceWorker.ready.then(registration => {
  return registration.sync.register('background-sync');
});
```

## Usage

### Checking Online Status
```javascript
if (navigator.onLine) {
  // Online - use network
} else {
  // Offline - use cache
}
```

### Listening for Connection Changes
```javascript
window.addEventListener('online', () => {
  console.log('Connection restored');
  // Refresh data, reload page, etc.
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  // Switch to offline mode
});
```

## Testing Offline Mode

1. **Chrome DevTools**:
   - Open DevTools → Network tab
   - Select "Offline" from throttling dropdown
   - Reload page

2. **Service Worker Testing**:
   - DevTools → Application → Service Workers
   - Check "Offline" checkbox
   - Test app functionality

3. **Cache Inspection**:
   - DevTools → Application → Cache Storage
   - View cached resources
   - Clear caches manually

## Best Practices

1. **Cache Important Assets**: Pre-cache critical resources on install
2. **Version Caches**: Use versioned cache names for updates
3. **Limit Cache Size**: Monitor and limit cache size
4. **Update Strategy**: Choose appropriate strategy per resource type
5. **Error Handling**: Always provide offline fallbacks

## Limitations

- Service Workers require HTTPS (or localhost)
- Some features may be limited offline
- Cache size is browser-dependent
- Background sync may have delays

## Future Enhancements

- IndexedDB for structured data storage
- Request queuing with IndexedDB
- Push notifications for sync completion
- Advanced cache invalidation strategies

---

**Last Updated**: $(date)  
**Service Worker Version**: v1  
**Supported Browsers**: Chrome, Firefox, Edge, Safari (iOS 11.3+)

