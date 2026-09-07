'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '@/types/gallery';
import { artistData, collectionData } from '@/data/gallery-data';
import { useExhibitionMemory } from '@/hooks/useExhibitionMemory';
import { useOrientation } from '@/hooks/useOrientation';
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
  Compass,
  Sparkles,
  Quote,
  Layers,
  Tv,
} from 'lucide-react';

interface ExhibitionModeProps {
  artworks: Artwork[];
  onClose: () => void;
  initialIndex?: number;
  initialMode?: 'all' | 'curated';
}

// Museum easing curve: very gentle acceleration, long organic deceleration
const MUSEUM_EASE = [0.22, 1, 0.36, 1] as const;

// Curatorial room chapters for the journey
const CURATORIAL_ROOMS = [
  { id: 'room-1', title: 'Sala I • Początek Drogi', subtitle: 'Pierwsze poszukiwania formy i koloru' },
  { id: 'room-2', title: 'Sala II • Światło i Przestrzeń', subtitle: 'Studium natury oraz pejzażu' },
  { id: 'room-3', title: 'Sala III • Emocja i Materia', subtitle: 'Faktura, gęstość farby i wyraz' },
  { id: 'room-4', title: 'Sala IV • Cisza i Kontemplacja', subtitle: 'Wewnętrzny dialog twórcy' },
  { id: 'room-5', title: 'Sala V • Finał i Domknięcie', subtitle: 'Dojrzałość i synteza motywów' },
];

