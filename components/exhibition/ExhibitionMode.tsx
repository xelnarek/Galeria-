'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Artwork } from '@/types/gallery';
import { artistData, collectionData } from '@/data/gallery-data';
import { useExhibitionMemory } from '@/hooks/useExhibitionMemory';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';

interface ExhibitionModeProps {
  artworks: Artwork[];
  onClose: () => void;
  initialIndex?: number;
}

export const ExhibitionMode: React.FC<ExhibitionModeProps> = ({
  artworks,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isPureCanvas, setIsPureCanvas] = useState<boolean>(false); // Czysty obraz: no UI overlays
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(10); // 10s contemplative museum pace

  const touchStartXRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { recordVisit } = useExhibitionMemory();
  const currentArtwork = artworks[currentIndex];

  // Record visited artwork
  useEffect(() => {
    if (currentArtwork) {
      recordVisit(currentArtwork.id);
    }
  }, [currentArtwork, recordVisit]);

  const resetControlsTimeout = useCallback(() => {
    if (isPureCanvas) return;
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3200);
  }, [isPureCanvas]);

  // Handle Next Artwork
  const handleNext = useCallback(() => {
    if (currentIndex < artworks.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the end of the exhibition!
      setIsFinished(true);
      setIsPlaying(false);
    }
  }, [currentIndex, artworks.length]);

  // Handle Previous Artwork
  const handlePrevious = useCallback(() => {
    if (isFinished) {
      setIsFinished(false);
      setCurrentIndex(artworks.length - 1);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(artworks.length - 1);
    }
  }, [currentIndex, isFinished, artworks.length]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    resetControlsTimeout();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;

    // Minimum swipe threshold: 50px
    if (deltaX > 50) {
      handlePrevious();
    } else if (deltaX < -50) {
      handleNext();
    }
    touchStartXRef.current = null;
  };

  // Restart Exhibition
  const handleRestart = useCallback(() => {
    setIsFinished(false);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
      if (e.key === 'i' || e.key === 'I') setShowInfo((prev) => !prev);
      if (e.key === 'h' || e.key === 'H') setIsPureCanvas((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrevious, resetControlsTimeout]);

  // Autoplay loop (strictly user-initiated, contemplative pace)
  useEffect(() => {
    if (isPlaying && !isFinished) {
      autoplayTimerRef.current = setTimeout(() => {
        handleNext();
      }, intervalSeconds * 1000);
    }

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isPlaying, currentIndex, isFinished, intervalSeconds, handleNext]);

  return (
    <div
      id="exhibition-mode-container"
      className="fixed inset-0 z-50 bg-[#070707] text-[#F2F0EA] flex flex-col justify-between select-none overflow-hidden cursor-default"
      onMouseMove={resetControlsTimeout}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (isPureCanvas) setIsPureCanvas(false);
      }}
    >
      {/* FINAL SCREEN OF EXHIBITION (FINAŁ WYSTAWY) */}
      {isFinished ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-2xl mx-auto animate-fade-in">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 border border-[#2A2927] hover:border-[#F2F0EA] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
            aria-label="Zamknij wystawę"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] tracking-[0.35em] uppercase text-[#C5A880] mb-4">
            Zakończenie ekspozycji
          </span>

          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-light text-[#F2F0EA] leading-tight mb-6">
            Dziękujemy za przejście całej wystawy.
          </h2>

          <div className="w-16 h-[1px] bg-[#C5A880]/60 my-6" />

          <p className="font-serif-luxury text-2xl text-[#F2F0EA] font-normal">
            {artistData.name}
          </p>

          <p className="text-xs uppercase tracking-[0.25em] text-[#AAA69D] mt-2">
            Prywatna kolekcja malarstwa
          </p>

          <p className="font-serif-luxury text-base italic text-[#C5A880] mt-6 max-w-md">
            „{collectionData.giftDedication}”
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-12">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 border border-[#C5A880] bg-[#161616] hover:bg-[#C5A880]/15 px-6 py-3 text-xs tracking-[0.25em] uppercase text-[#F2F0EA] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Oglądaj od początku</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 border border-[#2A2927] hover:border-[#F2F0EA] px-6 py-3 text-xs tracking-[0.25em] uppercase text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
            >
              <span>Wróć do katalogu</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Museum Artwork Viewport with Subtle Breathing Scale Animation */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-10">
            <div className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  key={currentArtwork.id}
                  src={currentArtwork.image}
                  alt={currentArtwork.title}
                  fill
                  priority
                  quality={95}
                  sizes="100vw"
                  className="object-contain transition-all duration-1000 ease-out animate-fade-in"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Floating Minimal Controls (Fades out automatically or toggled in Pure Canvas) */}
          {!isPureCanvas && (
            <div
              className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-5 sm:p-8 transition-opacity duration-500 ${
                controlsVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880]">
                    Wystawa Wirtualna
                  </span>
                  <span className="text-[#2A2927]">•</span>
                  <span className="text-xs text-[#AAA69D] tracking-widest font-mono">
                    {currentIndex + 1} / {artworks.length}
                  </span>
                </div>

                {/* Top Controls: Autoplay + Speed + Pure Canvas + Info + Close */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs tracking-wider uppercase transition-colors ${
                      isPlaying
                        ? 'border-[#C5A880] text-[#C5A880] bg-[#161616]'
                        : 'border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] bg-[#111111]/80'
                    }`}
                    title={isPlaying ? 'Zatrzymaj autoplay (Spacja)' : 'Włącz automatyczną wystawę (Spacja)'}
                    aria-label={isPlaying ? 'Zatrzymaj pokaz' : 'Uruchom automatyczny pokaz'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-[#C5A880]" />
                        <span className="hidden sm:inline">Pauza ({intervalSeconds}s)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span className="hidden sm:inline">Autoplay</span>
                      </>
                    )}
                  </button>

                  {isPlaying && (
                    <button
                      onClick={() => setIntervalSeconds((prev) => (prev === 10 ? 14 : prev === 14 ? 8 : 10))}
                      className="p-1.5 border border-[#2A2927] text-[10px] text-[#AAA69D] hover:text-[#F2F0EA] bg-[#111111]/80"
                      title="Zmień tempo (8s / 10s / 14s)"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => setIsPureCanvas(true)}
                    className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors bg-[#111111]/80"
                    title="Czysty obraz — ukryj wszystkie elementy interfejsu (Klawisz H)"
                    aria-label="Czysty obraz"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-[#C5A880]" />
                  </button>

                  <button
                    onClick={() => setShowInfo((prev) => !prev)}
                    className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors bg-[#111111]/80"
                    title="Włącz/wyłącz opis (I)"
                    aria-label="Pokaż lub ukryj opis dzieła"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 border border-[#2A2927] hover:border-[#F2F0EA] text-[#F2F0EA] transition-colors bg-[#111111]/80"
                    title="Zamknij wystawę (Esc)"
                    aria-label="Zamknij wystawę"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lateral Navigation Controls */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <button
                  onClick={handlePrevious}
                  className="p-3 sm:p-4 bg-[#111111]/80 backdrop-blur-md border border-[#2A2927] hover:border-[#C5A880] text-[#F2F0EA] transition-all hover:scale-105"
                  title="Poprzednie dzieło (←)"
                  aria-label="Poprzednie dzieło"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880]" />
                </button>

                <button
                  onClick={handleNext}
                  className="p-3 sm:p-4 bg-[#111111]/80 backdrop-blur-md border border-[#2A2927] hover:border-[#C5A880] text-[#F2F0EA] transition-all hover:scale-105"
                  title="Następne dzieło (→)"
                  aria-label="Następne dzieło"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880]" />
                </button>
              </div>

              {/* Bottom Caption Plaque */}
              <div className="pointer-events-auto flex justify-center">
                {showInfo && (
                  <div className="bg-[#111111]/90 backdrop-blur-md border border-[#2A2927] px-6 sm:px-10 py-3 sm:py-4 max-w-xl text-center shadow-2xl transition-all">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A880] block mb-0.5">
                      {currentArtwork.category}
                    </span>
                    <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#F2F0EA]">
                      {currentArtwork.title}
                    </h3>
                    <p className="text-xs text-[#AAA69D] mt-1 font-serif-luxury italic">
                      {currentArtwork.year} • {currentArtwork.medium.replace(/\s*\[.*?\]/, '')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subtle reminder when in Pure Canvas mode */}
          {isPureCanvas && (
            <div className="absolute top-4 right-4 z-40 bg-[#111111]/70 backdrop-blur-sm border border-[#2A2927] px-3 py-1.5 text-[10px] text-[#AAA69D] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Eye className="w-3 h-3 text-[#C5A880]" />
              <span>Czysty obraz • Kliknij lub wciśnij H, aby przywrócić menu</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
