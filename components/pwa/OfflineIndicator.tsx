'use client';

import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useIsMounted } from '@/hooks/useIsMounted';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isMounted = useIsMounted();
  const isOnline = useOnlineStatus();

  if (!isMounted || isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2.5 border border-[#2A2927] bg-[#161616]/95 backdrop-blur-md px-4 py-2.5 shadow-2xl text-xs text-[#AAA69D] rounded transition-opacity duration-300"
      role="status"
      aria-live="polite"
      aria-label="Aplikacja pracuje w trybie offline"
    >
      <WifiOff className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
      <span>Tryb offline — kolekcja wyświetlana z pamięci podręcznej.</span>
    </div>
  );
};
