// Offline cache. Only used when the app is served over HTTPS (iOS ignores service workers on plain http).
const VERSION = 'pa-v3';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/audio.js', 'js/store.js', 'js/art.js', 'js/ui.js', 'js/app.js',
  'js/games/count.js', 'js/games/path.js', 'js/games/sounds.js', 'js/games/rhyme.js',
  'js/games/pattern.js', 'js/games/shapes.js', 'js/games/feelings.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// network first (so updates show up), falling back to the cache when offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.indexOf('fonts.g') > 0)) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
