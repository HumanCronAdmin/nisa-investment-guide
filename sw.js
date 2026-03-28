const CACHE_NAME = 'beyond-nisa-v1';
const ASSETS = [
  '/nisa-investment-guide/',
  '/nisa-investment-guide/index.html',
  '/nisa-investment-guide/css/custom.css',
  '/nisa-investment-guide/js/data.js',
  '/nisa-investment-guide/js/calculator.js',
  '/nisa-investment-guide/js/chart.js',
  '/nisa-investment-guide/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
