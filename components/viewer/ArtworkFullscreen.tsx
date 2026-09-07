'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Artwork } from '@/types/gallery';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface ArtworkFullscreenProps {
  artwork: Artwork;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const ArtworkFullscreen: React.FC<ArtworkFullscreenProps> = ({
  artwork,
  onClose,
  onPrevious,
  onNext,
}) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimeout = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2800);
  }, []);

  useEffect(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2800);
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [artwork]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'i' || e.key === 'I') setShowInfo((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, resetControlsTimeout]);

  return (
    <div
      id="artwork-fullscreen-overlay"
      className="fixed inset-0 z-50 bg-[#0B0B0B] flex items-center justify-center cursor-default overflow-hidden"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      {/* Immersive Image Display */}
      <div className="relative w-screen h-screen flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full h-full max-w-6xl max-h-[92vh]">
          <Image
            src={artwork.image}
            alt={artwork.title}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-contain transition-opacity duration-700 select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Floating Controls Overlay (Fades out automatically) */}
      <div
        className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-5 sm:p-8 transition-opacity duration-500 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#AAA69D]">
              Tryb Pełnoekranowy
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo((prev) => !prev);
              }}
              className="p-2.5 rounded-full bg-[#111111]/80 backdrop-blur-md border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
              title="Przełącz informacje o dziele (I)"
              aria-label="Informacje o dziele"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2.5 rounded-full bg-[#111111]/80 backdrop-blur-md border border-[#2A2927] hover:border-[#C5A880] text-[#F2F0EA] transition-colors"
              title="Zamknij pełny ekran (Esc)"
              aria-label="Zamknij pełny ekran"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Side Navigation Arrows */}
        <div className="flex items-center justify-between w-full pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="p-3 sm:p-4 rounded-full bg-[#111111]/70 backdrop-blur-md border border-[#2A2927] hover:border-[#C5A880] text-[#F2F0EA] transition-all hover:scale-105"
            title="Poprzednie dzieło (Strzałka w lewo)"
            aria-label="Poprzednie dzieło"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="p-3 sm:p-4 rounded-full bg-[#111111]/70 backdrop-blur-md border border-[#2A2927] hover:border-[#C5A880] text-[#F2F0EA] transition-all hover:scale-105"
            title="Następne dzieło (Strzałka w prawo)"
            aria-label="Następne dzieło"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880]" />
          </button>
        </div>

        {/* Bottom Artwork Info Plaque */}
        <div className="pointer-events-auto flex justify-center">
          {showInfo && (
            <div className="bg-[#111111]/85 backdrop-blur-md border border-[#2A2927] px-6 py-3 max-w-md text-center animate-fade-in shadow-2xl">
              <h4 className="font-serif-luxury text-lg text-[#F2F0EA]">
                {artwork.title}
              </h4>
              <p className="text-[11px] text-[#AAA69D] mt-0.5 tracking-wider">
                {artwork.year} • {artwork.medium} ({artwork.width} × {artwork.height} cm)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
