// Service Worker — BLR→LEH→BLR Trip App
// Offline-first: static assets cached on install, API calls use network-first
const CACHE_NAME = 'leh-trip-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/tracker.html',
  '/leh-budget.html',
  '/js/tracker-logic.js',
  '/manifest.json',
  // Google Fonts (pre-cached at install only if network)
];

// ── Install: cache all static assets ──
self.addEventListener('install', event => {
  console.log('[SW] Installing…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Cached all static assets');
      return self.skipWaiting();
    })
  );
});

// ── Activate: clean old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: strategy selection ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls → network-first (fall back to cached if offline)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone to cache a copy
          const toCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets → cache-first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      });
    }).catch(() => {
      // Offline fallback: serve index.html for navigations
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html').then(match => {
          return match || Response.error(); // Avoid returning undefined
        });
      }
      return Response.error();
    })
  );
});
