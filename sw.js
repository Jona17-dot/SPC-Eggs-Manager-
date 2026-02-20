const CACHE_NAME = 'spc-egg-cache-v4';

const ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './logo.png',
  './manifest.json'
];

// ================= INSTALL =================
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// ================= ACTIVATE =================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ================= FETCH =================
self.addEventListener('fetch', event => {

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        // If found in cache → return immediately
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise try network
        return fetch(event.request)
          .then(networkResponse => {

            // Optional: cache new files dynamically
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });

          })
          .catch(() => {

            // If navigation fails → serve index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }

          });

      })
  );
});