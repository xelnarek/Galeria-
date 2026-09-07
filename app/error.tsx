'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Błąd aplikacji:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F2F0EA] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C5A880]">
            Przerwa kuratorska
          </p>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-light text-[#F2F0EA]">
            Chwilowa niedostępność
          </h1>
          <p className="text-sm text-[#AAA69D] font-light leading-relaxed">
            Wystąpiła nieoczekiwana trudność podczas renderowania ekspozycji.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#C5A880]/60 hover:border-[#C5A880] text-[#F2F0EA] hover:text-[#C5A880] bg-[#111111] hover:bg-[#1A1A18] transition-all text-xs tracking-widest uppercase font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Spróbuj ponownie</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#2A2927] hover:border-[#AAA69D] text-[#AAA69D] hover:text-[#F2F0EA] transition-all text-xs tracking-widest uppercase font-mono"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Strona główna</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
