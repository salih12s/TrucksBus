// TrucksBus Service Worker - PWA Features
const CACHE_NAME = 'trucksbus-v1.0.0';
const STATIC_CACHE = 'trucksbus-static-v1.0.0';
const DYNAMIC_CACHE = 'trucksbus-dynamic-v1.0.0';
const API_CACHE = 'trucksbus-api-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Core CSS and JS will be added by Vite
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/ads',
  '/api/categories',
  '/api/auth/me'
];

// Network-first strategy for API calls
const NETWORK_FIRST = [
  /\/api\/ads/,
  /\/api\/auth/,
  /\/api\/messages/
];

// Cache-first strategy for static assets
const CACHE_FIRST = [
  /\.(?:js|css|woff2?|ttf|eot)$/,
  /\/images\//,
  /\/icons\//
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (isAPIRequest(url.pathname)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  switch (event.tag) {
    case 'background-sync-ads':
      event.waitUntil(syncOfflineAds());
      break;
    case 'background-sync-messages':
      event.waitUntil(syncOfflineMessages());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: 'Yeni bir mesajınız var!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Mesajı Görüntüle',
        icon: '/icon-message-96x96.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icon-close-96x96.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('TrucksBus', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/messages')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

function isStaticAsset(pathname) {
  return CACHE_FIRST.some(pattern => pattern.test(pathname));
}

function isPageRequest(request) {
  return request.headers.get('accept').includes('text/html');
}

// Network-first strategy for API requests
async function handleAPIRequest(request) {
  const cacheName = API_CACHE;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request, { cacheName });
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical API calls
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Bu özellik çevrimdışı kullanılabilir değil'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Asset not available:', request.url);
    return new Response('Asset not available', { status: 404 });
  }
}

// App shell pattern for pages
async function handlePageRequest(request) {
  try {
    // Try network first for pages
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the page
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Page request failed, serving app shell');
    
    // Fallback to cached page or app shell
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page
    return caches.match('/offline.html');
  }
}

// Background sync functions
async function syncOfflineAds() {
  console.log('[SW] Syncing offline ads...');
  
  try {
    // Get offline ads from IndexedDB
    const offlineAds = await getOfflineData('ads');
    
    for (const ad of offlineAds) {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ad)
      });
    }
    
    // Clear offline data after successful sync
    await clearOfflineData('ads');
    
    console.log('[SW] Offline ads synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync offline ads:', error);
  }
}

async function syncOfflineMessages() {
  console.log('[SW] Syncing offline messages...');
  
  try {
    // Get offline messages from IndexedDB
    const offlineMessages = await getOfflineData('messages');
    
    for (const message of offlineMessages) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    }
    
    // Clear offline data after successful sync
    await clearOfflineData('messages');
    
    console.log('[SW] Offline messages synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync offline messages:', error);
  }
}

// IndexedDB helpers (simplified)
async function getOfflineData(storeName) {
  // This would integrate with your IndexedDB implementation
  return [];
}

async function clearOfflineData(storeName) {
  // This would clear the offline data from IndexedDB
  console.log(`[SW] Clearing offline data for ${storeName}`);
}
