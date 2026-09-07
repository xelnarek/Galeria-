'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { artistData } from '@/data/gallery-data';
import { AmbientSound } from '@/components/audio/AmbientSound';
import { Heart, Menu, X, Eye } from 'lucide-react';

interface NavbarProps {
  onOpenExhibition?: () => void;
  favoritesCount?: number;
  onSelectCategory?: (cat: string) => void;
  artistName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenExhibition,
  favoritesCount = 0,
  artistName,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = artistName || artistData.name;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        id="main-navigation-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2927] py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          {/* Brand / Artist name */}
          <Link
            href="/"
            className="group flex flex-col items-start focus:outline-none"
            onClick={closeMenu}
          >
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#AAA69D] group-hover:text-[#C5A880] transition-colors">
              Prywatna Galeria
            </span>
            <span className="font-serif-luxury text-lg sm:text-xl tracking-wide text-[#F2F0EA] font-normal group-hover:text-white transition-colors">
              {displayName}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs tracking-[0.18em] uppercase text-[#AAA69D]">
            <Link
              href="#kolekcja"
              className="hover:text-[#F2F0EA] transition-colors py-1 flex items-center gap-1.5 group"
            >
              <span className="text-[10px] text-[#C5A880] font-mono">01</span>
              <span>Kolekcja</span>
            </Link>
            <Link
              href="#historie"
              className="hover:text-[#F2F0EA] transition-colors py-1 flex items-center gap-1.5 group"
            >
              <span className="text-[10px] text-[#C5A880] font-mono">02</span>
              <span>Historie</span>
            </Link>
            <Link
              href="#artysta"
              className="hover:text-[#F2F0EA] transition-colors py-1 flex items-center gap-1.5 group"
            >
              <span className="text-[10px] text-[#C5A880] font-mono">03</span>
              <span>O artyście</span>
            </Link>
            <Link
              href="#o-kolekcji"
              className="hover:text-[#F2F0EA] transition-colors py-1 flex items-center gap-1.5 group"
            >
              <span className="text-[10px] text-[#C5A880] font-mono">04</span>
              <span>O kolekcji</span>
            </Link>
            <Link
              href="/studio"
              className="hover:text-[#C5A880] transition-colors py-1 flex items-center gap-1.5 group text-[#C5A880]/80"
              title="Przejdź do Studia Kuratora"
            >
              <span className="text-[10px] text-[#C5A880] font-mono">05</span>
              <span>Studio</span>
            </Link>

            {/* Exhibition CTA */}
            {onOpenExhibition && (
              <button
                id="navbar-exhibition-btn"
                onClick={onOpenExhibition}
                className="inline-flex items-center gap-2 border border-[#C5A880]/60 hover:border-[#C5A880] bg-[#161616]/60 hover:bg-[#C5A880]/10 text-[#F2F0EA] hover:text-[#C5A880] px-3.5 py-1.5 transition-all text-xs tracking-[0.2em] uppercase"
              >
                <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Wystawa</span>
              </button>
            )}

            {/* Subtle Controls */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#2A2927]">
              <AmbientSound />
              {favoritesCount > 0 && (
                <Link
                  href="#kolekcja"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-white transition-colors"
                  title="Wyświetl ulubione dzieła"
                >
                  <Heart className="w-3.5 h-3.5 fill-[#C5A880]" />
                  <span className="font-mono text-[11px]">{favoritesCount}</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Actions: Exhibition trigger & menu button */}
          <div className="flex items-center gap-2.5 lg:hidden">
            {onOpenExhibition && (
              <button
                onClick={onOpenExhibition}
                className="border border-[#C5A880]/70 text-[#C5A880] px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase flex items-center gap-1.5"
                aria-label="Rozpocznij wystawę"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Wystawa</span>
              </button>
            )}

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F2F0EA] border border-[#2A2927] hover:border-[#C5A880] transition-colors"
              aria-label={mobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu nawigacji'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Overlay Menu (Curatorial Exhibition Index) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 z-30 bg-[#0B0B0B]/98 backdrop-blur-2xl flex flex-col justify-between p-7 pt-24 lg:hidden animate-fade-in border-b border-[#2A2927]"
        >
          <div className="flex flex-col space-y-8 my-auto">
            <div className="border-b border-[#2A2927] pb-3">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880]">
                Wystawa • Spis sekcji
              </span>
            </div>

            <nav className="flex flex-col space-y-6">
              <Link
                href="#kolekcja"
                onClick={closeMenu}
                className="group flex items-baseline gap-4 text-left"
              >
                <span className="text-sm font-mono text-[#C5A880] tracking-wider">
                  01
                </span>
                <span className="font-serif-luxury text-3xl sm:text-4xl text-[#F2F0EA] group-hover:text-[#C5A880] transition-colors font-light">
                  Kolekcja
                </span>
              </Link>

              <Link
                href="#historie"
                onClick={closeMenu}
                className="group flex items-baseline gap-4 text-left"
              >
                <span className="text-sm font-mono text-[#C5A880] tracking-wider">
                  02
                </span>
                <span className="font-serif-luxury text-3xl sm:text-4xl text-[#F2F0EA] group-hover:text-[#C5A880] transition-colors font-light">
                  Historie
                </span>
              </Link>

              <Link
                href="#artysta"
                onClick={closeMenu}
                className="group flex items-baseline gap-4 text-left"
              >
                <span className="text-sm font-mono text-[#C5A880] tracking-wider">
                  03
                </span>
                <span className="font-serif-luxury text-3xl sm:text-4xl text-[#F2F0EA] group-hover:text-[#C5A880] transition-colors font-light">
                  O artyście
                </span>
              </Link>

              <Link
                href="#o-kolekcji"
                onClick={closeMenu}
                className="group flex items-baseline gap-4 text-left"
              >
                <span className="text-sm font-mono text-[#C5A880] tracking-wider">
                  04
                </span>
                <span className="font-serif-luxury text-3xl sm:text-4xl text-[#F2F0EA] group-hover:text-[#C5A880] transition-colors font-light">
                  O kolekcji
                </span>
              </Link>

              <Link
                href="/studio"
                onClick={closeMenu}
                className="group flex items-baseline gap-4 text-left pt-2 border-t border-[#2A2927]/60"
              >
                <span className="text-sm font-mono text-[#C5A880] tracking-wider">
                  05
                </span>
                <span className="font-serif-luxury text-2xl sm:text-3xl text-[#C5A880] group-hover:text-white transition-colors font-light">
                  Studio Kuratora
                </span>
              </Link>
            </nav>

            {onOpenExhibition && (
              <div className="pt-4 border-t border-[#2A2927]">
                <button
                  onClick={() => {
                    closeMenu();
                    onOpenExhibition();
                  }}
                  className="w-full border border-[#C5A880] bg-[#161616] py-3 text-xs tracking-[0.25em] uppercase text-[#F2F0EA] flex items-center justify-center gap-2 hover:bg-[#C5A880]/15 transition-colors"
                >
                  <Eye className="w-4 h-4 text-[#C5A880]" />
                  <span>Rozpocznij wystawę pełnoekranową</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom utilities in mobile menu */}
          <div className="border-t border-[#2A2927] pt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#AAA69D]">Tło dźwiękowe:</span>
              <AmbientSound />
            </div>
            <p className="text-[11px] text-[#777] tracking-wider text-center pt-1 font-serif-luxury italic">
              Prywatna wystawa sztuki — stworzone z miłością dla ojca
            </p>
          </div>
        </div>
      )}
    </>
  );
};
