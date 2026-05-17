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

  // 1. ASLA CACHE'E DOKUNMAYACAK KESİN KORUMA ALANLARI
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.hostname.includes('supabase') ||
    url.searchParams.has('_rsc') ||
    url.pathname.includes('_rsc=') ||
    url.pathname.startsWith('/_next')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Sadece statik varlıklar ve navigasyon için kontrollü akış
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Sadece başarılı ve standart istekleri cache'e güvenle yaz
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
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
});
