'use client';

import React from 'react';
import Image from 'next/image';
import { Artwork } from '@/types/gallery';
import { ArrowRight, Quote } from 'lucide-react';

interface ArtworkStoriesProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
}

export const ArtworkStories: React.FC<ArtworkStoriesProps> = ({
  artworks,
  onSelectArtwork,
}) => {
  // Artworks that have a story defined
  const storiesList = artworks.filter((a) => a.story && (a.story.origin || a.story.meaning));

  if (storiesList.length === 0) return null;

  return (
    <section id="historie" className="py-28 sm:py-36 px-5 sm:px-10 border-t border-[#2A2927] max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
          02 • Opowieści z Pracowni
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2A2927] pb-8 mb-16 gap-6">
        <div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[#F2F0EA] font-light tracking-tight">
            Historie dzieł
          </h2>
          <p className="text-xs sm:text-sm text-[#AAA69D] mt-3 max-w-xl font-light leading-relaxed">
            Każdy obraz to moment w czasie — wspomnienie pleneru, poszukiwanie światła
            lub intymna rozmowa z płótnem w ciszy pracowni.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {storiesList.slice(0, 3).map((art) => (
          <div
            key={`story-${art.id}`}
            onClick={() => onSelectArtwork(art)}
            className="group cursor-pointer border border-[#2A2927] bg-[#111111] p-6 sm:p-8 flex flex-col justify-between hover:border-[#C5A880]/60 transition-all duration-500 shadow-xl"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectArtwork(art);
            }}
          >
            <div>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0B0B0B] mb-6 border border-[#2A2927]/60">
                <Image
                  src={art.thumbnail || art.image}
                  alt={art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#777] mb-2 font-mono">
                <span className="text-[#C5A880]">{art.category}</span>
                <span>{art.year}</span>
              </div>

              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F2F0EA] font-light group-hover:text-[#C5A880] transition-colors leading-snug">
                {art.title}
              </h3>

              <div className="mt-4 pt-4 border-t border-[#2A2927]/60 space-y-2">
                {art.story?.curatorialNote ? (
                  <p className="font-serif-luxury text-sm italic text-[#C5A880]/90 line-clamp-2">
                    „{art.story.curatorialNote}”
                  </p>
                ) : null}
                <p className="text-xs text-[#AAA69D] line-clamp-3 leading-relaxed font-light">
                  {art.story?.origin || art.story?.meaning || art.description}
                </p>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-[#2A2927]/60 flex items-center justify-between text-xs text-[#C5A880] group-hover:text-white transition-colors">
              <span className="tracking-widest uppercase text-[10px]">
                Otwórz kartę dzieła
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-[#C5A880]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
