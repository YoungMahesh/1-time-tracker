"use client";

import Script from "next/script";

export function ThemeInitialization() {
  return (
    <Script
      id="theme-initialization"
      strategy="beforeInteractive"
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
            navigator.serviceWorker.register('/sw.js');
          });
        }
      `,
      }}
    />
  );
}
