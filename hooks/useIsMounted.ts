'use client';

import { useSyncExternalStore } from 'react';

let isMountedGlobal = false;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  queueMicrotask(() => {
    isMountedGlobal = true;
    listeners.forEach((listener) => listener());
  });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  return isMountedGlobal;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

