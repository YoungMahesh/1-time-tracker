'use client';

import { useOffline } from '@/lib/context/offline-context';
import { useEffect, useState } from 'react';

/**
 * Optional: Visual indicator showing offline status
 * Can be added to your app to show users they're working offline
 * Minimal, non-intrusive design
 */
export function OfflineStatus() {
  const { isOnline } = useOffline();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Only show when offline
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 px-3 py-2 bg-amber-500 text-amber-950 text-sm rounded-md shadow-md flex items-center gap-2">
      <div className="w-2 h-2 bg-amber-950 rounded-full animate-pulse" />
      <span>Offline mode</span>
    </div>
  );
}
