'use client';

import React from 'react';
import Image from 'next/image';
import { artistData, collectionData, artworksData } from '@/data/gallery-data';
import { Artwork, Artist, CollectionInfo } from '@/types/gallery';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface HeroExhibitionProps {
  onOpenArtwork: (artwork: Artwork) => void;
  onOpenExhibition: () => void;
  lastArtwork?: Artwork | null;
  artworks?: Artwork[];
  artist?: Artist;
  collection?: CollectionInfo;
}

export const HeroExhibition: React.FC<HeroExhibitionProps> = ({
  onOpenArtwork,
  onOpenExhibition,
  lastArtwork,
  artworks,
  artist,
  collection,
}) => {
  const currentArtworks = artworks || artworksData;
  const currentArtist = artist || artistData;
  const currentCollection = collection || collectionData;

  const featuredArtwork =
    currentArtworks.find((a) => a.featured) || currentArtworks[0];

  return (
    <section
      id="ekspozycja-glowna"
      className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 pb-10 px-5 sm:px-10 max-w-7xl mx-auto animate-cinematic"
    >
      {/* Top Quiet Curatorial Dedication */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#2A2927]/60 pb-5">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] inline-block" />
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#AAA69D]">
            {currentCollection.title}
          </p>
        </div>
        <p className="font-serif-luxury text-sm italic text-[#AAA69D]/80">
          {currentCollection.giftDedication}
        </p>
      </div>

      {/* Main Canvas & Cinematic Space (85–90% attention on the artwork) */}
      <div className="my-auto py-8 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Dominant Museum Wall Presentation */}
        <div className="lg:col-span-8 flex justify-center items-center">
          <div
            className="group relative cursor-pointer transition-transform duration-700 hover:scale-[1.008] w-full max-w-2xl"
            onClick={() => onOpenArtwork(featuredArtwork)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onOpenArtwork(featuredArtwork);
              }
            }}
            aria-label={`Otwórz dzieło: ${featuredArtwork.title}`}
          >
            {/* Museum Wall Spotlight Soft Glow */}
            <div className="absolute -inset-6 bg-[#161616]/60 blur-3xl pointer-events-none" />

            {/* Canvas Mount: Minimalist 1px border, 0px radius */}
            <div className="relative border border-[#2A2927] p-2 sm:p-3.5 bg-[#111111] shadow-2xl">
              <div
                className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#0B0B0B]"
                suppressHydrationWarning
              >
                <Image
                  src={featuredArtwork.image}
                  alt={featuredArtwork.title}
                  fill
                  priority
                  unoptimized
                  quality={95}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
                  className="object-contain transition-opacity duration-1000"
                  referrerPolicy="no-referrer"
                  suppressHydrationWarning
                />
              </div>

              {/* Caption Plaque with strict typographic separation */}
              <div className="mt-3 pt-2.5 flex items-baseline justify-between border-t border-[#2A2927]/60 px-1">
                <div>
                  <span className="font-serif-luxury text-base sm:text-lg text-[#F2F0EA] block leading-snug">
                    {featuredArtwork.title}
                  </span>
                  <span className="text-[11px] text-[#AAA69D] font-light">
                    {featuredArtwork.year} • {featuredArtwork.medium.replace(/\s*\[.*?\]/, '')}
                  </span>
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#C5A880] opacity-80 group-hover:opacity-100 group-hover:underline transition-opacity">
                  Zobacz dzieło
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Information Column (10–15% visual weight, generous whitespace) */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-8 lg:pl-2">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
              Twórczość malarska
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F2F0EA] leading-[1.12]">
              {currentArtist.name}
            </h1>
            <p className="font-serif-luxury text-base sm:text-lg italic text-[#AAA69D] leading-relaxed pt-1 max-w-sm">
              {currentArtist.statement}
            </p>
          </div>

          <p className="text-xs sm:text-[13px] text-[#AAA69D]/85 leading-relaxed font-light max-w-sm">
            Prywatny katalog prac malarskich stworzony w hołdzie dla pasji i kunsztu.
            Dzieła eksponowane bez kompromisów, w czystej cyfrowej przestrzeni wystawowej.
          </p>

          {/* Exhibition Entrance: Number + Text + Expanding Line */}
          <div className="pt-2 flex flex-col space-y-6">
            <button
              id="hero-start-exhibition-btn"
              onClick={onOpenExhibition}
              className="group text-left inline-flex flex-col items-start gap-1.5 focus:outline-none"
              aria-label="Rozpocznij wystawę"
            >
              <span className="text-[11px] tracking-[0.25em] text-[#C5A880] font-mono">
                01
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-[#F2F0EA] group-hover:text-[#C5A880] transition-colors">
                Rozpocznij wystawę
              </span>
              <span className="entrance-link-line mt-1" />
            </button>

            <a
              id="hero-discover-collection-link"
              href="#kolekcja"
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors pt-2"
            >
              <span>Kolekcja obrazów</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Optional Memory of the Exhibition: Resume previous session */}
            {lastArtwork && (
              <div className="border-t border-[#2A2927]/60 pt-4 mt-2">
                <button
                  onClick={() => onOpenArtwork(lastArtwork)}
                  className="group text-left text-xs text-[#AAA69D] hover:text-[#F2F0EA] transition-colors flex flex-col gap-0.5"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880]">
                    Kontynuuj oglądanie
                  </span>
                  <span className="font-serif-luxury italic text-sm text-[#F2F0EA] group-hover:underline">
                    „{lastArtwork.title}” ({lastArtwork.year})
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Scroll Cue */}
      <div className="flex flex-col items-center justify-center pt-4 border-t border-[#2A2927]/40 text-center">
        <a
          href="#kolekcja"
          className="group inline-flex flex-col items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase text-[#AAA69D]/60 hover:text-[#C5A880] transition-colors"
          aria-label="Przewiń do kolekcji"
        >
          <span>Wejdź do galerii</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#AAA69D]/40 group-hover:translate-y-1 transition-transform" />
        </a>
      </div>
    </section>
  );
};

