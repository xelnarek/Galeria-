'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const MuseumCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'artwork' | 'pointer'>('default');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(true);

  useEffect(() => {
    // Check for touch / pointer capabilities
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    };
    checkTouch();

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if hovering over an artwork element
      if (
        target.closest('[data-cursor="artwork"]') ||
        target.closest('.group[role="button"]') ||
        target.closest('#dedicated-artwork-viewport')
      ) {
        setCursorType('artwork');
      } else if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button'
      ) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Don't render on mobile / touch devices
  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {/* Artwork hover state: 48px circle with "OBEJRZYJ" label */}
      {cursorType === 'artwork' ? (
        <motion.div
          animate={{
            x: position.x - 30,
            y: position.y - 30,
            scale: 1,
            opacity: 1,
          }}
          transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.5 }}
          className="w-16 h-16 rounded-full border border-[#C5A880]/80 bg-[#161616]/75 backdrop-blur-sm flex items-center justify-center text-[9px] uppercase tracking-[0.22em] text-[#F2F0EA] font-medium shadow-lg"
        >
          Obejrzyj
        </motion.div>
      ) : cursorType === 'pointer' ? (
        /* Pointer button hover: small glowing gold ring */
        <motion.div
          animate={{
            x: position.x - 12,
            y: position.y - 12,
            scale: 1.2,
            opacity: 0.85,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.4 }}
          className="w-6 h-6 rounded-full border border-[#C5A880] bg-[#C5A880]/15"
        />
      ) : (
        /* Default state: subtle, precise 6px dot */
        <motion.div
          animate={{
            x: position.x - 3,
            y: position.y - 3,
            scale: 1,
            opacity: 0.6,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 450, mass: 0.3 }}
          className="w-1.5 h-1.5 rounded-full bg-[#F2F0EA]"
        />
      )}
      </div>
    </>
  );
};
