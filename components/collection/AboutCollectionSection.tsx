'use client';

import React from 'react';
import { collectionData, artworksData } from '@/data/gallery-data';
import { Artwork, CollectionInfo } from '@/types/gallery';
import { HeartHandshake, Compass } from 'lucide-react';

interface AboutCollectionSectionProps {
  collection?: CollectionInfo;
  artworks?: Artwork[];
}

export const AboutCollectionSection: React.FC<AboutCollectionSectionProps> = ({
  collection,
  artworks,
}) => {
  const currentCollection = collection || collectionData;
  const currentArtworks = artworks || artworksData;

  const totalArtworks = currentArtworks.length;
  const years = currentArtworks
    .map((a) => parseInt(a.year, 10))
    .filter((y) => !isNaN(y));
  const minYear = years.length > 0 ? Math.min(...years) : 2018;
  const maxYear = years.length > 0 ? Math.max(...years) : 2024;

  const categories = Array.from(new Set(currentArtworks.map((a) => a.category)));

  return (
    <section id="o-kolekcji" className="py-28 sm:py-36 px-5 sm:px-10 border-t border-[#2A2927] max-w-7xl mx-auto">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Curatorial Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 border border-[#2A2927] px-4 py-1.5 bg-[#111111]">
            <HeartHandshake className="w-4 h-4 text-[#C5A880]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
              04 • Koncepcja Ekspozycji
            </span>
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[#F2F0EA] font-light leading-tight">
            O kolekcji i wystawie
          </h2>

          <p className="font-serif-luxury text-xl sm:text-2xl italic text-[#C5A880] leading-relaxed max-w-2xl mx-auto font-light">
            „{currentCollection.giftDedication}”
          </p>

          <p className="text-sm sm:text-base text-[#AAA69D] leading-relaxed font-light max-w-2xl mx-auto">
            {currentCollection.description}
          </p>
        </div>

        {/* 1. Statystyki Kolekcji (Curatorial Ledger) */}
        <div className="border border-[#2A2927] bg-[#111111] p-8 sm:p-12">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
              Metryka zbiorów
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#2A2927]">
            <div className="pt-4 md:pt-0 md:px-6 first:pl-0">
              <span className="font-serif-luxury text-4xl sm:text-5xl text-[#F2F0EA] font-light block">
                {totalArtworks}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] block mt-1">
                Katalogowane obrazy
              </span>
              <p className="text-xs text-[#AAA69D] mt-2 font-light">
                Autorski wybór najważniejszych prac malarskich
              </p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6">
              <span className="font-serif-luxury text-4xl sm:text-5xl text-[#F2F0EA] font-light block">
                {minYear}–{maxYear}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] block mt-1">
                Przedział chronologiczny
              </span>
              <p className="text-xs text-[#AAA69D] mt-2 font-light">
                Okres intensywnej pracy warsztatowej i plenerowej
              </p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6">
              <span className="font-serif-luxury text-4xl sm:text-5xl text-[#F2F0EA] font-light block">
                {categories.length}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] block mt-1">
                Nurty tematyczne
              </span>
              <p className="text-xs text-[#AAA69D] mt-2 font-light">
                {categories.join(', ')}
              </p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6">
              <span className="font-serif-luxury text-4xl sm:text-5xl text-[#C5A880] font-light block">
                100%
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] block mt-1">
                Autentyczność
              </span>
              <p className="text-xs text-[#AAA69D] mt-2 font-light">
                Malarstwo olejne sztalugowe na płótnie
              </p>
            </div>
          </div>
        </div>

        {/* 2. Przewodnik po wystawie: „Jak oglądać tę wystawę” (3 Zasady) */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[#C5A880]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
                Etykieta kontemplacji
              </span>
            </div>
            <h3 className="font-serif-luxury text-2xl sm:text-4xl text-[#F2F0EA] font-light">
              Jak oglądać tę wystawę
            </h3>
            <p className="text-xs sm:text-sm text-[#AAA69D] mt-2 font-light">
              Cyfrowa galeria została zaprogramowana tak, aby zachęcać do skupienia i spokoju.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Principle 1 */}
            <div className="border border-[#2A2927] p-8 bg-[#111111] space-y-4">
              <div className="w-8 h-8 border border-[#C5A880] flex items-center justify-center text-xs font-mono text-[#C5A880]">
                01
              </div>
              <h4 className="font-serif-luxury text-2xl text-[#F2F0EA] font-light">
                Zwolnij krok
              </h4>
              <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                To nie jest galeria miniaturek w mediach społecznościowych. Przewijaj powoli.
                Daj każdemu płótnu chwilę, aby wybrzmiało w ciszy Twojego ekranu.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="border border-[#2A2927] p-8 bg-[#111111] space-y-4">
              <div className="w-8 h-8 border border-[#C5A880] flex items-center justify-center text-xs font-mono text-[#C5A880]">
                02
              </div>
              <h4 className="font-serif-luxury text-2xl text-[#F2F0EA] font-light">
                Zbadaj fakturę
              </h4>
              <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                Skorzystaj z narzędzia Zoom i Studium Detalu. Sprawdź, jak światło układa się
                na warstwach impastu oraz jak artysta operował pędzlem i szpachlą.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="border border-[#2A2927] p-8 bg-[#111111] space-y-4">
              <div className="w-8 h-8 border border-[#C5A880] flex items-center justify-center text-xs font-mono text-[#C5A880]">
                03
              </div>
              <h4 className="font-serif-luxury text-2xl text-[#F2F0EA] font-light">
                Włącz Tryb Wystawy
              </h4>
              <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                Uruchom pełnoekranowy „Tryb wystawy”. Ukryj interfejs i pozwól, aby obrazy
                prowadziły Cię w tempie powolnego spaceru po salach muzealnych.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
