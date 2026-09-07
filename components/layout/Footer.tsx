'use client';

import React from 'react';
import { artistData, collectionData } from '@/data/gallery-data';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#2A2927] bg-[#0B0B0B] py-16 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880] block mb-1">
            Katalog Artystyczny
          </span>
          <h3 className="font-serif-luxury text-2xl text-[#F2F0EA] font-light">
            {artistData.name}
          </h3>
          <p className="font-serif-luxury text-sm italic text-[#AAA69D] mt-1">
            „{collectionData.giftDedication}”
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 text-xs text-[#777]">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 border border-[#2A2927] hover:border-[#C5A880] px-3.5 py-1.5 rounded-full text-[#AAA69D] hover:text-[#F2F0EA] transition-colors uppercase tracking-wider text-[11px]"
            aria-label="Wróć na górę strony"
          >
            <span>Do góry</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#C5A880]" />
          </button>
          <p className="text-[11px] tracking-wider">
            Prywatna galeria cyfrowa • Wszelkie prawa do dzieł zastrzeżone
          </p>
        </div>
      </div>
    </footer>
  );
};
