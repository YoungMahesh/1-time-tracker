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