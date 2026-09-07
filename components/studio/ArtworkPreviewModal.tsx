'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Artwork } from '@/types/gallery';
import { X, Eye, Maximize2, LayoutGrid, Sparkles } from 'lucide-react';

interface ArtworkPreviewModalProps {
  artwork: Artwork;
  onClose: () => void;
}

export const ArtworkPreviewModal: React.FC<ArtworkPreviewModalProps> = ({
  artwork,
  onClose,
}) => {
  const [viewTab, setViewTab] = useState<'view' | 'card' | 'exhibition'>('view');

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Podgląd kuratorski: ${artwork.title}`}
    >
      {/* Top Preview Control Bar */}
      <div className="sticky top-0 z-30 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2927] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880] flex items-center gap-1.5 font-mono">
            <Eye className="w-3.5 h-3.5" />
            <span>Podgląd kuratorski</span>
          </span>
          <span className="text-[#2A2927]">•</span>
          <span className="font-serif-luxury text-lg text-[#F2F0EA]">
            „{artwork.title}” ({artwork.year})
          </span>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-2 border border-[#2A2927] bg-[#111111] p-1 text-xs uppercase tracking-wider">
          <button
            onClick={() => setViewTab('view')}
            className={`px-3 py-1 transition-colors ${
              viewTab === 'view'
                ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                : 'text-[#AAA69D] hover:text-[#F2F0EA]'
            }`}
          >
            Artwork View
          </button>
          <button
            onClick={() => setViewTab('card')}
            className={`px-3 py-1 transition-colors ${
              viewTab === 'card'
                ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                : 'text-[#AAA69D] hover:text-[#F2F0EA]'
            }`}
          >
            Karta w galerii
          </button>
          <button
            onClick={() => setViewTab('exhibition')}
            className={`px-3 py-1 transition-colors ${
              viewTab === 'exhibition'
                ? 'bg-[#161616] text-[#F2F0EA] border border-[#2A2927]'
                : 'text-[#AAA69D] hover:text-[#F2F0EA]'
            }`}
          >
            Tryb wystawy
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 border border-[#2A2927] hover:border-[#F2F0EA] text-[#F2F0EA] transition-colors"
          aria-label="Zamknij podgląd"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Preview Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-12 flex items-center justify-center">
        {/* 1. ARTWORK VIEW PREVIEW */}
        {viewTab === 'view' && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative w-full border border-[#2A2927] p-3 sm:p-4 bg-[#111111] shadow-2xl">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#0B0B0B]">
                  {artwork.image ? (
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      unoptimized
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#666]">
                      Brak zdjęcia głównego
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#2A2927]/60 flex items-center justify-between text-[11px] text-[#888]">
                  <span>Format: {artwork.width} × {artwork.height} cm</span>
                  <span className="font-mono text-[#C5A880]">Slug: /artworks/{artwork.slug}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="border-b border-[#2A2927] pb-6 space-y-3">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
                  {artwork.category}
                </span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#F2F0EA] font-light">
                  {artwork.title}
                </h2>
                <p className="text-xs text-[#AAA69D]">
                  {artwork.year} • {artwork.medium}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
                  O dziele
                </h4>
                <p className="text-xs sm:text-sm text-[#AAA69D] leading-relaxed font-light">
                  {artwork.description || 'Brak opisu kuratorskiego.'}
                </p>
              </div>

              {artwork.story && (artwork.story.origin || artwork.story.meaning) && (
                <div className="space-y-3 border-t border-[#2A2927] pt-4">
                  <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
                    Historia i geneza
                  </h4>
                  {artwork.story.origin && (
                    <p className="text-xs text-[#AAA69D] leading-relaxed">
                      {artwork.story.origin}
                    </p>
                  )}
                  {artwork.story.curatorialNote && (
                    <div className="border-l-2 border-[#C5A880]/40 pl-3 py-1 bg-[#111111]/40">
                      <p className="font-serif-luxury text-xs italic text-[#C5A880]">
                        „{artwork.story.curatorialNote}”
                      </p>
                    </div>
                  )}
                </div>
              )}

              {artwork.details && artwork.details.length > 0 && (
                <div className="border-t border-[#2A2927] pt-4 space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Detale ({artwork.details.length})</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {artwork.details.map((det) => (
                      <div key={det.id} className="border border-[#2A2927] p-2 bg-[#111111]">
                        <div className="relative aspect-video w-full bg-[#0B0B0B] mb-1.5">
                          {det.image && (
                            <Image
                              src={det.image}
                              alt={det.title}
                              fill
                              unoptimized
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <p className="font-serif-luxury text-xs text-[#F2F0EA] truncate">
                          {det.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CARD IN GALLERY PREVIEW */}
        {viewTab === 'card' && (
          <div className="w-full max-w-md">
            <div className="text-center mb-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#777]">
                Podgląd eksponatu w siatce kolekcji
              </span>
            </div>
            <div className="relative border border-[#2A2927] p-3 bg-[#111111] shadow-2xl">
              <div className="relative w-full aspect-[4/3] bg-[#0B0B0B] overflow-hidden">
                {artwork.image ? (
                  <Image
                    src={artwork.thumbnail || artwork.image}
                    alt={artwork.title}
                    fill
                    unoptimized
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#666]">
                    Brak zdjęcia
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between px-1">
                <h3 className="font-serif-luxury text-xl text-[#F2F0EA] font-normal">
                  {artwork.title}
                </h3>
                <span className="text-xs text-[#AAA69D] font-light">
                  {artwork.year}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. EXHIBITION SLIDE PREVIEW */}
        {viewTab === 'exhibition' && (
          <div className="w-full max-w-5xl h-[70vh] border border-[#2A2927] bg-[#080808] relative flex flex-col justify-between p-6 sm:p-10 shadow-2xl">
            <div className="flex items-center justify-between text-[10px] text-[#777] uppercase tracking-widest font-mono">
              <span>Wystawa • Pokaz slajdów</span>
              <span className="text-[#C5A880]">01 / 01</span>
            </div>

            <div className="relative flex-1 my-4 flex items-center justify-center">
              <div className="relative w-full h-full max-w-3xl">
                {artwork.image ? (
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    unoptimized
                    className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#666]">
                    Brak zdjęcia
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif-luxury text-2xl text-[#F2F0EA] font-light">
                {artwork.title}
              </h3>
              <p className="text-xs text-[#AAA69D]">
                {artwork.year} • {artwork.medium} ({artwork.width} × {artwork.height} cm)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer notice */}
      <div className="p-4 border-t border-[#2A2927] bg-[#0B0B0B] text-center text-xs text-[#777]">
        To jest podgląd roboczy. Dzieło o statusie „{artwork.status || 'published'}” będzie widoczne zgodnie z ustawioną widocznością.
      </div>
    </div>
  );
};
