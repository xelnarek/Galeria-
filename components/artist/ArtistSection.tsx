'use client';

import React from 'react';
import Image from 'next/image';
import { artistData, collectionData } from '@/data/gallery-data';
import { Artist, CollectionInfo } from '@/types/gallery';
import { Feather, Heart } from 'lucide-react';

interface ArtistSectionProps {
  artist?: Artist;
  collection?: CollectionInfo;
}

export const ArtistSection: React.FC<ArtistSectionProps> = ({
  artist,
  collection,
}) => {
  const currentArtist = artist || artistData;
  const currentCollection = collection || collectionData;
  return (
    <section id="artysta" className="py-28 sm:py-36 px-5 sm:px-10 border-t border-[#2A2927] max-w-7xl mx-auto">
      <div className="max-w-6xl mx-auto">
        {/* Curatorial Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
            03 • Monografia Artysty
          </span>
        </div>

        <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[#F2F0EA] font-light tracking-tight mb-16">
          Twórca i warsztat
        </h2>

        {/* 1. Large Portrait & Grand Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-24">
          {/* Portrait of the Artist (Cinematic B&W, natural texture) */}
          <div className="lg:col-span-5">
            <div className="relative border border-[#2A2927] p-2.5 sm:p-3.5 bg-[#111111] shadow-2xl">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0B0B0B]">
                <Image
                  src={currentArtist.portrait}
                  alt={currentArtist.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-serif-luxury text-xl text-[#F2F0EA] font-light">
                    {currentArtist.name}
                  </p>
                  <p className="text-[10px] tracking-widest uppercase text-[#C5A880] mt-0.5">
                    {currentArtist.tagline}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A2927]/60 flex items-center justify-between text-[10px] text-[#777] uppercase tracking-widest px-1">
                <span>Pracownia domowa</span>
                <span>Fotografia archiwalna</span>
              </div>
            </div>
          </div>

          {/* Artist Grand Quote & Monograph Bio */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#C5A880]">
              <blockquote className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl italic text-[#F2F0EA] leading-[1.3] font-light">
                {currentArtist.statement}
              </blockquote>
              <p className="text-xs text-[#AAA69D] uppercase tracking-[0.2em] mt-4">
                — Z osobistych zapisków artysty przy sztalugach
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] block">
                Droga twórcza
              </span>
              <p className="text-sm sm:text-base text-[#AAA69D] leading-relaxed font-light">
                {currentArtist.biography}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Key Artistic Facts & Timeline Grid */}
        <div className="border-y border-[#2A2927] py-12 mb-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777] block mb-2">
              Pierwsze płótna
            </span>
            <span className="font-serif-luxury text-2xl sm:text-3xl text-[#F2F0EA] font-light block">
              Początki drogi
            </span>
            <p className="text-xs text-[#AAA69D] font-light mt-1">
              Malowane z wewnętrznej potrzeby wyrazu
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777] block mb-2">
              Lata aktywności
            </span>
            <span className="font-serif-luxury text-2xl sm:text-3xl text-[#F2F0EA] font-light block">
              {currentArtist.yearsActive || 'Wieloletnia praca'}
            </span>
            <p className="text-xs text-[#AAA69D] font-light mt-1">
              Dziesiątki godzin spędzonych w ciszy pracowni
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777] block mb-2">
              Główna technika
            </span>
            <span className="font-serif-luxury text-2xl sm:text-3xl text-[#C5A880] font-light block">
              Olej na płótnie
            </span>
            <p className="text-xs text-[#AAA69D] font-light mt-1">
              Fakturalne impasty i laserunki
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777] block mb-2">
              Przestrzeń pracy
            </span>
            <span className="font-serif-luxury text-2xl sm:text-3xl text-[#F2F0EA] font-light block">
              Pracownia taty
            </span>
            <p className="text-xs text-[#AAA69D] font-light mt-1">
              Zapach terpentyny, werniksu i spokoju
            </p>
          </div>
        </div>

        {/* 3. Personal Letter from Daughter (Curator & Dedication) - The Emotional Heart */}
        <div className="border border-[#2A2927] bg-[#111111] p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          {/* Subtle light background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-[#2A2927] pb-4">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-[#C5A880]" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
                  Słowo kuratorki • Dedykacja
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#AAA69D]">
                <Heart className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
                <span className="text-[11px] font-light tracking-wide">Od córki dla ojca</span>
              </div>
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl text-[#F2F0EA] font-light leading-snug">
              „Ta wystawa to podziękowanie za lata cichej pasji i odwagi tworzenia.”
            </h3>

            <div className="space-y-4 text-sm sm:text-base text-[#AAA69D] leading-relaxed font-light whitespace-pre-line">
              {currentCollection.curatorNote || (
                <>
                  <p>
                    Dorastając obok Twojej sztalugi, uczyłam się patrzeć na świat nie tylko takim,
                    jakim jest, ale takim, jak potrafi go uchwycić pędzel: z wrażliwością na światło,
                    melancholię zmierzchu i spokój ukryty w kolorach.
                  </p>
                  <p>
                    Twoje obrazy przez lata wypełniały nasz dom ciepłem. Zasługują na przestrzeń,
                    w której każdy może zatrzymać się przed nimi z należytą uwagą i szacunkiem.
                    Ta wirtualna galeria jest moim prezentem dla Ciebie — miejscem, w którym Twoja
                    twórczość zyskała godną, muzealną oprawę.
                  </p>
                </>
              )}
            </div>

            <div className="pt-6 border-t border-[#2A2927] flex items-center justify-between">
              <div>
                <span className="font-serif-luxury italic text-lg text-[#F2F0EA] block">
                  Z miłością i podziwem,
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
                  Twoja córka
                </span>
              </div>
              <span className="text-xs text-[#666] font-mono">
                Wystawa stała • Kolekcja Rodzinna
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
