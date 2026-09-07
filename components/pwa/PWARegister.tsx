'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('✓ PWA Service Worker registered:', reg.scope);
          
          // Check for updates periodically
          setInterval(() => {
            reg.update();
          }, 60000); // Check every minute
        })
        .catch((err) => {
          console.warn('✗ PWA Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
