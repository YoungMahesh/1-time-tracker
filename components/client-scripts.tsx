"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Register from a client effect (runs reliably on mount) instead of
    // next/script afterInteractive, which was not consistently injecting the
    // inline registration script — leaving the app with no service worker and
    // therefore no offline support.
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[v0] SW registration failed:", err);
    });
  }, []);

  return null;
}
