"use client";

import Script from "next/script";

export function ThemeInitialization() {
  return (
    <Script
      id="theme-initialization"
      dangerouslySetInnerHTML={{
        __html: `
        (function() {
          var theme = localStorage.getItem('theme');
          if (theme === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
          }
        })();
      `,
      }}
    />
  );
}

export function ServiceWorkerRegistration() {
  return (
    <Script
      id="service-worker-registration"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
              console.log('[v0] Service Worker registered successfully');
            }).catch(function(error) {
              console.error('[v0] Service Worker registration failed:', error);
            });
          });
        }
        
        // Suppress default browser offline UI
        window.addEventListener('offline', function() {
          if (document.documentElement) {
            document.documentElement.style.display = 'auto';
          }
        }, true);
      `,
      }}
    />
  );
}
