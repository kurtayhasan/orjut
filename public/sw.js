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

  // 1. ASLA CACHE'E DOKUNMAYACAK KESİN KORUMA ALANLARI (POST, PUT vs)
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. NetworkFirst: API ve Supabase istekleri
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('supabase') ||
    url.searchParams.has('_rsc') ||
    url.pathname.includes('_rsc=')
  ) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(async () => {
        // Çevrimdışıysak cache'den vermeyi dene, yoksa fallback
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || new Response(JSON.stringify({ error: 'Çevrimdışı (Offline)' }), {
          status: 503, headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. CacheFirst: Next.js statik dosyaları (_next) ve görseller
  if (url.pathname.startsWith('/_next') || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Stale-While-Revalidate: Navigasyon ve diğerleri
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
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
