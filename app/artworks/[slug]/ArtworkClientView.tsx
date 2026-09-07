'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Artwork } from '@/types/gallery';
import { artistData } from '@/data/gallery-data';
import { useFavorites } from '@/hooks/useFavorites';
import { ArtworkZoomViewer } from '@/components/viewer/ArtworkZoomViewer';
import { ArtworkFullscreen } from '@/components/viewer/ArtworkFullscreen';
import { CloseUpDetails } from '@/components/viewer/CloseUpDetails';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  Sparkles,
  Share2,
  Check,
  Heart,
} from 'lucide-react';

interface ArtworkClientViewProps {
  artwork: Artwork;
  allArtworks: Artwork[];
}

export const ArtworkClientView: React.FC<ArtworkClientViewProps> = ({
  artwork,
  allArtworks,
}) => {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isCloseUpOpen, setIsCloseUpOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartX = React.useRef<number | null>(null);

  const currentIndex = allArtworks.findIndex((a) => a.id === artwork.id);
  const prevArtwork =
    currentIndex > 0 ? allArtworks[currentIndex - 1] : allArtworks[allArtworks.length - 1];
  const nextArtwork =
    currentIndex < allArtworks.length - 1 ? allArtworks[currentIndex + 1] : allArtworks[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 60) {
      if (deltaX > 0) {
        router.push(`/artworks/${prevArtwork.slug}`);
      } else {
        router.push(`/artworks/${nextArtwork.slug}`);
      }
    }
    touchStartX.current = null;
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${artwork.title} — ${artistData.name}`,
          text: `Zobacz dzieło „${artwork.title}” w prywatnej galerii sztuki.`,
          url: shareUrl,
        });
        return;
      } catch {
        // Ignored
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {}
  };

  return (
    <div
      className="min-h-screen bg-[#0B0B0B] text-[#F2F0EA] flex flex-col justify-between"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2927] px-5 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Powrót do wystawy</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 border border-[#2A2927] hover:border-[#C5A880] px-3.5 py-1.5 rounded-full text-xs text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
              aria-label="Udostępnij dzieło"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="text-[#C5A880]">Skopiowano link</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#AAA69D]" />
                  <span className="hidden sm:inline">Udostępnij</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleFavorite(artwork.id)}
              className={`p-2 rounded-full border border-[#2A2927] hover:border-[#C5A880] transition-colors ${
                isFavorite(artwork.id) ? 'text-[#C5A880] border-[#C5A880]' : 'text-[#AAA69D]'
              }`}
              title={isFavorite(artwork.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
              aria-label="Ulubione"
            >
              <Heart className={`w-4 h-4 ${isFavorite(artwork.id) ? 'fill-[#C5A880]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Artwork Stage */}
      <main className="max-w-7xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-16 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Canvas Display */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full border border-[#2A2927] p-3 sm:p-4 bg-[#111111] shadow-2xl">
              <div
                className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#0B0B0B] cursor-zoom-in"
                onClick={() => setIsZoomOpen(true)}
                title="Kliknij, aby przybliżyć pociągnięcia pędzla"
              >
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  priority
                  quality={95}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-contain hover:scale-[1.01] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Toolbar */}
              <div className="mt-3 pt-3 border-t border-[#2A2927] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="inline-flex items-center gap-1.5 border border-[#2A2927] hover:border-[#C5A880] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Pełny ekran</span>
                  </button>

                  <button
                    onClick={() => setIsZoomOpen(true)}
                    className="inline-flex items-center gap-1.5 border border-[#2A2927] hover:border-[#C5A880] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Zoom</span>
                  </button>

                  {artwork.details && artwork.details.length > 0 && (
                    <button
                      onClick={() => setIsCloseUpOpen(true)}
                      className="inline-flex items-center gap-1.5 border border-[#C5A880]/50 hover:border-[#C5A880] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#C5A880] transition-colors bg-[#C5A880]/5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Przyjrzyj się bliżej</span>
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-[#777]">
                  {currentIndex + 1} z {allArtworks.length} dzieł
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Metas, Stories & Detail Studies */}
          <div className="lg:col-span-5 space-y-8">
            {/* 1. TYTUŁ, 2. ROK, 3. TECHNIKA, 4. WYMIARY */}
            <div className="space-y-4 border-b border-[#2A2927] pb-6">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
                {artwork.category}
              </span>

              <div>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#F2F0EA] font-light leading-[1.12]">
                  {artwork.title}
                </h1>
                <p className="text-sm text-[#AAA69D] font-light mt-1.5">
                  {artwork.year}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-[#2A2927]/60">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#777] block">
                    Technika wykonania
                  </span>
                  <span className="text-[#F2F0EA] text-xs font-light mt-0.5 block font-serif-luxury italic">
                    {artwork.medium.replace(/\s*\[.*?\]/, '')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#777] block">
                    Format płótna
                  </span>
                  <span className="text-[#F2F0EA] text-xs font-light mt-0.5 block font-mono">
                    {artwork.width} × {artwork.height} cm
                  </span>
                </div>
              </div>
            </div>

            {/* 5. O DZIELE */}
            <div className="space-y-2.5">
              <h2 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                <span>O dziele</span>
              </h2>
              <p className="text-sm text-[#AAA69D] leading-relaxed font-light">
                {artwork.description}
              </p>
            </div>

            {/* 6. HISTORIA OBRAZU */}
            {artwork.story && (
              <div className="space-y-4 border-t border-[#2A2927] pt-6">
                <h2 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                  <span>Historia obrazu</span>
                </h2>

                {artwork.story.origin && (
                  <div className="text-xs space-y-1">
                    <span className="text-[#888] uppercase tracking-wider block text-[10px]">
                      Geneza i pracownia
                    </span>
                    <p className="text-[#AAA69D] leading-relaxed font-light">
                      {artwork.story.origin}
                    </p>
                  </div>
                )}

                {artwork.story.meaning && (
                  <div className="text-xs space-y-1">
                    <span className="text-[#888] uppercase tracking-wider block text-[10px]">
                      Kontekst artystyczny
                    </span>
                    <p className="text-[#AAA69D] leading-relaxed font-light">
                      {artwork.story.meaning}
                    </p>
                  </div>
                )}

                {artwork.story.curatorialNote && (
                  <div className="border-l-2 border-[#C5A880]/40 pl-3.5 py-1 mt-2 bg-[#111111]/30">
                    <p className="font-serif-luxury text-sm italic text-[#AAA69D]">
                      {artwork.story.curatorialNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 7. DETAIL STORY (STUDIUM DETALU) */}
            {artwork.details && artwork.details.length > 0 && (
              <div className="space-y-6 border-t border-[#2A2927] pt-6">
                <h2 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Studium detalu • Analiza kuratorska</span>
                </h2>

                <div className="space-y-6">
                  {artwork.details.map((detail, idx) => (
                    <div
                      key={detail.id}
                      className="border border-[#2A2927] p-3 bg-[#111111] group cursor-pointer hover:border-[#C5A880]/60 transition-colors"
                      onClick={() => setIsCloseUpOpen(true)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-[#C5A880] tracking-widest uppercase">
                          Detal {idx === 0 ? 'I' : idx === 1 ? 'II' : 'III'}
                        </span>
                        <span className="text-[10px] text-[#777] uppercase tracking-wider group-hover:text-[#C5A880] transition-colors">
                          Przyjrzyj się bliżej →
                        </span>
                      </div>

                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#0B0B0B] mb-3">
                        <Image
                          src={detail.image}
                          alt={detail.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <h3 className="font-serif-luxury text-base text-[#F2F0EA] mb-1 font-normal">
                        „{detail.title}”
                      </h3>
                      <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                        {detail.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Prev / Next Navigation */}
      <footer className="sticky bottom-0 z-30 bg-[#0B0B0B]/95 backdrop-blur-md border-t border-[#2A2927] px-5 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href={`/artworks/${prevArtwork.slug}`}
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#C5A880] group-hover:-translate-x-1 transition-transform" />
            <div className="text-left hidden sm:block">
              <span className="text-[9px] text-[#777] block">Poprzednie</span>
              <span className="font-serif-luxury text-sm text-[#F2F0EA]">
                {prevArtwork.title}
              </span>
            </div>
            <span className="sm:hidden">Poprzednie</span>
          </Link>

          <Link
            href={`/artworks/${nextArtwork.slug}`}
            className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
          >
            <div className="text-right hidden sm:block">
              <span className="text-[9px] text-[#777] block">Następne</span>
              <span className="font-serif-luxury text-sm text-[#F2F0EA]">
                {nextArtwork.title}
              </span>
            </div>
            <span className="sm:hidden">Następne</span>
            <ChevronRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </footer>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <ArtworkFullscreen
          artwork={artwork}
          onClose={() => setIsFullscreen(false)}
          onPrevious={() => router.push(`/artworks/${prevArtwork.slug}`)}
          onNext={() => router.push(`/artworks/${nextArtwork.slug}`)}
        />
      )}

      {/* Zoom Inspector Modal */}
      {isZoomOpen && (
        <ArtworkZoomViewer
          artwork={artwork}
          onClose={() => setIsZoomOpen(false)}
        />
      )}

      {/* Close-Up Study Modal */}
      {isCloseUpOpen && (
        <CloseUpDetails
          artwork={artwork}
          onClose={() => setIsCloseUpOpen(false)}
        />
      )}
    </div>
  );
};
