const CACHE_NAME = 'hydra-cache-v2'; // Bumped version to force update
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa-192.png',
  '/pwa-512.png',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ONLY cache http or https. 
  // This ignores chrome-extension://, capacitor://, and ws:// schemes
  if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
    return;
  }

  // EXCLUDE NOSTR RELAYS (WebSockets)
  // This prevents the Service Worker from interfering with relay connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:' || url.hostname.includes('nos.lol') || url.hostname.includes('damus.io') || url.hostname.includes('relay')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline root for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-streak-data') {
    event.waitUntil(syncStreakData());
  }
});

async function syncStreakData() {
  // Sync any pending streak data when back online
  console.log('Background sync: syncing streak data');
}

// Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-motivation') {
    event.waitUntil(checkMotivation());
  }
});

async function checkMotivation() {
  console.log('Periodic sync: checking for motivation updates');
}

// Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'NoFap Hydra 🐉', body: 'Stay strong on your journey!' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    vibrate: [100, 50, 100],
    data: { url: '/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Message handler for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
