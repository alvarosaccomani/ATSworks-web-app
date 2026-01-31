const CACHE_NAME = 'ATSWorks-web-app-cache-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html'
];

// Escuchar el mensaje SKIP_WAITING para activar la nueva versión
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Instalación: Almacena los recursos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación: Limpia cachés antiguos y reclama los clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Reclamar todos los clientes abiertos para que usen el nuevo SW
      return self.clients.claim();
    })
  );
});

// Fetch: Sirve recursos desde la caché si están disponibles
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});