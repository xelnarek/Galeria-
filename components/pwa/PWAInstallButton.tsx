'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Download, Share, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const isMounted = useIsMounted();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (!isMounted) {
    return null;
  }

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-button"
        onClick={install}
        className="inline-flex items-center gap-2 border border-[#2A2927] hover:border-[#C5A880] px-3.5 py-1.5 rounded-full text-xs tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] transition-colors duration-200"
        title="Zainstaluj galerię jako aplikację na urządzeniu"
        aria-label="Zainstaluj aplikację galerii"
      >
        <Download className="w-3.5 h-3.5 text-[#C5A880]" />
        <span>Zainstaluj aplikację</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 border border-[#2A2927] hover:border-[#C5A880] px-3.5 py-1.5 rounded-full text-xs tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] transition-colors duration-200"
          title="Zainstaluj galerię na ekranie głównym iPhone / iPad"
          aria-label="Instrukcja instalacji na iOS"
        >
          <Share className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Dodaj do ekranu</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setShowIOSGuide(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-guide-title"
          >
            <div
              className="w-full max-w-sm border border-[#2A2927] bg-[#111111] p-6 shadow-2xl relative text-[#F2F0EA] rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-[#AAA69D] hover:text-[#F2F0EA] transition-colors duration-200"
                aria-label="Zamknij instrukcję"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 id="ios-guide-title" className="font-serif-luxury text-xl text-[#F2F0EA] mb-3">
                Zainstaluj wystawę na telefonie
              </h3>
              <p className="text-xs text-[#AAA69D] leading-relaxed mb-4">
                Aby oglądać obrazy jak w dedykowanej aplikacji muzealnej bez pasków przeglądarki:
              </p>
              <ol className="text-xs text-[#AAA69D] space-y-2 list-decimal list-inside border-t border-[#2A2927] pt-3">
                <li>
                  Dotknij przycisku <span className="text-[#F2F0EA] font-medium">Udostępnij</span> (ikona kwadratu ze strzałką w Safari).
                </li>
                <li>
                  Przewiń w dół i wybierz opcję <span className="text-[#C5A880] font-medium">Do ekranu początkowego</span>.
                </li>
                <li>
                  Dotknij <span className="text-[#F2F0EA] font-medium">Dodaj</span> w prawym górnym rogu.
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full border border-[#2A2927] hover:border-[#C5A880] py-2 text-xs uppercase tracking-widest text-[#F2F0EA] transition-colors duration-200 rounded"
              >
                Rozumiem
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
