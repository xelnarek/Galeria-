'use client';

import { useState, useEffect } from 'react';

export interface OrientationState {
  isPortrait: boolean;
  isLandscape: boolean;
  angle: number;
}

export function useOrientation(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationState>({
    isPortrait: true,
    isLandscape: false,
    angle: 0,
  });

  useEffect(() => {
    const updateOrientation = () => {
      if (typeof window === 'undefined') return;

      const isPortrait = window.innerHeight > window.innerWidth;
      const angle =
        typeof window.screen !== 'undefined' &&
        typeof window.screen.orientation !== 'undefined'
          ? window.screen.orientation.angle || 0
          : 0;

      setOrientation({
        isPortrait,
        isLandscape: !isPortrait,
        angle,
      });
    };

    updateOrientation();

    // Listeners for resize, screen.orientation, and media query changes
    window.addEventListener('resize', updateOrientation, { passive: true });
    window.addEventListener('orientationchange', updateOrientation, { passive: true });

    if (typeof window.screen !== 'undefined' && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', updateOrientation);
    }

    const mql = window.matchMedia('(orientation: portrait)');
    mql.addEventListener('change', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
      if (typeof window.screen !== 'undefined' && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', updateOrientation);
      }
      mql.removeEventListener('change', updateOrientation);
    };
  }, []);

  return orientation;
}
