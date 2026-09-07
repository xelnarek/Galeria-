'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Artwork } from '@/types/gallery';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ArtworkZoomViewerProps {
  artwork: Artwork;
  onClose: () => void;
}

export const ArtworkZoomViewer: React.FC<ArtworkZoomViewerProps> = ({
  artwork,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialScaleOnTouchRef = useRef<number>(1);

  // Reset zoom & pan
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Lock body scroll while zoom viewer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-' || e.key === '_') handleZoomOut();
      if (e.key === '0') handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleZoomIn, handleZoomOut, handleReset]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click to toggle zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.2);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;
        setPosition({ x: -offsetX * 1.2, y: -offsetY * 1.2 });
      }
    }
  };

  // Touch pinch & pan handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistanceRef.current = dist;
      initialScaleOnTouchRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialTouchDistanceRef.current;
      const next = Math.min(Math.max(initialScaleOnTouchRef.current * factor, 1), 4);
      setScale(next);
      if (next === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
    setIsDragging(false);
  };

  return (
    <div
      id="artwork-zoom-modal"
      className="fixed inset-0 z-50 bg-[#0B0B0B]/98 backdrop-blur-xl flex flex-col justify-between select-none"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 border-b border-[#2A2927]">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880]">
            Tryb Badania Dzieła • Powiększenie {Math.round(scale * 100)}%
          </span>
          <h3 className="font-serif-luxury text-lg sm:text-xl text-[#F2F0EA]">
            {artwork.title}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Preset scales */}
          <div className="hidden sm:flex items-center border border-[#2A2927] mr-1">
            <button
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              className={`px-2 py-1 text-[10px] font-mono transition-colors ${
                scale === 1 ? 'bg-[#C5A880] text-[#0B0B0B]' : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
            >
              100%
            </button>
            <button
              onClick={() => {
                setScale(2);
                setPosition({ x: 0, y: 0 });
              }}
              className={`px-2 py-1 text-[10px] font-mono transition-colors ${
                scale === 2 ? 'bg-[#C5A880] text-[#0B0B0B]' : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
            >
              200%
            </button>
            <button
              onClick={() => {
                setScale(3);
                setPosition({ x: 0, y: 0 });
              }}
              className={`px-2 py-1 text-[10px] font-mono transition-colors ${
                scale === 3 ? 'bg-[#C5A880] text-[#0B0B0B]' : 'text-[#AAA69D] hover:text-[#F2F0EA]'
              }`}
            >
              300%
            </button>
          </div>

          <button
            onClick={handleZoomIn}
            className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
            title="Przybliż (+)"
            aria-label="Przybliż"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
            title="Oddal (-)"
            aria-label="Oddal"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
            title="Resetuj widok (0)"
            aria-label="Resetuj widok"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 border border-[#2A2927] hover:border-[#F2F0EA] text-[#F2F0EA] transition-colors ml-2"
            title="Zamknij (Esc)"
            aria-label="Zamknij podgląd"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-hidden flex items-center justify-center ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            transformOrigin: 'center center',
          }}
          className="relative w-[92vw] h-[72vh] max-w-5xl"
        >
          <Image
            src={artwork.image}
            alt={artwork.title}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-contain pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 py-3 px-6 border-t border-[#2A2927] flex items-center justify-between text-[11px] text-[#AAA69D]">
        <span>
          Użyj kółka myszy, gestu szczypania lub podwójnego kliknięcia, aby przyjrzeć się pociągnięciom pędzla.
        </span>
        <span className="hidden sm:inline text-[#777]">
          Klawisze: Esc (zamknij), + / - (powiększenie)
        </span>
      </div>
    </div>
  );
};
