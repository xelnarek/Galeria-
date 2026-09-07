'use client';

import React from 'react';
import { Artwork } from '@/types/gallery';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  artwork: Artwork;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  artwork,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-[#111111] border border-[#2A2927] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
          aria-label="Zamknij"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#2A2927] pb-4">
          <div className="w-8 h-8 border border-red-500/40 bg-red-950/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 id="delete-modal-title" className="font-serif-luxury text-xl text-[#F2F0EA]">
              Czy na pewno chcesz usunąć dzieło?
            </h2>
            <p className="text-[11px] text-[#AAA69D] uppercase tracking-wider">
              Operacja usunięcia z archiwum
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-[#AAA69D] font-light leading-relaxed">
          <p>
            Dzieło <strong className="text-[#F2F0EA] font-serif-luxury text-base font-normal">„{artwork.title}”</strong> ({artwork.year}) zostanie bezpowrotnie usunięte z bazy archiwum oraz z publicznej ekspozycji.
          </p>
          <p className="text-xs text-[#777]">
            Możesz przed usunięciem wykonać eksport kolekcji do pliku JSON w zakładce Ustawienia.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A2927]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-5 py-2 text-xs uppercase tracking-[0.2em] border border-[#2A2927] text-[#AAA69D] hover:text-[#F2F0EA] hover:border-[#AAA69D] transition-colors"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 text-xs uppercase tracking-[0.2em] bg-red-950/60 border border-red-700/60 text-red-200 hover:bg-red-900/80 transition-colors"
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
          </button>
        </div>
      </div>
    </div>
  );
};
