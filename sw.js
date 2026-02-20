const CACHE_NAME = 'spc-egg-cache-v2';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './logo.png'
];

// Install - Cache Everything
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Activate - Remove Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Offline First Strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache
        }
        return fetch(event.request)
          .then(networkResponse => {
            return networkResponse;
          })
          .catch(() => {
            // Optional fallback
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});