const CACHE='piscineiropro-fase1-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./supabase-config.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
