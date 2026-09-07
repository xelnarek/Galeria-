'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Artwork, Artist, CollectionInfo } from '@/types/gallery';
import { galleryRepository } from '@/lib/repository/galleryRepository';
import { artworksData, artistData, collectionData } from '@/data/gallery-data';

interface UseGalleryDataOptions {
  includeDrafts?: boolean;
  includeHidden?: boolean;
  forStudio?: boolean;
}

export function useGalleryData(options: UseGalleryDataOptions = {}) {
  const { forStudio = false, includeDrafts = false, includeHidden = false } = options;

  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    if (!Array.isArray(artworksData)) return [];
    if (forStudio) return artworksData;
    return artworksData.filter((a) => (a.status || 'published') === 'published');
  });
  const [artist, setArtist] = useState<Artist>(artistData || {});
  const [collection, setCollection] = useState<CollectionInfo>(collectionData || {});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTriggerRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    let isSubscribed = true;

    const executeFetch = async () => {
      try {
        const [arts, artst, col] = await Promise.all([
          forStudio
            ? galleryRepository.getAllArtworksForStudio()
            : galleryRepository.getArtworks({ includeDrafts, includeHidden }),
          galleryRepository.getArtist(),
          galleryRepository.getCollectionInfo(),
        ]);

        if (isSubscribed) {
          setArtworks(Array.isArray(arts) ? arts : []);
          setArtist(artst || artistData || {});
          setCollection(col || collectionData || {});
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('useGalleryData error:', err);
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchTriggerRef.current = executeFetch;
    executeFetch();

    const handleDataUpdated = () => {
      executeFetch();
    };

    window.addEventListener('gallery_data_updated', handleDataUpdated);
    return () => {
      isSubscribed = false;
      window.removeEventListener('gallery_data_updated', handleDataUpdated);
    };
  }, [forStudio, includeDrafts, includeHidden]);

  const refresh = useCallback(async () => {
    await fetchTriggerRef.current();
  }, []);

  const featuredArtwork = Array.isArray(artworks)
    ? (artworks.find((a) => a.featured) || artworks[0] || null)
    : null;

  return {
    artworks,
    artist,
    collection,
    featuredArtwork,
    isLoading,
    refresh,
  };
}
