// Guarda la app para que abra sin internet en el portátil.
// Siempre pide la versión nueva al servidor (sin usar la copia vieja del navegador)
// y usa la guardada solo si no hay internet.
const CACHE = 'p01-pomodoro-v1.10';
const FILES = ['./', 'index.html', 'styles.css?v=1.10', 'mensajes.js?v=1.10', 'tonos.js?v=1.10', 'app.js?v=1.10', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
