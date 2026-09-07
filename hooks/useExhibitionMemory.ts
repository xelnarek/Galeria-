'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';
import { artworksData } from '@/data/gallery-data';
import { Artwork } from '@/types/gallery';

const STORAGE_KEY = 'gallery_exhibition_memory';
const MEMORY_EVENT = 'gallery_exhibition_memory_updated';

interface ExhibitionMemoryState {
  lastArtworkId: string | null;
  visitedIds: string[];
}

const DEFAULT_MEMORY_STATE: ExhibitionMemoryState = {
  lastArtworkId: null,
  visitedIds: [],
};

const DEFAULT_JSON = JSON.stringify(DEFAULT_MEMORY_STATE);

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(MEMORY_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(MEMORY_EVENT, callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_JSON;
  } catch {
    return DEFAULT_JSON;
  }
}

function getServerSnapshot(): string {
  return DEFAULT_JSON;
}

export function useExhibitionMemory() {
  const rawMemoryJson = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const memory = useMemo<ExhibitionMemoryState>(() => {
    try {
      const parsed = JSON.parse(rawMemoryJson);
      return {
        lastArtworkId: parsed.lastArtworkId || null,
        visitedIds: Array.isArray(parsed.visitedIds) ? parsed.visitedIds : [],
      };
    } catch {
      return DEFAULT_MEMORY_STATE;
    }
  }, [rawMemoryJson]);

  const recordVisit = useCallback((artworkId: string) => {
    try {
      const currentRaw = localStorage.getItem(STORAGE_KEY) || DEFAULT_JSON;
      let parsed: ExhibitionMemoryState;
      try {
        parsed = JSON.parse(currentRaw);
      } catch {
        parsed = { ...DEFAULT_MEMORY_STATE };
      }

      const updatedVisited = parsed.visitedIds?.includes(artworkId)
        ? parsed.visitedIds
        : [...(parsed.visitedIds || []), artworkId];

      const updated: ExhibitionMemoryState = {
        lastArtworkId: artworkId,
        visitedIds: updatedVisited,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(MEMORY_EVENT));
    } catch {
      // Storage fail ignored
    }
  }, []);

  const lastArtwork: Artwork | null = useMemo(() => {
    return memory.lastArtworkId
      ? artworksData.find((a) => a.id === memory.lastArtworkId) || null
      : null;
  }, [memory.lastArtworkId]);

  return {
    isLoaded: true,
    lastArtwork,
    visitedCount: memory.visitedIds.length,
    totalCount: artworksData.length,
    recordVisit,
  };
}
