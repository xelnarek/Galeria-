'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '@/types/gallery';
import { useOrientation } from '@/hooks/useOrientation';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  Sparkles,
  Share2,
  Check,
  Heart,
  ExternalLink,
} from 'lucide-react';

interface ArtworkModalOrViewProps {
  artwork: Artwork;
  allArtworks: Artwork[];
  onClose: () => void;
  onNavigate: (artwork: Artwork) => void;
  onOpenFullscreen: (artwork: Artwork) => void;
  onOpenZoom: (artwork: Artwork) => void;
  onOpenCloseUp: (artwork: Artwork) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const MUSEUM_EASE = [0.22, 1, 0.36, 1] as const;

export const ArtworkModalOrView: React.FC<ArtworkModalOrViewProps> = ({
  artwork,
  allArtworks,
  onClose,
  onNavigate,
  onOpenFullscreen,
  onOpenZoom,
  onOpenCloseUp,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isPortrait } = useOrientation();

  // Clean up copied timeout on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const currentIndex = allArtworks.findIndex((a) => a.id === artwork.id);
  const prevArtwork =
    currentIndex > 0 ? allArtworks[currentIndex - 1] : allArtworks[allArtworks.length - 1];
  const nextArtwork =
    currentIndex < allArtworks.length - 1 ? allArtworks[currentIndex + 1] : allArtworks[0];

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    onNavigate(prevArtwork);
  }, [onNavigate, prevArtwork]);

  const handleNext = useCallback(() => {
    setDirection(1);
    onNavigate(nextArtwork);
  }, [onNavigate, nextArtwork]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 55) {
      if (deltaX > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrevious, handleNext]);

  // Share handler
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/artworks/${artwork.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${artwork.title} — Kolekcja Prywatna`,
          text: `Zobacz dzieło malarskie „${artwork.title}” w prywatnej galerii online.`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      // Ignore
    }
  };

  return (
    <motion.div
      id="dedicated-artwork-view-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: MUSEUM_EASE }}
      className="fixed inset-0 z-50 bg-[#0B0B0B]/98 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Widok dzieła: ${artwork.title}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar with Minimal Curatorial Branding & Close */}
      <div className="sticky top-0 z-20 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2927] px-5 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#AAA69D]">
            Katalog Dzieł
          </span>
          <span className="text-[#2A2927]">•</span>
          <span className="text-[11px] text-[#C5A880] tracking-widest font-mono">
            {currentIndex + 1} / {allArtworks.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 border border-[#2A2927] hover:border-[#C5A880] px-3 py-1.5 rounded-full text-xs text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
            title="Udostępnij lub skopiuj link"
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
            onClick={onToggleFavorite}
            className={`p-2 rounded-full border border-[#2A2927] hover:border-[#C5A880] transition-colors ${
              isFavorite ? 'text-[#C5A880] border-[#C5A880] bg-[#C5A880]/10' : 'text-[#AAA69D]'
            }`}
            title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            aria-label="Ulubione"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#C5A880]' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 border border-[#2A2927] hover:border-[#F2F0EA] text-[#F2F0EA] transition-colors"
            title="Zamknij (Esc)"
            aria-label="Zamknij widok dzieła"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Layout: Two Columns on Desktop, Strictly Sequenced on Mobile */}
      <div className="max-w-7xl mx-auto w-full px-5 sm:px-10 py-6 sm:py-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* LEFT SIDE: Dominant Artwork Canvas (Natural Proportions, Smooth Crossfade & Scaling) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Mobile Index Indicator */}
            <div className="w-full flex lg:hidden items-center justify-between pb-3 text-xs text-[#AAA69D]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
                Dzieło w kolekcji
              </span>
              <span className="font-mono text-[11px] text-[#C5A880]">
                {String(currentIndex + 1).padStart(2, '0')} / {String(allArtworks.length).padStart(2, '0')}
              </span>
            </div>

            {/* Museum Wall Presentation with Smooth Orientation Adaptation */}
            <motion.div
              layout
              transition={{ duration: 0.9, ease: MUSEUM_EASE }}
              className="relative w-full border border-[#2A2927] p-2.5 sm:p-4 bg-[#111111] shadow-2xl overflow-hidden"
            >
              <div
                className={`relative w-full overflow-hidden bg-[#0B0B0B] cursor-zoom-in group transition-all ${
                  isPortrait ? 'aspect-[4/3] sm:aspect-[16/11]' : 'aspect-[16/10] sm:aspect-[16/11]'
                }`}
                onClick={() => onOpenZoom(artwork)}
                title="Kliknij, aby zbadać fakturę (Zoom)"
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={artwork.id}
                    initial={{
                      opacity: 0,
                      scale: 0.985,
                      x: direction * 12,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.01,
                      x: direction * -12,
                    }}
                    transition={{
                      duration: 0.9, // Authentic 900ms museum transition
                      ease: MUSEUM_EASE,
                    }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      priority
                      unoptimized
                      quality={98}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 850px"
                      className="object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Subtle zoom hint overlay on hover */}
                <div className="absolute bottom-3 right-3 bg-[#0B0B0B]/80 backdrop-blur-sm border border-[#2A2927] px-2.5 py-1 text-[10px] text-[#AAA69D] tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                  <ZoomIn className="w-3 h-3 text-[#C5A880]" />
                  <span>Zbliżenie</span>
                </div>
              </div>

              {/* Action Toolbar below painting */}
              <div className="mt-3 pt-3 border-t border-[#2A2927]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenFullscreen(artwork)}
                    className="inline-flex items-center gap-1.5 border border-[#2A2927] hover:border-[#C5A880] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Pełny ekran</span>
                  </button>

                  <button
                    onClick={() => onOpenZoom(artwork)}
                    className="inline-flex items-center gap-1.5 border border-[#2A2927] hover:border-[#C5A880] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Zoom faktury</span>
                  </button>

                  {artwork.details && artwork.details.length > 0 && (
                    <button
                      onClick={() => onOpenCloseUp(artwork)}
                      className="inline-flex items-center gap-1.5 border border-[#C5A880]/50 hover:border-[#C5A880] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#C5A880] transition-colors bg-[#C5A880]/5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Detale ({artwork.details.length})</span>
                    </button>
                  )}
                </div>

                <a
                  href={`/artworks/${artwork.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#777] hover:text-[#AAA69D] inline-flex items-center gap-1 transition-colors"
                  title="Otwórz na dedykowanej podstronie"
                >
                  <span>Dedykowany link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Curatorial Information & Monograph Details with Paced Transitions */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={`meta-${artwork.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.8, ease: MUSEUM_EASE }}
                className="space-y-7"
              >
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
                  <h3 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                    <span>O dziele</span>
                  </h3>
                  <p className="text-sm text-[#AAA69D] leading-relaxed font-light">
                    {artwork.description}
                  </p>
                </div>

                {/* 6. HISTORIA OBRAZU */}
                {artwork.story && (
                  <div className="space-y-4 border-t border-[#2A2927] pt-6">
                    <h3 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                      <span>Historia obrazu</span>
                    </h3>

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

                {/* 7. DETAIL STUDY */}
                {artwork.details && artwork.details.length > 0 && (
                  <div className="space-y-5 border-t border-[#2A2927] pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Studium detalu • Analiza kuratorska</span>
                      </h3>
                    </div>

                    <div className="space-y-5">
                      {artwork.details.map((detail, idx) => (
                        <div
                          key={detail.id}
                          className="border border-[#2A2927] p-3 bg-[#111111] group cursor-pointer hover:border-[#C5A880]/60 transition-colors"
                          onClick={() => onOpenCloseUp(artwork)}
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
                              unoptimized
                              sizes="(max-width: 768px) 100vw, 400px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <h4 className="font-serif-luxury text-base text-[#F2F0EA] mb-1 font-normal">
                            „{detail.title}”
                          </h4>
                          <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                            {detail.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Navigation: ← POPRZEDNIE, NASTĘPNE → */}
      <div className="sticky bottom-0 z-20 bg-[#0B0B0B]/95 backdrop-blur-md border-t border-[#2A2927] px-5 sm:px-10 py-4 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
          aria-label={`Poprzednie dzieło: ${prevArtwork.title}`}
        >
          <ChevronLeft className="w-4 h-4 text-[#C5A880] group-hover:-translate-x-1 transition-transform" />
          <div className="text-left hidden sm:block">
            <span className="text-[9px] text-[#777] block">Poprzednie</span>
            <span className="font-serif-luxury text-sm text-[#F2F0EA]">
              {prevArtwork.title}
            </span>
          </div>
          <span className="sm:hidden">Poprzednie</span>
        </button>

        <span className="text-[11px] text-[#777] hidden md:block">
          Nawiguj strzałkami klawiatury ← →
        </span>

        <button
          onClick={handleNext}
          className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
          aria-label={`Następne dzieło: ${nextArtwork.title}`}
        >
          <div className="text-right hidden sm:block">
            <span className="text-[9px] text-[#777] block">Następne</span>
            <span className="font-serif-luxury text-sm text-[#F2F0EA]">
              {nextArtwork.title}
            </span>
          </div>
          <span className="sm:hidden">Następne</span>
          <ChevronRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

