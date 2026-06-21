import { generateSW } from 'workbox-build';

async function build() {
  const { count, size, warnings } = await generateSW({
    swDest: './public/sw.js',
    globDirectory: '.next',
    globPatterns: [
      'static/**/*.{js,css}',
      'app/**/*.{js,css,html}',
    ],
    globIgnores: [
      '**/node_modules/**',
      '**/server/**',
    ],
    skipWaiting: true,
    clientsClaim: true,
    navigateFallback: '/',
    navigateFallbackDenylist: [/^\/api\//],
    // Enhanced caching strategies for offline support
    runtimeCaching: [
      {
        // Cache static assets (images, fonts, etc.)
        urlPattern: /^\/.*\.(png|jpg|jpeg|svg|gif|webp|woff|woff2)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        // Network-first for any other requests, fallback to cache
        urlPattern: /^(?!.*\.(?:png|jpg|jpeg|svg|gif|webp|woff|woff2)$).*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'dynamic',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
        },
      },
    ],
  });

  if (warnings.length > 0) {
    for (const warning of warnings) {
      console.warn('Workbox warning:', warning);
    }
  }

  console.log(`Generated service worker with ${count} precached entries (${size} bytes)`);
}

build().catch((error) => {
  console.error('Failed to generate service worker:', error);
  process.exit(1);
});
