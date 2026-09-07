'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Artist, CollectionInfo } from '@/types/gallery';
import { Feather, Upload, Check, AlertCircle } from 'lucide-react';

interface ArtistStudioSectionProps {
  artist: Artist;
  collection: CollectionInfo;
  onSaveArtist: (data: Partial<Artist>) => Promise<void>;
  onSaveCollection: (data: Partial<CollectionInfo>) => Promise<void>;
}

export const ArtistStudioSection: React.FC<ArtistStudioSectionProps> = ({
  artist,
  collection,
  onSaveArtist,
  onSaveCollection,
}) => {
  // Artist state
  const [name, setName] = useState(artist.name);
  const [tagline, setTagline] = useState(artist.tagline);
  const [biography, setBiography] = useState(artist.biography);
  const [statement, setStatement] = useState(artist.statement);
  const [portrait, setPortrait] = useState(artist.portrait);
  const [yearsActive, setYearsActive] = useState(artist.yearsActive || '2015–obecnie');

  // Collection state
  const [giftDedication, setGiftDedication] = useState(collection.giftDedication);
  const [collectionDesc, setCollectionDesc] = useState(collection.description);
  const [curatorNote, setCuratorNote] = useState(collection.curatorNote);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPortrait(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      await onSaveArtist({
        name: name.trim(),
        tagline: tagline.trim(),
        biography: biography.trim(),
        statement: statement.trim(),
        portrait,
        yearsActive: yearsActive.trim(),
      });

      await onSaveCollection({
        giftDedication: giftDedication.trim(),
        description: collectionDesc.trim(),
        curatorNote: curatorNote.trim(),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd podczas zapisywania.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAll} className="max-w-4xl space-y-12">
      {savedSuccess && (
        <div className="p-4 border border-[#C5A880] bg-[#C5A880]/10 text-[#F2F0EA] text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-[#C5A880]" />
          <span>Dane artysty oraz dedykacji zostały pomyślnie zaktualizowane w archiwum.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 border border-red-500/40 bg-red-950/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Artist Monograph Data */}
      <div className="border border-[#2A2927] p-6 sm:p-8 bg-[#111111] space-y-6">
        <div className="flex items-center gap-2 border-b border-[#2A2927] pb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA]">
            Monografia i dane artysty
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Portrait Photo Preview & Upload */}
          <div className="sm:col-span-4 flex flex-col items-center">
            <div className="relative aspect-[4/5] w-full border border-[#2A2927] bg-[#0B0B0B] overflow-hidden mb-3">
              {portrait ? (
                <Image
                  src={portrait}
                  alt={name}
                  fill
                  unoptimized
                  className="object-cover grayscale"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs text-[#555] flex items-center justify-center h-full">
                  Brak zdjęcia
                </span>
              )}
            </div>

            <label className="w-full py-2 px-3 border border-[#2A2927] hover:border-[#C5A880] text-center text-xs uppercase tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] cursor-pointer transition-colors block">
              Zmień portret
              <input
                type="file"
                accept="image/*"
                onChange={handlePortraitUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Text fields */}
          <div className="sm:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#C5A880] block">
                  Imię i nazwisko artysty
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2 text-sm text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                  Okres twórczości / Lata
                </label>
                <input
                  type="text"
                  value={yearsActive}
                  onChange={(e) => setYearsActive(e.target.value)}
                  placeholder="np. 2018–2024"
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2 text-sm text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                Hasło / Określenie artystyczne (Tagline)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#C5A880] block">
                Credo twórcze / Cytat artysty
              </label>
              <textarea
                rows={2}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#2A2927] p-3 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880] italic leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                Biogram / Droga twórcza
              </label>
              <textarea
                rows={4}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#2A2927] p-3 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880] leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dedication & Curator Letter */}
      <div className="border border-[#2A2927] p-6 sm:p-8 bg-[#111111] space-y-6">
        <div className="flex items-center gap-2 border-b border-[#2A2927] pb-3">
          <Feather className="w-4 h-4 text-[#C5A880]" />
          <h2 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA]">
            Dedykacja prezentowa i słowo kuratorskie
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#C5A880] block">
              Główna dedykacja (widoczna w sekcji o kolekcji)
            </label>
            <input
              type="text"
              value={giftDedication}
              onChange={(e) => setGiftDedication(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2 text-sm text-[#F2F0EA] focus:outline-none focus:border-[#C5A880] italic"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#888] block">
              Opis idei wystawy
            </label>
            <textarea
              rows={3}
              value={collectionDesc}
              onChange={(e) => setCollectionDesc(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-[#2A2927] p-3 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880] leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#888] block">
              Osobisty list od kuratorki (Dedykacja córki)
            </label>
            <textarea
              rows={4}
              value={curatorNote}
              onChange={(e) => setCuratorNote(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-[#2A2927] p-3 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 text-xs uppercase tracking-[0.2em] bg-[#C5A880] hover:bg-[#d6ba94] text-[#0B0B0B] font-medium transition-colors"
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz dane artysty i dedykacji'}
        </button>
      </div>
    </form>
  );
};
