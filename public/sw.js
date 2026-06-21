// Service Worker for 1timer PWA
// Handles offline-first caching so the app works without any internet connection.
// The app uses IndexedDB (via Dexie) for all data — no network needed for data.
// We only need to cache the app shell (HTML + JS + CSS) to load the UI offline.

const CACHE_NAME = 'one-timer-v1';

// On install: skip waiting so this SW activates immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// On activate: clean up old caches and claim all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;

  // Skip Next.js internal data routes and API routes
  if (url.pathname.startsWith('/_next/data/') || url.pathname.startsWith('/api/')) return;

  // --- Cache-first for Next.js static assets ---
  // These files are content-hashed, so they are safe to cache indefinitely.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // --- Network-first for HTML navigation requests ---
  // Try network first so users always get fresh HTML when online.
  // On failure (offline), serve the cached shell so Android never shows "You're offline".
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Cache the HTML shell under the canonical key '/'
            caches.open(CACHE_NAME).then((cache) => cache.put('/', response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches.match('/').then((cached) => {
            if (cached) return cached;
            // Absolute last resort — redirect to itself once the SW has a shell cached
            return new Response(
              '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="2"><title>1timer</title></head><body></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          })
        )
    );
    return;
  }

  // --- Stale-while-revalidate for everything else (icons, manifest, fonts) ---
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
