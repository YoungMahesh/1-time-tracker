// The service worker (public/sw.js) is hand-crafted and checked into the repo.
// It uses a network-first + cache-fallback strategy so the app works fully offline
// without relying on a build-time asset manifest.
//
// This script is intentionally a no-op so the "build" npm script does not
// overwrite public/sw.js with a Workbox-generated file after next build.

console.log('Service worker is hand-crafted (public/sw.js) — no build step needed.');
