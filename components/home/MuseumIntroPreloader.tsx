'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Artist } from '@/types/gallery';
import { useIsMounted } from '@/hooks/useIsMounted';

interface MuseumIntroPreloaderProps {
  artist: Artist;
  onComplete?: () => void;
}

const MUSEUM_EASE = [0.22, 1, 0.36, 1] as const;

function subscribeSessionStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSessionSeenSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem('museum_intro_seen') === 'true';
  } catch {
    return true;
  }
}

function getSessionSeenServerSnapshot(): boolean {
  return true;
}

export const MuseumIntroPreloader: React.FC<MuseumIntroPreloaderProps> = ({
  artist,
  onComplete,
}) => {
  const isMounted = useIsMounted();
  const isAlreadySeen = useSyncExternalStore(
    subscribeSessionStorage,
    getSessionSeenSnapshot,
    getSessionSeenServerSnapshot
  );

  const [stage, setStage] = useState<'initial' | 'title' | 'artist' | 'curatorial' | 'completed'>('initial');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (!isMounted || isAlreadySeen || isDismissed) return;

    const t1 = setTimeout(() => setStage('title'), 200);
    const t2 = setTimeout(() => setStage('artist'), 1000);
    const t3 = setTimeout(() => setStage('curatorial'), 2000);
    const t4 = setTimeout(() => {
      setStage('completed');
      try {
        sessionStorage.setItem('museum_intro_seen', 'true');
      } catch {
        // ignore
      }
      setTimeout(() => {
        setIsDismissed(true);
        if (onComplete) onComplete();
      }, 900);
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isMounted, isAlreadySeen, isDismissed, onComplete]);

  const handleSkip = () => {
    try {
      sessionStorage.setItem('museum_intro_seen', 'true');
    } catch {
      // ignore
    }
    setIsDismissed(true);
    if (onComplete) onComplete();
  };

  if (!isMounted || isAlreadySeen || isDismissed) return null;



  return (
    <AnimatePresence>
      <motion.div
        id="museum-intro-preloader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: MUSEUM_EASE }}
        className="fixed inset-0 z-50 bg-[#070707] text-[#F2F0EA] flex flex-col justify-between items-center p-8 sm:p-12 select-none"
        onClick={handleSkip}
      >
        {/* Top Minimal Label */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: stage !== 'initial' ? 0.6 : 0, y: 0 }}
          transition={{ duration: 0.8, ease: MUSEUM_EASE }}
          className="text-[10px] tracking-[0.35em] uppercase text-[#AAA69D]"
        >
          Prywatna Ekspozycja Malarstwa
        </motion.div>

        {/* Center Curatorial Introduction */}
        <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: stage !== 'initial' ? 1 : 0, y: 0 }}
            transition={{ duration: 0.9, ease: MUSEUM_EASE }}
            className="text-[11px] uppercase tracking-[0.4em] text-[#C5A880] font-mono"
          >
            01 • Wejście do Galerii
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: stage === 'artist' || stage === 'curatorial' || stage === 'completed' ? 1 : 0,
              scale: 1,
            }}
            transition={{ duration: 1.2, ease: MUSEUM_EASE }}
            className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-light text-[#F2F0EA] tracking-wide"
          >
            {artist.name}
          </motion.h1>

          {/* Thin Gold Museum Progress Line */}
          <div className="w-24 h-[1px] bg-[#2A2927] overflow-hidden my-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.8, ease: 'easeInOut' }}
              className="h-full bg-[#C5A880]"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: stage === 'curatorial' || stage === 'completed' ? 1 : 0,
              y: 0,
            }}
            transition={{ duration: 1.0, ease: MUSEUM_EASE }}
            className="font-serif-luxury text-base sm:text-lg italic text-[#AAA69D] max-w-md leading-relaxed"
          >
            „Kolekcja, która zachowała więcej niż obrazy.”
          </motion.p>
        </div>

        {/* Bottom Skip Indicator */}
        <motion.button
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] uppercase tracking-[0.25em] text-[#AAA69D] hover:text-[#C5A880] transition-colors focus:outline-none"
        >
          Dotknij lub kliknij, aby pominąć
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};
