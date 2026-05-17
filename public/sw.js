// Last Updated: 2026-05-16 01:28
const CACHE_NAME = 'ziraiasistan-cache-v3';
const OFFLINE_URL = '/';

const CACHED_URLS = [
  '/',
  '/dashboard',
  '/dashboard/lands',
  '/dashboard/seasons',
  '/icon.svg',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHED_URLS);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Kesinlikle cache'lenmeyecek kritik yollar:
  if (
    event.request.method !== 'GET' ||
    url.pathname.includes('/api/') ||
    url.searchParams.has('_rsc') || 
    url.pathname.includes('/_next/')
  ) {
    return event.respondWith(fetch(event.request)); // Doğrudan network'e bırak, asla clone etme!
  }

  // Intercept Maps requests (stale-while-revalidate for navigation and static assets)
  if (event.request.mode === 'navigate' || event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
