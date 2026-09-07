'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';

const STORAGE_KEY = 'private_gallery_favorites_v1';
const FAVORITES_EVENT = 'gallery_favorites_updated';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(FAVORITES_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(FAVORITES_EVENT, callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot(): string {
  return '[]';
}

export function useFavorites() {
  const isMounted = useIsMounted();
  const favoritesJson = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const storedFavorites = useMemo<string[]>(() => {
    try {
      return JSON.parse(favoritesJson);
    } catch {
      return [];
    }
  }, [favoritesJson]);

  const favorites = useMemo(() => {
    return isMounted ? storedFavorites : [];
  }, [isMounted, storedFavorites]);

  const toggleFavorite = useCallback((id: string) => {
    try {
      const currentJson = localStorage.getItem(STORAGE_KEY) || '[]';
      const currentList: string[] = JSON.parse(currentJson);
      const nextList = currentList.includes(id)
        ? currentList.filter((item) => item !== id)
        : [...currentList, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new Event(FAVORITES_EVENT));
    } catch {
      // Ignore storage errors in restricted iframe/incognito
    }
  }, []);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.includes(id);
    },
    [favorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    count: favorites.length,
    isMounted,
  };
}
