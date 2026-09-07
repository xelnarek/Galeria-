'use client';

import React, { useState } from 'react';
import { Artwork } from '@/types/gallery';
import { useFavorites } from '@/hooks/useFavorites';
import { useGalleryData } from '@/hooks/useGalleryData';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroExhibition } from '@/components/home/HeroExhibition';
import { EditorialGallery } from '@/components/gallery/EditorialGallery';
import { ArtistSection } from '@/components/artist/ArtistSection';
import { AboutCollectionSection } from '@/components/collection/AboutCollectionSection';
import { ArtworkStories } from '@/components/stories/ArtworkStories';
import { ArtworkModalOrView } from '@/components/artwork/ArtworkModalOrView';
import { ArtworkFullscreen } from '@/components/viewer/ArtworkFullscreen';
import { ArtworkZoomViewer } from '@/components/viewer/ArtworkZoomViewer';
import { CloseUpDetails } from '@/components/viewer/CloseUpDetails';
import { ExhibitionMode } from '@/components/exhibition/ExhibitionMode';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { PWARegister } from '@/components/pwa/PWARegister';

export default function HomePage() {
  const { artworks, artist, collection } = useGalleryData({ forStudio: false });
  const { favorites, isFavorite, toggleFavorite, count: favoritesCount } = useFavorites();

  // Active modal views
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [fullscreenArtwork, setFullscreenArtwork] = useState<Artwork | null>(null);
  const [zoomArtwork, setZoomArtwork] = useState<Artwork | null>(null);
  const [closeUpArtwork, setCloseUpArtwork] = useState<Artwork | null>(null);
  const [isExhibitionOpen, setIsExhibitionOpen] = useState(false);

  // Handlers for fullscreen next/prev
  const handleFullscreenNavigate = (direction: 'next' | 'prev') => {
    if (!fullscreenArtwork || artworks.length === 0) return;
    const currentIndex = artworks.findIndex((a) => a.id === fullscreenArtwork.id);
    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % artworks.length;
      setFullscreenArtwork(artworks[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + artworks.length) % artworks.length;
      setFullscreenArtwork(artworks[prevIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F2F0EA] selection:bg-[#2A2927] selection:text-[#F2F0EA]">
      {/* Service Worker Auto-Registration */}
      <PWARegister />

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Main Top Navigation */}
      <Navbar
        onOpenExhibition={() => setIsExhibitionOpen(true)}
        favoritesCount={favoritesCount}
        artistName={artist.name}
      />

      <main className="relative">
        {/* 1. Hero First Impression: One key artwork displayed with solemn grandeur */}
        <HeroExhibition
          artworks={artworks}
          artist={artist}
          collection={collection}
          onOpenArtwork={(artwork) => setSelectedArtwork(artwork)}
          onOpenExhibition={() => setIsExhibitionOpen(true)}
        />

        {/* 2. Editorial Gallery Layout: Asymmetrical, spacious, title & year only */}
        <EditorialGallery
          artworks={artworks}
          onSelectArtwork={(artwork) => setSelectedArtwork(artwork)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />

        {/* 3. Stories from Studio & Canvases */}
        <ArtworkStories
          artworks={artworks}
          onSelectArtwork={(artwork) => setSelectedArtwork(artwork)}
        />

        {/* 4. Section: O Artyście (Portrait, bio, statement about painting) */}
        <ArtistSection artist={artist} collection={collection} />

        {/* 5. Section: O Kolekcji (The daughter's gift to her father) */}
        <AboutCollectionSection collection={collection} artworks={artworks} />
      </main>

      {/* Footer with Catalog Credits */}
      <Footer />

      {/* DEDICATED ARTWORK VIEW */}
      {selectedArtwork && (
        <ArtworkModalOrView
          artwork={selectedArtwork}
          allArtworks={artworks}
          onClose={() => setSelectedArtwork(null)}
          onNavigate={(artwork) => setSelectedArtwork(artwork)}
          onOpenFullscreen={(artwork) => setFullscreenArtwork(artwork)}
          onOpenZoom={(artwork) => setZoomArtwork(artwork)}
          onOpenCloseUp={(artwork) => setCloseUpArtwork(artwork)}
          isFavorite={isFavorite(selectedArtwork.id)}
          onToggleFavorite={() => toggleFavorite(selectedArtwork.id)}
        />
      )}

      {/* FULLSCREEN ARTWORK VIEWER */}
      {fullscreenArtwork && (
        <ArtworkFullscreen
          artwork={fullscreenArtwork}
          onClose={() => setFullscreenArtwork(null)}
          onPrevious={() => handleFullscreenNavigate('prev')}
          onNext={() => handleFullscreenNavigate('next')}
        />
      )}

      {/* ZOOM / SURFACE INSPECTION VIEWER */}
      {zoomArtwork && (
        <ArtworkZoomViewer
          artwork={zoomArtwork}
          onClose={() => setZoomArtwork(null)}
        />
      )}

      {/* CLOSE-UP DETAILS VIEWER (Przyjrzyj się bliżej) */}
      {closeUpArtwork && (
        <CloseUpDetails
          artwork={closeUpArtwork}
          onClose={() => setCloseUpArtwork(null)}
        />
      )}

      {/* EXHIBITION MODE (Rozpocznij wystawę with gentle transitions & final screen) */}
      {isExhibitionOpen && (
        <ExhibitionMode
          artworks={artworks}
          onClose={() => setIsExhibitionOpen(false)}
        />
      )}
    </div>
  );
}
