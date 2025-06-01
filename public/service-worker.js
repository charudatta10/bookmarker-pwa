/**
 * Service Worker for Bookmarker PWA
 * Handles caching and offline support
 */

// Cache names
const STATIC_CACHE_NAME = 'bookmarker-static-v1';
const DYNAMIC_CACHE_NAME = 'bookmarker-dynamic-v1';
const FONT_CACHE_NAME = 'bookmarker-fonts-v1';
const API_CACHE_NAME = 'bookmarker-api-v1';

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/main.css',
  '/css/components.css',
  '/js/app.js',
  '/js/controllers/bookmark-controller.js',
  '/js/controllers/bookmark-form-controller.js',
  '/js/controllers/category-form-controller.js',
  '/js/controllers/search-controller.js',
  '/js/controllers/share-controller.js',
  '/js/controllers/import-export-controller.js',
  '/js/models/database-service.js',
  '/js/models/bookmark-repository.js',
  '/js/models/category-repository.js',
  '/js/utils/modal-manager.js',
  '/js/utils/toast-manager.js',
  '/js/utils/network-manager.js',
  '/js/utils/router.js',
  '/js/utils/settings-manager.js',
  '/js/wasm/sqlite-wasm-adapter.js',
  '/js/wasm/sqlite-worker.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Font resources to cache
const FONT_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Precaching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Cache font resources
      caches.open(FONT_CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Precaching font resources');
        return cache.addAll(FONT_RESOURCES);
      })
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients to ensure the service worker controls all pages
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // Delete old versions of our caches
        if (
          key !== STATIC_CACHE_NAME && 
          key !== DYNAMIC_CACHE_NAME && 
          key !== FONT_CACHE_NAME && 
          key !== API_CACHE_NAME
        ) {
          console.log('[Service Worker] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle different types of requests
  if (url.origin === location.origin) {
    // Handle local requests
    event.respondWith(handleLocalRequest(event.request));
  } else if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    // Handle font requests
    event.respondWith(handleFontRequest(event.request));
  } else if (url.hostname.includes('cdnjs.cloudflare.com')) {
    // Handle CDN requests
    event.respondWith(handleCdnRequest(event.request));
  } else {
    // Handle all other external requests
    event.respondWith(handleExternalRequest(event.request));
  }
});

/**
 * Handle local requests (app resources)
 * Strategy: Cache First with Network Fallback
 */
async function handleLocalRequest(request) {
  // For HTML navigation requests, use network-first strategy
  if (request.mode === 'navigate') {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      return networkResponse;
    } catch (error) {
      // If network fails, try cache
      const cachedResponse = await caches.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If cache fails too, return offline page
      return caches.match('/offline.html');
    }
  }
  
  // For other local resources, use cache-first strategy
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return appropriate fallback
    console.error('[Service Worker] Fetch failed:', error);
    
    // For image requests, return a placeholder
    if (request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      return caches.match('/icons/placeholder.png');
    }
    
    // For other resources, just return the error
    throw error;
  }
}

/**
 * Handle font requests
 * Strategy: Cache First with Network Fallback
 */
async function handleFontRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    const cache = await caches.open(FONT_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Font fetch failed:', error);
    throw error;
  }
}

/**
 * Handle CDN requests (e.g., SQLite WASM)
 * Strategy: Cache First with Network Fallback
 */
async function handleCdnRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] CDN fetch failed:', error);
    throw error;
  }
}

/**
 * Handle external requests (e.g., favicon APIs)
 * Strategy: Network First with Cache Fallback
 */
async function handleExternalRequest(request) {
  // For non-GET requests, don't cache
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache the response
    const cache = await caches.open(API_CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If both network and cache fail, throw error
    console.error('[Service Worker] External fetch failed:', error);
    throw error;
  }
}

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

/**
 * Sync bookmarks with server (placeholder)
 * In a real app, this would sync local changes with a remote server
 */
async function syncBookmarks() {
  // This is a placeholder for actual sync logic
  console.log('[Service Worker] Syncing bookmarks...');
  
  // In a real app, we would:
  // 1. Get pending changes from IndexedDB
  // 2. Send them to the server
  // 3. Update local state based on server response
  
  return Promise.resolve();
}

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  let data = { title: 'New Notification', body: 'Something happened!' };
  
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
