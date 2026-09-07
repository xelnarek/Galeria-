'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getClientSnapshot(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
    ? navigator.onLine
    : true;
}

function getServerSnapshot(): boolean {
  return true;
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
