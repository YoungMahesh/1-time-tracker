'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  isSupported: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if navigator.onLine is available
    setIsSupported(typeof navigator !== 'undefined' && 'onLine' in navigator);
    
    // Set initial state
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Listen to online/offline events
    const handleOnline = () => {
      console.log('[v0] App is online');
      setIsOnline(true);
      // Suppress default browser offline UI
      document.documentElement.style.display = 'auto';
    };

    const handleOffline = () => {
      console.log('[v0] App is offline');
      setIsOnline(false);
      // Suppress default browser offline UI
      document.documentElement.style.display = 'auto';
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, isSupported }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}
