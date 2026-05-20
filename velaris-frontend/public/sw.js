const CACHE_NAME = 'velaris-v1';

// Recursos que se cachean al instalar
const STATIC_ASSETS = [
  '/',
  '/trips',
  '/flights',
  '/escapadas',
  '/manifest.json',
];

// Instalación — precachear recursos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activación — limpiar caches antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback a cache
self.addEventListener('fetch', event => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  // No interceptar llamadas a la API ni a Groq
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('groq') ||
      url.hostname.includes('unsplash')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia en caché si es exitosa
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Sin red — intentar desde caché
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback a la home si es navegación
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});