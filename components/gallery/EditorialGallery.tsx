'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork } from '@/types/gallery';
import { Heart, Calendar, LayoutGrid, Columns, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface EditorialGalleryProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const EditorialGallery: React.FC<EditorialGalleryProps> = ({
  artworks,
  onSelectArtwork,
  favorites,
  onToggleFavorite,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'editorial' | 'wall' | 'chronology'>('editorial');
  const [routeMode, setRouteMode] = useState<'all' | 'curated'>('all');
  const wallScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic categories extracted from artworks data
  const categories = useMemo(() => {
    const cats = Array.from(new Set(artworks.map((a) => a.category))).filter(Boolean);
    return ['all', ...cats];
  }, [artworks]);

  // Filtered artworks
  const filteredArtworks = useMemo(() => {
    let list = [...artworks];

    // Curated route ordering
    if (routeMode === 'curated') {
      list.sort((a, b) => (a.exhibitionOrder || a.order) - (b.exhibitionOrder || b.order));
    }

    if (activeCategory === 'favorites') {
      list = list.filter((a) => favorites.includes(a.id));
    } else if (activeCategory !== 'all') {
      list = list.filter((a) => a.category === activeCategory);
    }
    return list;
  }, [artworks, activeCategory, favorites, routeMode]);

  // Grouped by year for Chronology view
  const chronologicalGroups = useMemo(() => {
    const map = new Map<string, Artwork[]>();
    const sorted = [...filteredArtworks].sort((a, b) => {
      const yA = parseInt(a.year, 10) || 0;
      const yB = parseInt(b.year, 10) || 0;
      return yB - yA;
    });

    sorted.forEach((art) => {
      const groupYear = art.year || 'Niedatowane';
      if (!map.has(groupYear)) {
        map.set(groupYear, []);
      }
      map.get(groupYear)!.push(art);
    });

    return Array.from(map.entries());
  }, [filteredArtworks]);

  const scrollWall = (direction: 'left' | 'right') => {
    if (wallScrollRef.current) {
      const amount = direction === 'left' ? -420 : 420;
      wallScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="kolekcja" className="pt-24 pb-36 px-5 sm:px-10 max-w-7xl mx-auto">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2A2927] pb-8 mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
              Katalog Wystawy
            </span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#F2F0EA] font-light">
            Kolekcja obrazów
          </h2>
          <p className="text-xs text-[#AAA69D] mt-2 max-w-xl leading-relaxed font-light">
            Dzieła eksponowane z poszanowaniem ich autonomii. Kliknij dowolne płótno,
            aby zagłębić się w szczegóły, fakturę i historię powstania.
          </p>
        </div>

        {/* View Mode & Route Selection Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Route selector: Wszystkie vs Ścieżka kuratorska */}
          <div className="flex items-center border border-[#2A2927] bg-[#111111] p-1">
            <button
              onClick={() => setRouteMode('all')}
              className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-colors ${
                routeMode === 'all'
                  ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                  : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setRouteMode('curated')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider uppercase transition-colors ${
                routeMode === 'curated'
                  ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                  : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
              title="Rekomendowana sekwencja oglądania dzieł"
            >
              <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Ścieżka kuratorska</span>
            </button>
          </div>

          {/* View Mode: Editorial vs Wall View vs Chronology */}
          <div className="flex items-center border border-[#2A2927] p-1 bg-[#111111]">
            <button
              onClick={() => setViewMode('editorial')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider uppercase transition-colors ${
                viewMode === 'editorial'
                  ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                  : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
              title="Układ autorski o asymetrycznym rytmie"
              aria-label="Układ autorski"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Autorski</span>
            </button>

            <button
              onClick={() => setViewMode('wall')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider uppercase transition-colors ${
                viewMode === 'wall'
                  ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                  : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
              title="Widok ściany muzealnej z punktowym oświetleniem"
              aria-label="Widok ściany"
            >
              <Columns className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Widok ściany</span>
            </button>

            <button
              onClick={() => setViewMode('chronology')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider uppercase transition-colors ${
                viewMode === 'chronology'
                  ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                  : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
              title="Układ chronologiczny według lat"
              aria-label="Układ chronologiczny"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Chronologia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Favorites */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-16 text-xs uppercase tracking-[0.18em]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 transition-all duration-300 border ${
              activeCategory === cat
                ? 'border-[#C5A880] text-[#F2F0EA] bg-[#161616]'
                : 'border-transparent text-[#AAA69D] hover:text-[#F2F0EA] hover:border-[#2A2927]'
            }`}
          >
            {cat === 'all' ? 'Wszystkie płótna' : cat}
          </button>
        ))}

        {favorites.length > 0 && (
          <button
            onClick={() => setActiveCategory('favorites')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 transition-all duration-300 border ${
              activeCategory === 'favorites'
                ? 'border-[#C5A880] text-[#F2F0EA] bg-[#161616]'
                : 'border-transparent text-[#C5A880] hover:border-[#2A2927]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-[#C5A880]" />
            <span>Wybrane ({favorites.length})</span>
          </button>
        )}
      </div>

      {/* Content Area with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${activeCategory}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Empty State */}
          {filteredArtworks.length === 0 && (
            <div className="py-24 text-center border border-[#2A2927] p-8 bg-[#111111]">
              <p className="font-serif-luxury text-xl text-[#F2F0EA]">
                Brak dzieł w wybranym filtrze
              </p>
              <p className="text-xs text-[#AAA69D] mt-2">
                Wróć do pełnej kolekcji, aby kontynuować oglądanie.
              </p>
              <button
                onClick={() => setActiveCategory('all')}
                className="mt-6 border border-[#2A2927] hover:border-[#C5A880] px-5 py-2 text-xs uppercase tracking-widest text-[#F2F0EA]"
              >
                Pokaż całą kolekcję
              </button>
            </div>
          )}

          {/* 1. WIDOK ŚCIANY (MUSEUM WALL VIEW) */}
          {viewMode === 'wall' && filteredArtworks.length > 0 && (
            <div className="relative border border-[#2A2927] bg-[#0E0E0E] py-14 px-6 overflow-hidden">
              {/* Wall Spotlight Gradient */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1C1C1C]/40 to-transparent pointer-events-none" />

              {/* Wall Navigation Controls */}
              <div className="flex items-center justify-between mb-8 text-xs text-[#AAA69D]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
                    Sala ekspozycyjna
                  </span>
                  <span className="text-[11px] text-[#666]">
                    • Przewijaj w poziomie, aby spacerować wzdłuż ściany
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollWall('left')}
                    className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                    aria-label="Przewiń w lewo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollWall('right')}
                    className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                    aria-label="Przewiń w prawo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Gallery Wall Track */}
              <div
                ref={wallScrollRef}
                className="flex items-end gap-12 sm:gap-20 overflow-x-auto pb-10 pt-6 scrollbar-none snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
              >
                {filteredArtworks.map((art, idx) => (
                  <div
                    key={art.id}
                    className="shrink-0 snap-center w-[300px] sm:w-[380px] group cursor-pointer"
                    onClick={() => onSelectArtwork(art)}
                  >
                    {/* Spot illumination top glow */}
                    <div className="w-full flex justify-center mb-3">
                      <div className="w-12 h-0.5 bg-[#C5A880]/30 rounded-full" />
                    </div>

                    {/* Canvas Container */}
                    <div className="relative border border-[#2A2927] p-2.5 bg-[#111111] group-hover:border-[#C5A880] transition-colors shadow-2xl">
                      <div
                        className="relative w-full aspect-[4/3] overflow-hidden bg-[#0B0B0B]"
                        suppressHydrationWarning
                      >
                        <Image
                          src={art.image}
                          alt={art.title}
                          fill
                          unoptimized
                          sizes="400px"
                          className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                          referrerPolicy="no-referrer"
                          suppressHydrationWarning
                        />
                      </div>

                      {/* Museum Wall Plaque */}
                      <div className="mt-3 pt-2.5 border-t border-[#2A2927]/60 flex items-baseline justify-between px-1">
                        <div>
                          <span className="text-[10px] font-mono text-[#C5A880] block">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h4 className="font-serif-luxury text-base text-[#F2F0EA] leading-snug">
                            {art.title}
                          </h4>
                          <p className="text-[10px] text-[#888]">
                            {art.year} • {art.width} × {art.height} cm
                          </p>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity">
                          Otwórz
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Museum Floor Line Baseboard */}
              <div className="border-t border-[#2A2927] pt-3 flex items-center justify-between text-[11px] text-[#666]">
                <span>Ekspozycja: {filteredArtworks.length} obrazów</span>
                <span className="font-serif-luxury italic text-[#888]">
                  Prywatna przestrzeń wystawowa
                </span>
              </div>
            </div>
          )}

          {/* 2. CHRONOLOGY VIEW */}
          {viewMode === 'chronology' && filteredArtworks.length > 0 && (
            <div className="space-y-20">
              {chronologicalGroups.map(([year, arts]) => (
                <div key={year} className="relative pl-6 sm:pl-10 border-l border-[#2A2927]">
                  {/* Year Marker */}
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-[#111111] border border-[#C5A880] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-[#C5A880]" />
                  </div>

                  <span className="font-serif-luxury text-3xl sm:text-4xl text-[#C5A880] block mb-10 font-light">
                    {year}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {arts.map((art) => (
                      <ArtworkCardItem
                        key={art.id}
                        artwork={art}
                        isFavorite={favorites.includes(art.id)}
                        onSelect={() => onSelectArtwork(art)}
                        onToggleFavorite={() => onToggleFavorite(art.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. EDITORIAL GALLERY ASYMMETRICAL RHYTHM */}
          {viewMode === 'editorial' && filteredArtworks.length > 0 && (
            <div className="space-y-28 sm:space-y-36">
              {renderEditorialRhythm(filteredArtworks, favorites, onSelectArtwork, onToggleFavorite)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

// Generous, museum-curated layout rhythm:
// 1. Monumental 70% feature
// 2. Asymmetrical offset pair (one raised, one lowered)
// 3. Lone contemplation artwork with wide margins
// 4. Narrow + Wide pairing
function renderEditorialRhythm(
  items: Artwork[],
  favorites: string[],
  onSelect: (art: Artwork) => void,
  onToggleFavorite: (id: string) => void
) {
  const sections: React.ReactNode[] = [];
  let i = 0;
  let sectionIndex = 0;

  while (i < items.length) {
    const pattern = sectionIndex % 4;

    if (pattern === 0) {
      // 1. MONUMENTAL CENTRED FEATURE (70% width, deep contemplation)
      const art = items[i];
      sections.push(
        <div key={`section-${sectionIndex}-${art.id}`} className="max-w-4xl mx-auto">
          <ArtworkCardItem
            artwork={art}
            isFavorite={favorites.includes(art.id)}
            onSelect={() => onSelect(art)}
            onToggleFavorite={() => onToggleFavorite(art.id)}
            large
          />
        </div>
      );
      i += 1;
    } else if (pattern === 1) {
      // 2. ASYMMETRICAL OFFSET PAIR (One higher, one lower)
      const art1 = items[i];
      const art2 = items[i + 1];

      if (art2) {
        sections.push(
          <div
            key={`section-${sectionIndex}-${art1.id}`}
            className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-20 items-center"
          >
            <div className="md:col-span-5 md:-translate-y-8">
              <ArtworkCardItem
                artwork={art1}
                isFavorite={favorites.includes(art1.id)}
                onSelect={() => onSelect(art1)}
                onToggleFavorite={() => onToggleFavorite(art1.id)}
              />
            </div>
            <div className="md:col-span-7 md:translate-y-8">
              <ArtworkCardItem
                artwork={art2}
                isFavorite={favorites.includes(art2.id)}
                onSelect={() => onSelect(art2)}
                onToggleFavorite={() => onToggleFavorite(art2.id)}
                large
              />
            </div>
          </div>
        );
        i += 2;
      } else {
        sections.push(
          <div key={`section-${sectionIndex}-${art1.id}`} className="max-w-2xl mx-auto">
            <ArtworkCardItem
              artwork={art1}
              isFavorite={favorites.includes(art1.id)}
              onSelect={() => onSelect(art1)}
              onToggleFavorite={() => onToggleFavorite(art1.id)}
            />
          </div>
        );
        i += 1;
      }
    } else if (pattern === 2) {
      // 3. LONE ARTWORK IN SPACE (Generous side margins, contemplative peace)
      const art = items[i];
      sections.push(
        <div
          key={`section-${sectionIndex}-${art.id}`}
          className="max-w-2xl mx-auto my-6 sm:my-12 px-2"
        >
          <div className="mb-3 text-center">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]/80">
              Studium przestrzeni
            </span>
          </div>
          <ArtworkCardItem
            artwork={art}
            isFavorite={favorites.includes(art.id)}
            onSelect={() => onSelect(art)}
            onToggleFavorite={() => onToggleFavorite(art.id)}
            large
          />
        </div>
      );
      i += 1;
    } else {
      // 4. NARROW + WIDE PAIRING
      const art1 = items[i];
      const art2 = items[i + 1];

      if (art2) {
        sections.push(
          <div
            key={`section-${sectionIndex}-${art1.id}`}
            className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-end"
          >
            <div className="md:col-span-4">
              <ArtworkCardItem
                artwork={art1}
                isFavorite={favorites.includes(art1.id)}
                onSelect={() => onSelect(art1)}
                onToggleFavorite={() => onToggleFavorite(art1.id)}
              />
            </div>
            <div className="md:col-span-8">
              <ArtworkCardItem
                artwork={art2}
                isFavorite={favorites.includes(art2.id)}
                onSelect={() => onSelect(art2)}
                onToggleFavorite={() => onToggleFavorite(art2.id)}
                large
              />
            </div>
          </div>
        );
        i += 2;
      } else {
        sections.push(
          <div key={`section-${sectionIndex}-${art1.id}`} className="max-w-2xl mx-auto">
            <ArtworkCardItem
              artwork={art1}
              isFavorite={favorites.includes(art1.id)}
              onSelect={() => onSelect(art1)}
              onToggleFavorite={() => onToggleFavorite(art1.id)}
            />
          </div>
        );
        i += 1;
      }
    }

    sectionIndex++;
  }

  return sections;
}

interface ArtworkCardItemProps {
  artwork: Artwork;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  large?: boolean;
}

const ArtworkCardItem: React.FC<ArtworkCardItemProps> = ({
  artwork,
  isFavorite,
  onSelect,
  onToggleFavorite,
  large = false,
}) => {
  return (
    <div
      className="group relative cursor-pointer"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect();
      }}
      aria-label={`Otwórz dzieło ${artwork.title}, rok ${artwork.year}`}
    >
      {/* Canvas container: clean 1px border, 0px radius */}
      <div className="relative border border-[#2A2927] p-2 sm:p-3.5 bg-[#111111] group-hover:border-[#C5A880]/70 transition-all duration-500 shadow-xl overflow-hidden">
        {/* Subtle museum vignette on hover */}
        <div className="absolute inset-0 bg-[#0B0B0B]/0 group-hover:bg-[#0B0B0B]/15 transition-colors z-10 pointer-events-none" />

        {/* Favorite button: quiet outline */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-4 right-4 z-20 p-2 border border-[#2A2927] transition-all duration-300 ${
            isFavorite
              ? 'bg-[#111111] text-[#C5A880] border-[#C5A880]'
              : 'bg-[#111111]/80 text-[#AAA69D] hover:text-[#C5A880] opacity-80 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#C5A880]' : ''}`} />
        </button>

        {/* Image Display with subtle scale on hover */}
        <div
          className={`relative w-full overflow-hidden bg-[#0B0B0B] ${
            large ? 'aspect-[4/3] sm:aspect-[16/11]' : 'aspect-[4/3] sm:aspect-[4/3]'
          }`}
          suppressHydrationWarning
        >
          <Image
            src={artwork.image}
            alt={artwork.title}
            fill
            unoptimized
            sizes={
              large
                ? '(max-width: 768px) 100vw, 900px'
                : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px'
            }
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            referrerPolicy="no-referrer"
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* REFINED EXHIBITION PLAQUE:
          Only Title (serif, larger) and Year (subtle sans), no noise
      */}
      <div className="mt-3 flex items-baseline justify-between px-1">
        <h3 className="font-serif-luxury text-lg sm:text-xl text-[#F2F0EA] group-hover:text-[#C5A880] transition-colors font-normal">
          {artwork.title}
        </h3>
        <span className="text-xs text-[#AAA69D] font-light tracking-wider">
          {artwork.year}
        </span>
      </div>
    </div>
  );
};

