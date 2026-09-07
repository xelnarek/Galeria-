'use client';

import React, { useState, useRef } from 'react';
import { GalleryBackupPackage } from '@/types/gallery';
import {
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  Database,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface SettingsBackupSectionProps {
  onExport: () => Promise<GalleryBackupPackage>;
  onImport: (backup: GalleryBackupPackage) => Promise<{ success: boolean; count: number }>;
  onResetToDefaults: () => Promise<void>;
}

export const SettingsBackupSection: React.FC<SettingsBackupSectionProps> = ({
  onExport,
  onImport,
  onResetToDefaults,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportClick = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const backup = await onExport();
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `archiwum-galerii-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: `Wyeksportowano archiwum z ${backup.artworks.length} dziełami do pliku JSON.`,
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Nie udało się wyeksportować kolekcji.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as GalleryBackupPackage;

        if (!parsed.artworks || !Array.isArray(parsed.artworks)) {
          throw new Error('Nieprawidłowa struktura pliku. Brak tablicy dzieł (artworks).');
        }

        const res = await onImport(parsed);
        setMessage({
          type: 'success',
          text: `Pomyślnie zaimportowano ${res.count} dzieł do lokalnego archiwum.`,
        });
      } catch (err: any) {
        setMessage({
          type: 'error',
          text: err.message || 'Błąd odczytu pliku JSON kopii zapasowej.',
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Błąd podczas odczytu pliku.' });
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  const handleResetClick = async () => {
    const confirmed = window.confirm(
      'Uwaga: Przywrócenie ustawień początkowych usunie wszystkie lokalnie dodane i zmodyfikowane dzieła i przywróci oryginalną kolekcję startową. Czy chcesz kontynuować?'
    );
    if (!confirmed) return;

    setIsResetting(true);
    setMessage(null);
    try {
      await onResetToDefaults();
      setMessage({
        type: 'success',
        text: 'Pomyślnie przywrócono oryginalne dane katalogowe kolekcji.',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Błąd podczas przywracania danych fabrycznych.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-12">
      {message && (
        <div
          className={`p-4 border text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'border-[#C5A880] bg-[#C5A880]/10 text-[#F2F0EA]'
              : 'border-red-500/40 bg-red-950/20 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-[#C5A880]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Architecture Notice: Local Mode vs Production CMS */}
      <div className="border border-[#2A2927] p-6 sm:p-8 bg-[#111111] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2A2927] pb-3">
          <Database className="w-4 h-4 text-[#C5A880]" />
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA]">
            Architektura danych: Tryb Lokalny (IndexedDB)
          </h2>
        </div>

        <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
          Wszelkie modyfikacje wprowadzone w tym Studio (dodawanie dzieł, zmiana kolejności, edycja opisów, fotografie) są zapisywane bezpośrednio w bazie <strong className="text-[#F2F0EA]">IndexedDB</strong> Twojej przeglądarki.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 border border-[#2A2927] bg-[#0B0B0B] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#C5A880]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">Prywatność i bezpieczeństwo</span>
            </div>
            <p className="text-[11px] text-[#777] leading-relaxed">
              Zdjęcia i teksty nie opuszczają Twojego urządzenia. Brak zewnętrznych serwerów śledzących.
            </p>
          </div>

          <div className="p-4 border border-[#2A2927] bg-[#0B0B0B] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#AAA69D]">
              <Server className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="uppercase tracking-wider">Gotowość do produkcji</span>
            </div>
            <p className="text-[11px] text-[#777] leading-relaxed">
              Warstwa abstrakcji <code className="text-[#AAA69D]">GalleryRepository</code> pozwala w przyszłości na bezproblemowe podłączenie bazy Supabase lub Firebase bez zmian w interfejsie.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Export & Import */}
      <div className="border border-[#2A2927] p-6 sm:p-8 bg-[#111111] space-y-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA] border-b border-[#2A2927] pb-3">
          Kopia zapasowa i przenoszenie danych (JSON)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Export card */}
          <div className="border border-[#2A2927] p-5 bg-[#0B0B0B] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C5A880]">
                <Download className="w-3.5 h-3.5" />
                <span>Eksport kolekcji</span>
              </div>
              <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                Pobierz pełną kopię wszystkich dzieł, detali, notatek kuratorskich i biogramu do pliku JSON. Możesz go bezpiecznie przechować na dysku lub przesłać na inny komputer.
              </p>
            </div>

            <button
              onClick={handleExportClick}
              disabled={isExporting}
              className="w-full py-2.5 px-4 border border-[#C5A880] text-xs uppercase tracking-[0.2em] text-[#F2F0EA] hover:bg-[#C5A880]/10 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{isExporting ? 'Eksportowanie...' : 'Pobierz archiwum (.JSON)'}</span>
            </button>
          </div>

          {/* Import card */}
          <div className="border border-[#2A2927] p-5 bg-[#0B0B0B] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#AAA69D]">
                <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Import kolekcji</span>
              </div>
              <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                Wczytaj plik JSON z wcześniej zapisaną kopią kolekcji. Wszystkie dzieła zostaną załadowane do Twojej bazy.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept="application/json,.json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full py-2.5 px-4 border border-[#2A2927] hover:border-[#AAA69D] text-xs uppercase tracking-[0.2em] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{isImporting ? 'Importowanie...' : 'Wczytaj plik (.JSON)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Factory Reset */}
      <div className="border border-[#2A2927] p-6 sm:p-8 bg-[#111111] space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A2927] pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-red-400" />
            <h2 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA]">
              Przywrócenie stanu początkowego
            </h2>
          </div>
        </div>

        <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
          Jeśli chcesz skasować lokalne zmiany i powrócić do oryginalnej, domyślnej listy dzieł malarskich dostarczonych z aplikacją, możesz zresetować lokalny magazyn.
        </p>

        <button
          onClick={handleResetClick}
          disabled={isResetting}
          className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] border border-red-900/60 bg-red-950/30 text-red-300 hover:bg-red-900/40 transition-colors"
        >
          {isResetting ? 'Przywracanie...' : 'Przywróć domyślną kolekcję'}
        </button>
      </div>
    </div>
  );
};