export const ExhibitionMode: React.FC<ExhibitionModeProps> = ({
  artworks,
  onClose,
  initialIndex = 0,
  initialMode = 'all',
}) => {
  const [exhibitionRoute, setExhibitionRoute] = useState<'all' | 'curated'>(initialMode);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = backward
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(true);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isPureCanvas, setIsPureCanvas] = useState<boolean>(false); // Czysty obraz: no UI overlays
  const [isTvMode, setIsTvMode] = useState<boolean>(false); // Salon / TV 16:9 Cinema Mode
  const [showArtistQuote, setShowArtistQuote] = useState<boolean>(false);
  const [showSilenceInterlude, setShowSilenceInterlude] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(10); // 10s contemplative museum pace

  const touchStartXRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { recordVisit } = useExhibitionMemory();
  const { isPortrait } = useOrientation();

  // Curated ordering or natural collection order
  const activeArtworksList = React.useMemo(() => {
    if (exhibitionRoute === 'curated') {
      return [...artworks].sort((a, b) => (a.exhibitionOrder || a.order) - (b.exhibitionOrder || b.order));
    }
    return artworks;
  }, [artworks, exhibitionRoute]);

  const currentArtwork = activeArtworksList[currentIndex] || activeArtworksList[0];

  // Calculate curatorial chapter based on progress
  const currentRoomIndex = Math.min(
    CURATORIAL_ROOMS.length - 1,
    Math.floor((currentIndex / Math.max(1, activeArtworksList.length)) * CURATORIAL_ROOMS.length)
  );
  const currentRoom = CURATORIAL_ROOMS[currentRoomIndex];

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
    }, isTvMode ? 2800 : 3800);
  }, [isPureCanvas, isTvMode]);

  // Handle Next Artwork (with optional Moment Ciszy in curated route)
  const handleNext = useCallback(() => {
    setDirection(1);
    setShowArtistQuote(false);

    // Moment Ciszy trigger in curated path at roughly midway (e.g. at index 3 or 4)
    if (exhibitionRoute === 'curated' && currentIndex === 3 && !showSilenceInterlude) {
      setShowSilenceInterlude(true);
      return;
    }

    if (showSilenceInterlude) {
      setShowSilenceInterlude(false);
    }

    if (currentIndex < activeArtworksList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Reached the end of the exhibition
      setIsFinished(true);
      setIsPlaying(false);
    }
  }, [currentIndex, activeArtworksList.length, exhibitionRoute, showSilenceInterlude]);

  // Handle Previous Artwork
  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setShowArtistQuote(false);
    setShowSilenceInterlude(false);

    if (isFinished) {
      setIsFinished(false);
      setCurrentIndex(activeArtworksList.length - 1);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(activeArtworksList.length - 1);
    }
  }, [currentIndex, isFinished, activeArtworksList.length]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    resetControlsTimeout();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;

    // Minimum swipe threshold: 45px
    if (deltaX > 45) {
      handlePrevious();
    } else if (deltaX < -45) {
      handleNext();
    }
    touchStartXRef.current = null;
  };

  // Restart Exhibition
  const handleRestart = useCallback(() => {
    setDirection(1);
    setIsFinished(false);
    setShowSilenceInterlude(false);
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
      if (e.key === 't' || e.key === 'T') setIsTvMode((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrevious, resetControlsTimeout]);

  // Autoplay loop (strictly user-initiated, contemplative museum pace)
  useEffect(() => {
    if (isPlaying && !isFinished && !showSilenceInterlude) {
      autoplayTimerRef.current = setTimeout(() => {
        handleNext();
      }, intervalSeconds * 1000);
    }

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isPlaying, currentIndex, isFinished, showSilenceInterlude, intervalSeconds, handleNext]);

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
      {/* 1. MOMENT CISZY (Quiet Contemplative Interlude in Curatorial Path) */}
      {showSilenceInterlude ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: MUSEUM_EASE }}
          className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto"
        >
          <span className="text-[10px] tracking-[0.35em] uppercase text-[#C5A880] mb-4">
            Ścieżka Kuratorska • Chwila Ciszy
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-4xl font-light text-[#F2F0EA] leading-relaxed mb-6">
            „Nie każdy obraz potrzebuje wyjaśnienia. Czasem wystarczy zatrzymać wzrok.”
          </h2>
          <div className="w-12 h-[1px] bg-[#C5A880]/50 my-6" />
          <button
            onClick={() => setShowSilenceInterlude(false)}
            className="inline-flex items-center gap-2 border border-[#C5A880] bg-[#161616] hover:bg-[#C5A880]/15 px-6 py-2.5 text-xs tracking-[0.22em] uppercase text-[#F2F0EA] transition-colors"
          >
            <span>Przejdź do kolejnego dzieła</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5A880]" />
          </button>
        </motion.div>
      ) : isFinished ? (
        /* 2. GRAND FINALE OF THE EXHIBITION (FINAŁ WYSTAWY & DEDYKACJA) */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: MUSEUM_EASE }}
          className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-2xl mx-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 border border-[#2A2927] hover:border-[#F2F0EA] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
            aria-label="Zamknij wystawę"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] tracking-[0.35em] uppercase text-[#C5A880] mb-4 font-mono">
            Finał Wystawy • Podziękowanie
          </span>

          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-light text-[#F2F0EA] leading-tight mb-6">
            Dziękuję, że zatrzymałeś się na chwilę.
          </h2>

          <div className="w-16 h-[1px] bg-[#C5A880]/60 my-6" />

          <p className="font-serif-luxury text-2xl text-[#F2F0EA] font-normal">
            {artistData.name}
          </p>

          <p className="text-xs uppercase tracking-[0.25em] text-[#AAA69D] mt-2">
            Prywatna kolekcja malarstwa
          </p>

          <p className="font-serif-luxury text-base italic text-[#C5A880] mt-6 max-w-md leading-relaxed">
            „{collectionData.giftDedication}”
          </p>

          <p className="text-xs text-[#AAA69D]/80 font-serif-luxury italic mt-3">
            Z miłością i niesłabnącym podziwem dla Twojej twórczości.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
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
        </motion.div>
      ) : (
        /* 3. MAIN CINEMATIC ARTWORK VIEWPORT WITH MUSEUM SPOTLIGHT */
        <>
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-6 lg:p-8 overflow-hidden">
            {/* Museum Gallery Lighting Engine: Soft radial illumination behind canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[60vw] h-[60vh] max-w-[800px] max-h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(197,168,128,0.08)_0%,_rgba(20,20,20,0.6)_60%,_transparent_100%)] blur-3xl opacity-80" />
            </div>

            <motion.div
              layout
              transition={{ duration: 1.0, ease: MUSEUM_EASE }}
              className={`relative w-full h-full flex items-center justify-center transition-all ${
                isPortrait ? 'max-w-[94vw] max-h-[82vh]' : 'max-w-[94vw] max-h-[88vh]'
              }`}
            >
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentArtwork.id}
                    initial={{
                      opacity: 0,
                      scale: 0.985,
                      x: direction * 15,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.012,
                      x: direction * -15,
                    }}
                    transition={{
                      duration: 1.2, // Paced 1200ms museum tempo
                      ease: MUSEUM_EASE,
                    }}
                    className="relative w-full h-full flex items-center justify-center will-change-transform"
                  >
                    <Image
                      src={currentArtwork.image}
                      alt={currentArtwork.title}
                      fill
                      priority
                      unoptimized
                      quality={98}
                      sizes="100vw"
                      className="object-contain pointer-events-none select-none drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* 4. GŁOS ARTYSTY (Artist reflection quote reveal modal) */}
          <AnimatePresence>
            {showArtistQuote && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.7, ease: MUSEUM_EASE }}
                className="absolute inset-x-4 bottom-28 sm:bottom-32 z-40 max-w-xl mx-auto bg-[#111111]/95 backdrop-blur-xl border border-[#C5A880]/60 p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-[#2A2927] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Quote className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
                      Głos Artysty • Refleksja
                    </span>
                  </div>
                  <button
                    onClick={() => setShowArtistQuote(false)}
                    className="text-[#AAA69D] hover:text-[#F2F0EA] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-serif-luxury text-lg sm:text-xl italic text-[#F2F0EA] leading-relaxed">
                  {currentArtwork.story?.meaning ||
                    currentArtwork.story?.origin ||
                    currentArtwork.description ||
                    `„Każde pociągnięcie pędzla było próbą uchwycenia chwili, która w rzeczywistości ucieka zbyt szybko.”`}
                </p>
                <span className="block text-right text-xs uppercase tracking-[0.2em] text-[#AAA69D] mt-4 font-serif-luxury">
                  — {artistData.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. FLOATING CONTROLS DOCK */}
          <AnimatePresence>
            {!isPureCanvas && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: controlsVisible ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: MUSEUM_EASE }}
                className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-8 ${
                  controlsVisible ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                {/* Top Bar with Curatorial Room indicator + Route switcher + Quick actions */}
                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880]">
                        {currentRoom.title}
                      </span>
                      <span className="text-[#2A2927]">•</span>
                      <span className="text-xs text-[#AAA69D] tracking-widest font-mono">
                        {currentIndex + 1} / {activeArtworksList.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#777] font-serif-luxury italic hidden sm:inline">
                      {currentRoom.subtitle}
                    </span>
                  </div>

                  {/* Top Controls: Route, Autoplay, TV mode, Pure Canvas, Info, Close */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Curatorial Route Toggle */}
                    <button
                      onClick={() => {
                        setExhibitionRoute((prev) => (prev === 'all' ? 'curated' : 'all'));
                        setCurrentIndex(0);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[11px] tracking-wider uppercase transition-colors bg-[#111111]/80 ${
                        exhibitionRoute === 'curated'
                          ? 'border-[#C5A880] text-[#C5A880]'
                          : 'border-[#2A2927] text-[#AAA69D] hover:text-[#F2F0EA]'
                      }`}
                      title="Przełącz między wszystkimi dziełami a ścieżką kuratorską"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span className="hidden md:inline">
                        {exhibitionRoute === 'curated' ? 'Ścieżka Kuratorska' : 'Wszystkie'}
                      </span>
                    </button>

                    {/* Autoplay button */}
                    <button
                      onClick={() => setIsPlaying((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs tracking-wider uppercase transition-all duration-300 ${
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

                    {/* Speed selector */}
                    {isPlaying && (
                      <button
                        onClick={() => setIntervalSeconds((prev) => (prev === 10 ? 14 : prev === 14 ? 8 : 10))}
                        className="p-1.5 border border-[#2A2927] text-[10px] text-[#AAA69D] hover:text-[#F2F0EA] bg-[#111111]/80 transition-colors"
                        title="Zmień tempo (8s / 10s / 14s)"
                      >
                        <Sliders className="w-3 h-3" />
                      </button>
                    )}

                    {/* TV / Salon Mode */}
                    <button
                      onClick={() => setIsTvMode((prev) => !prev)}
                      className={`p-2 border transition-colors bg-[#111111]/80 ${
                        isTvMode
                          ? 'border-[#C5A880] text-[#C5A880]'
                          : 'border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA]'
                      }`}
                      title="Tryb TV / Salon — projekcja pełnoekranowa 16:9 (T)"
                      aria-label="Tryb TV"
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </button>

                    {/* Pure Canvas Mode */}
                    <button
                      onClick={() => setIsPureCanvas(true)}
                      className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors bg-[#111111]/80"
                      title="Czysty obraz — ukryj wszystkie elementy interfejsu (H)"
                      aria-label="Czysty obraz"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-[#C5A880]" />
                    </button>

                    {/* Info Toggle */}
                    <button
                      onClick={() => setShowInfo((prev) => !prev)}
                      className={`p-2 border transition-colors bg-[#111111]/80 ${
                        showInfo
                          ? 'border-[#C5A880] text-[#C5A880]'
                          : 'border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA]'
                      }`}
                      title="Włącz/wyłącz opis dzieła (I)"
                      aria-label="Pokaż lub ukryj opis dzieła"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {/* Close */}
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

                {/* Bottom Caption Plaque + Głos Artysty Trigger */}
                <div className="pointer-events-auto flex flex-col items-center gap-2">
                  <AnimatePresence mode="wait">
                    {showInfo && (
                      <motion.div
                        key={`plaque-${currentArtwork.id}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.9, ease: MUSEUM_EASE }}
                        className="bg-[#111111]/92 backdrop-blur-md border border-[#2A2927] px-6 sm:px-10 py-3 sm:py-4 max-w-xl text-center shadow-2xl"
                      >
                        <div className="flex items-center justify-center gap-2 mb-0.5">
                          <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A880]">
                            {currentArtwork.category}
                          </span>
                          <span className="text-[#333]">•</span>
                          <button
                            onClick={() => setShowArtistQuote((prev) => !prev)}
                            className="text-[9px] uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#C5A880] transition-colors inline-flex items-center gap-1"
                            title="Wyświetl refleksję artysty"
                          >
                            <Quote className="w-2.5 h-2.5 text-[#C5A880]" />
                            <span>Głos Artysty</span>
                          </button>
                        </div>

                        <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#F2F0EA] font-light">
                          {currentArtwork.title}
                        </h3>
                        <p className="text-xs text-[#AAA69D] mt-1 font-serif-luxury italic">
                          {currentArtwork.year} • {currentArtwork.medium.replace(/\s*\[.*?\]/, '')}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reminder in Pure Canvas mode */}
          {isPureCanvas && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: MUSEUM_EASE }}
              className="absolute top-4 right-4 z-40 bg-[#111111]/80 backdrop-blur-sm border border-[#2A2927] px-3.5 py-1.5 text-[10px] text-[#AAA69D] uppercase tracking-wider flex items-center gap-2"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Czysty obraz • Kliknij lub wciśnij H, aby przywrócić menu</span>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
