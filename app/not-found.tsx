import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F2F0EA] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-full border border-[#2A2927] flex items-center justify-center text-[#C5A880] bg-[#141414]">
          <Compass className="w-6 h-6 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C5A880]">
            404 — Poza ekspozycją
          </p>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-light text-[#F2F0EA]">
            Płótno nie zostało odnalezione
          </h1>
          <p className="text-sm text-[#AAA69D] font-light leading-relaxed">
            Dzieło lub strona, której szukasz, mogła zostać przeniesiona do prywatnego archiwum lub jeszcze nie została wyeksponowana.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-6 py-3 border border-[#C5A880]/60 hover:border-[#C5A880] text-[#F2F0EA] hover:text-[#C5A880] bg-[#111111] hover:bg-[#1A1A18] transition-all text-xs tracking-widest uppercase font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Wróć do Galerii</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
