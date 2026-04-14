// Service Worker — BLR→LEH→BLR Trip App
// Optimized Strategy: Network-First for main pages to avoid .html vs extensionless issues
// and Cache-First for assets.

const CACHE_NAME = 'leh-trip-v2';
const STATIC_ASSETS = [
  '/index.html',
  '/tracker.html',
  '/leh-budget.html',
  '/js/tracker-logic.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ── Install: cache static assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Use addAll but catch individual failures if any
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'no-cache' })));
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: cleanup ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: strategy selection ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isNavigate = event.request.mode === 'navigate';
  const isApi      = url.pathname.startsWith('/api/');

  // 1. API Calls: Network-First
  if (isApi) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Navigation (HTML Pages): Network-First
  // This solves the Cloudflare "Clean URLs" issue where /tracker vs /tracker.html might mismatch
  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // If network fails (offline), try cache with fallback
          return normalizeCacheMatch(event.request);
        })
    );
    return;
  }

  // 3. Static Assets: Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => Response.error())
  );
});

// Helper to match /tracker even if /tracker.html is cached
async function normalizeCacheMatch(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);
  const path = url.pathname;

  // Try exact match
  let match = await cache.match(request);
  if (match) return match;

  // Try appending .html
  if (!path.endsWith('.html') && path.length > 1) {
    match = await cache.match(path + '.html');
    if (match) return match;
  }

  // Try removing .html
  if (path.endsWith('.html')) {
    match = await cache.match(path.replace('.html', ''));
    if (match) return match;
  }

  // Final fallback to index
  return cache.match('/index.html');
}
