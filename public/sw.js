const CACHE_NAME = 'fajmuls-daily-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network First, fallback to cache for robust PWA updates
  e.respondWith(
    fetch(e.request).then((networkResponse) => {
      return caches.open(CACHE_NAME).then((cache) => {
        // Only cache valid GET requests to http/https
        if (e.request.method === 'GET' && e.request.url.startsWith('http')) {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      });
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'end-trip') {
    const tripId = event.notification.data?.tripId;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Send a message to all open windows to end the trip
        windowClients.forEach((client) => {
          client.postMessage({
            type: 'END_TRIP',
            tripId: tripId
          });
        });

        // Or focus an existing window if it exists
        if (windowClients.length > 0) {
          windowClients[0].focus();
        } else {
          clients.openWindow('/notes/trips');
        }
      })
    );
  } else {
    // Default click opens app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        if (windowClients.length > 0) {
          windowClients[0].focus();
        } else {
          clients.openWindow('/');
        }
      })
    );
  }
});
