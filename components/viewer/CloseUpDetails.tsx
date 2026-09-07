'use client';

import React from 'react';
import Image from 'next/image';
import { Artwork } from '@/types/gallery';
import { X, Sparkles } from 'lucide-react';

interface CloseUpDetailsProps {
  artwork: Artwork;
  onClose: () => void;
}

export const CloseUpDetails: React.FC<CloseUpDetailsProps> = ({
  artwork,
  onClose,
}) => {
  if (!artwork.details || artwork.details.length === 0) return null;

  return (
    <div
      id="artwork-closeup-modal"
      className="fixed inset-0 z-50 bg-[#0B0B0B]/98 backdrop-blur-xl flex flex-col justify-between overflow-y-auto p-4 sm:p-8"
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-[#2A2927] pb-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
              Tryb Blisko • Studium Detalu
            </span>
          </div>
          <h3 className="font-serif-luxury text-2xl text-[#F2F0EA] mt-1">
            {artwork.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 border border-[#2A2927] hover:border-[#F2F0EA] text-[#F2F0EA] transition-colors"
          title="Zamknij (Esc)"
          aria-label="Zamknij studium detalu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content: Overview + Detail macro cards */}
      <div className="max-w-5xl mx-auto w-full space-y-12 pb-16">
        {/* Full Artwork Overview reference */}
        <div className="border border-[#2A2927] p-3 sm:p-4 bg-[#111111] max-w-xl mx-auto">
          <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#0B0B0B]">
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-center text-xs text-[#AAA69D] mt-2 font-serif-luxury italic">
            Widok całości kompozycji
          </p>
        </div>

        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A880]">
            Zarejestrowane fragmenty malarskie
          </span>
          <div className="w-12 h-[1px] bg-[#C5A880]/40 mx-auto mt-2" />
        </div>

        {/* List of Details */}
        <div className="space-y-10">
          {artwork.details.map((detail, index) => (
            <div
              key={detail.id}
              className="border border-[#2A2927] bg-[#111111] p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0B0B0B] border border-[#2A2927]/60">
                  <Image
                    src={detail.image}
                    alt={detail.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="md:col-span-5 space-y-3">
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880] font-sans">
                  DETAL 0{index + 1}
                </span>
                <h4 className="font-serif-luxury text-xl sm:text-2xl text-[#F2F0EA]">
                  {detail.title}
                </h4>
                <p className="text-xs text-[#AAA69D] leading-relaxed">
                  {detail.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
