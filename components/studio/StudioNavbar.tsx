'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';

export type StudioTab = 'kolekcja' | 'artysta' | 'ustawienia';

interface StudioNavbarProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  artworksCount: number;
}

export const StudioNavbar: React.FC<StudioNavbarProps> = ({
  activeTab,
  onTabChange,
  artworksCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[#2A2927]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Top Row: Title, Local Status, Back link */}
        <div className="flex items-center justify-between py-4 border-b border-[#1A1918]">
          <div className="flex items-baseline gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
              title="Powrót do publicznej galerii"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Galeria</span>
            </Link>

            <span className="text-[#2A2927] hidden sm:inline">|</span>

            <div>
              <h1 className="font-serif-luxury text-xl sm:text-2xl text-[#F2F0EA] tracking-wide font-normal">
                Studio Kuratora
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
                Archiwum i zarządzanie kolekcją
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Archival mode status badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#2A2927] bg-[#111111] text-[11px] text-[#AAA69D]"
              title="Dane są trwale zapisywane w bezpiecznej lokalnej bazie IndexedDB przeglądarki"
            >
              <Database className="w-3 h-3 text-[#C5A880]" />
              <span className="hidden md:inline text-[10px] uppercase tracking-wider text-[#888]">Status:</span>
              <span className="text-[#C5A880] text-[11px] font-mono">Zmiany zapisane lokalnie</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Minimalist Navigation Tabs */}
        <div className="flex items-center justify-between pt-1">
          <nav className="flex items-center gap-2 sm:gap-6 text-xs uppercase tracking-[0.2em]">
            <button
              onClick={() => onTabChange('kolekcja')}
              className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'kolekcja'
                  ? 'border-[#C5A880] text-[#F2F0EA]'
                  : 'border-transparent text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
            >
              <span>Kolekcja</span>
              <span className="text-[10px] font-mono text-[#C5A880] px-1.5 py-0.5 bg-[#161616] border border-[#2A2927]">
                {artworksCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('artysta')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === 'artysta'
                  ? 'border-[#C5A880] text-[#F2F0EA]'
                  : 'border-transparent text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
            >
              Artysta i dedykacja
            </button>

            <button
              onClick={() => onTabChange('ustawienia')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === 'ustawienia'
                  ? 'border-[#C5A880] text-[#F2F0EA]'
                  : 'border-transparent text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
            >
              Kopia i archiwum
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
