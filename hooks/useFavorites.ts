'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsMounted } from '@/hooks/useIsMounted';

const STORAGE_KEY = 'private_gallery_favorites_v1';
const FAVORITES_EVENT = 'gallery_favorites_updated';

export function useFavorites() {
  const isMounted = useIsMounted();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const currentJson = localStorage.getItem(STORAGE_KEY);
        if (currentJson) {
          const parsed = JSON.parse(currentJson);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
            return;
          }
        }
        setFavorites([]);
      } catch {
        setFavorites([]);
      }
    };

    loadFavorites();

    const handleStorageEvent = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(FAVORITES_EVENT, handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(FAVORITES_EVENT, handleStorageEvent);
    };
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    try {
      const currentJson = localStorage.getItem(STORAGE_KEY) || '[]';
      const currentList: string[] = JSON.parse(currentJson);
      const nextList = currentList.includes(id)
        ? currentList.filter((item) => item !== id)
        : [...currentList, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      setFavorites(nextList);
      window.dispatchEvent(new Event(FAVORITES_EVENT));
    } catch {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
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

