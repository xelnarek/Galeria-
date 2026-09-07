'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Artwork, ArtworkDetail, ArtworkStatus } from '@/types/gallery';
import { generateSlug, generateUniqueSlug } from '@/lib/slug';
import { ArtworkPreviewModal } from './ArtworkPreviewModal';
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
  Sparkles,
  Check,
} from 'lucide-react';

interface ArtworkFormModalProps {
  initialData?: Artwork | null;
  existingSlugs: string[];
  existingCategories: string[];
  onSave: (data: Omit<Artwork, 'id' | 'order'> & { id?: string }) => Promise<void>;
  onClose: () => void;
}

export const ArtworkFormModal: React.FC<ArtworkFormModalProps> = ({
  initialData,
  existingSlugs,
  existingCategories,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialData);

  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear().toString());
  const [category, setCategory] = useState(initialData?.category || 'Malarstwo olejne');
  const [customCategory, setCustomCategory] = useState('');
  const [medium, setMedium] = useState(initialData?.medium || 'Olej na płótnie');
  const [width, setWidth] = useState<number>(initialData?.width || 70);
  const [height, setHeight] = useState<number>(initialData?.height || 90);
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<ArtworkStatus>(initialData?.status || 'published');
  const [featured, setFeatured] = useState<boolean>(Boolean(initialData?.featured));

  // Story states
  const [origin, setOrigin] = useState(initialData?.story?.origin || '');
  const [meaning, setMeaning] = useState(initialData?.story?.meaning || '');
  const [curatorialNote, setCuratorialNote] = useState(initialData?.story?.curatorialNote || '');

  // Main Image
  const [image, setImage] = useState(initialData?.image || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [useSameThumbnail, setUseSameThumbnail] = useState(
    !initialData || initialData.thumbnail === initialData.image
  );

  // Details (up to 4)
  const [details, setDetails] = useState<ArtworkDetail[]>(initialData?.details || []);

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic slug calculation
  const computedSlug = initialData?.slug
    ? initialData.slug
    : generateUniqueSlug(title || 'nowe-dzielo', existingSlugs);

  // Track changes
  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // Image Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Wybrany plik musi być formatu graficznego (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setImage(dataUrl);
      if (useSameThumbnail) {
        setThumbnail(dataUrl);
      }
      markDirty();
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Detail Image Upload Handler
  const handleDetailImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setDetails((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], image: result };
        return next;
      });
      markDirty();
    };
    reader.readAsDataURL(file);
  };

  const handleAddDetail = () => {
    if (details.length >= 4) return;
    setDetails((prev) => [
      ...prev,
      {
        id: `detail-${Date.now()}-${prev.length}`,
        image: '',
        title: `Detal ${prev.length + 1}`,
        description: '',
      },
    ]);
    markDirty();
  };

  const handleRemoveDetail = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict validation
    if (!title.trim()) {
      setErrorMessage('Tytuł dzieła jest wymagany.');
      return;
    }
    if (!image) {
      setErrorMessage('Wymagany jest obraz główny dzieła (wgraj plik lub podaj URL).');
      return;
    }

    const finalCategory = customCategory.trim() || category;

    const payload: Omit<Artwork, 'id' | 'order'> & { id?: string } = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      slug: computedSlug,
      title: title.trim(),
      year: year.trim() || new Date().getFullYear().toString(),
      category: finalCategory,
      medium: medium.trim() || 'Olej na płótnie',
      width: Number(width) || 60,
      height: Number(height) || 80,
      image,
      thumbnail: useSameThumbnail ? image : thumbnail || image,
      description: description.trim(),
      status,
      featured,
      story: {
        origin: origin.trim() || undefined,
        meaning: meaning.trim() || undefined,
        curatorialNote: curatorialNote.trim() || undefined,
      },
      details: details.filter((d) => d.image && d.title),
      exhibitionOrder: initialData?.exhibitionOrder,
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Błąd podczas zapisywania dzieła.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'Masz niezapisane zmiany. Czy na pewno chcesz zamknąć formularz?'
      );
      if (!confirmLeave) return;
    }
    onClose();
  };

  // Preview mock object
  const currentPreviewArtwork: Artwork = {
    id: initialData?.id || 'preview-id',
    slug: computedSlug,
    title: title || 'Bez tytułu',
    year: year || '2024',
    category: customCategory || category,
    medium: medium || 'Olej na płótnie',
    width: Number(width) || 70,
    height: Number(height) || 90,
    image: image || '',
    thumbnail: thumbnail || image || '',
    description,
    status,
    featured,
    order: initialData?.order || 1,
    story: { origin, meaning, curatorialNote },
    details,
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-modal-form-title"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-[#2A2927] px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880]">
              {isEditing ? 'Edycja rekordu archiwalnego' : 'Nowe dzieło w kolekcji'}
            </span>
            <h2 id="artwork-modal-form-title" className="font-serif-luxury text-2xl text-[#F2F0EA]">
              {title.trim() ? `„${title}”` : isEditing ? 'Edytuj dzieło' : 'Katalogowanie dzieła'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#2A2927] text-xs uppercase tracking-wider text-[#AAA69D] hover:text-[#F2F0EA] hover:border-[#C5A880] transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Podgląd</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="p-2 border border-[#2A2927] hover:border-[#F2F0EA] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
              aria-label="Zamknij formularz"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Form Body */}
        <form onSubmit={handleSave} className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-10 space-y-12">
          {errorMessage && (
            <div className="p-4 border border-red-500/40 bg-red-950/20 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION 1: Obraz Główny & Miniatura */}
          <div className="border border-[#2A2927] p-6 bg-[#111111] space-y-6">
            <div className="flex items-center justify-between border-b border-[#2A2927] pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C5A880]" />
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA]">
                  1. Fotografia dzieła (Wysoka rozdzielczość)
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#777]">
                Bezpośrednie odwzorowanie
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Image Preview Box */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="relative aspect-[4/3] w-full border border-[#2A2927] bg-[#0B0B0B] overflow-hidden flex items-center justify-center group shadow-inner">
                  {image ? (
                    <Image
                      src={image}
                      alt="Podgląd dzieła"
                      fill
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2 text-[#666]">
                      <Upload className="w-8 h-8 mx-auto text-[#444]" />
                      <p className="text-xs">Brak wgranego zdjęcia dzieła</p>
                    </div>
                  )}
                </div>
                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage('');
                      markDirty();
                    }}
                    className="mt-2 text-[11px] text-red-400/80 hover:text-red-300 tracking-wider uppercase"
                  >
                    Usuń zdjęcie
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="md:col-span-6 space-y-4">
                <p className="text-xs text-[#AAA69D] leading-relaxed font-light">
                  Wgraj fotografię obrazu prosto z dysku lub podaj link URL. Zdjęcie zostanie bezpiecznie zapisane w lokalnym magazynie IndexedDB w Twojej przeglądarce.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border border-[#C5A880]/60 hover:border-[#C5A880] bg-[#161616] text-xs uppercase tracking-[0.2em] text-[#F2F0EA] hover:bg-[#C5A880]/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Wybierz plik z komputera</span>
                </button>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                    Lub wklej bezpośredni adres URL zdjęcia:
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      if (useSameThumbnail) setThumbnail(e.target.value);
                      markDirty();
                    }}
                    placeholder="https://images.unsplash.com/... lub /assets/..."
                    className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3 py-2 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="pt-2 border-t border-[#2A2927]">
                  <label className="flex items-center gap-2 text-xs text-[#AAA69D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSameThumbnail}
                      onChange={(e) => {
                        setUseSameThumbnail(e.target.checked);
                        if (e.target.checked) setThumbnail(image);
                        markDirty();
                      }}
                      className="accent-[#C5A880]"
                    />
                    <span>Automatycznie generuj miniaturę z obrazu głównego</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Metryka Dzieła (Katalog podstawowy) */}
          <div className="border border-[#2A2927] p-6 bg-[#111111] space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA] border-b border-[#2A2927] pb-3">
              2. Metryka katalogowa i parametry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tytuł */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#C5A880] block">
                  Tytuł dzieła *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                  placeholder="np. Pejzaż o zmierzchu"
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2.5 text-sm text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                />
                {/* Auto Slug Indicator */}
                <p className="text-[10px] text-[#777] font-mono">
                  Slug: <span className="text-[#C5A880]">/artworks/{computedSlug}</span>
                </p>
              </div>

              {/* Rok */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                  Rok powstania
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    markDirty();
                  }}
                  placeholder="np. 2021"
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2.5 text-sm text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Kategoria */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                  Kategoria
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    markDirty();
                  }}
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3 py-2.5 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                >
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Inna">Inna (wpisz własną)</option>
                </select>
                {category === 'Inna' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      markDirty();
                    }}
                    placeholder="Wpisz nową kategorię..."
                    className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3 py-1.5 text-xs text-[#F2F0EA] mt-2"
                  />
                )}
              </div>

              {/* Technika */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                  Technika wykonania
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => {
                    setMedium(e.target.value);
                    markDirty();
                  }}
                  placeholder="np. Olej na płótnie"
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2.5 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Wymiary: Szerokość & Wysokość */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                  Format (cm)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => {
                        setWidth(Number(e.target.value));
                        markDirty();
                      }}
                      placeholder="Szer."
                      className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3 py-2.5 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-[#666]">szer.</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => {
                        setHeight(Number(e.target.value));
                        markDirty();
                      }}
                      placeholder="Wys."
                      className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3 py-2.5 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-[#666]">wys.</span>
                  </div>
                </div>
              </div>

              {/* Status Dzieła */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#C5A880] block">
                  Status widoczności
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as ArtworkStatus);
                    markDirty();
                  }}
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3 py-2.5 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="published">Opublikowane (widoczne w galerii)</option>
                  <option value="draft">Szkic (tylko w studio)</option>
                  <option value="hidden">Ukryte (zarchiwizowane)</option>
                </select>
              </div>

              {/* Featured (Główne dzieło w Hero) */}
              <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={featured}
                  onChange={(e) => {
                    setFeatured(e.target.checked);
                    markDirty();
                  }}
                  className="accent-[#C5A880] w-4 h-4"
                />
                <label htmlFor="featured-checkbox" className="text-xs text-[#AAA69D] cursor-pointer">
                  <span className="text-[#F2F0EA] block">Dzieło główne (Featured na stronie głównej)</span>
                  <span className="text-[11px] text-[#777]">
                    Tylko jedno dzieło może być wyróżnione w sekcji Hero.
                  </span>
                </label>
              </div>
            </div>

            {/* Opis Kuratorski */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                Krótki opis kuratorski
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  markDirty();
                }}
                placeholder="Kilka zdań wprowadzających w nastrój i kompozycję obrazu..."
                className="w-full bg-[#0B0B0B] border border-[#2A2927] p-3 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880] leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 3: Opowieść z Pracowni (Historia, Geneza, Notatka) */}
          <div className="border border-[#2A2927] p-6 bg-[#111111] space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA] border-b border-[#2A2927] pb-3">
              3. Opowieść z pracowni (Opcjonalne)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                  Geneza powstania
                </label>
                <textarea
                  rows={3}
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    markDirty();
                  }}
                  placeholder="Gdzie powstał szkic? Co zainspirowało artystę do tego płótna?"
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] p-3 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                  Symbolika i znaczenie
                </label>
                <textarea
                  rows={3}
                  value={meaning}
                  onChange={(e) => {
                    setMeaning(e.target.value);
                    markDirty();
                  }}
                  placeholder="Ukryte emocje, paleta barw, kontekst osobisty..."
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] p-3 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#C5A880] block">
                  Osobista notatka kuratorska / aforyzm artysty
                </label>
                <input
                  type="text"
                  value={curatorialNote}
                  onChange={(e) => {
                    setCuratorialNote(e.target.value);
                    markDirty();
                  }}
                  placeholder="np. „Światło gaśnie najpiękniej tam, gdzie pamięć spotyka się z ciszą.”"
                  className="w-full bg-[#0B0B0B] border border-[#2A2927] px-3.5 py-2.5 text-xs text-[#F2F0EA] focus:outline-none focus:border-[#C5A880] italic"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Studium Detalu (0-4 detale) */}
          <div className="border border-[#2A2927] p-6 bg-[#111111] space-y-6">
            <div className="flex items-center justify-between border-b border-[#2A2927] pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#F2F0EA] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>4. Zbliżenia fakturalne (Studium detalu)</span>
                </h3>
                <p className="text-[11px] text-[#777] mt-0.5">
                  Dodaj od 0 do 4 zbliżeń na impasty, pociągnięcia szpachli lub sygnaturę.
                </p>
              </div>

              {details.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddDetail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#2A2927] text-xs uppercase tracking-wider text-[#C5A880] hover:text-white hover:border-[#C5A880] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dodaj detal ({details.length}/4)</span>
                </button>
              )}
            </div>

            {details.length === 0 ? (
              <p className="text-xs text-[#777] italic py-2">
                Brak zdefiniowanych detali. W widoku dzieła sekcja „Przyjrzyj się bliżej” nie będzie wyświetlana.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {details.map((detail, index) => (
                  <div key={detail.id} className="border border-[#2A2927] p-4 bg-[#0B0B0B] space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880]">
                        Detal #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDetail(index)}
                        className="p-1 text-[#777] hover:text-red-400 transition-colors"
                        title="Usuń ten detal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center">
                      <div className="relative aspect-square border border-[#2A2927] bg-[#161616] overflow-hidden flex items-center justify-center">
                        {detail.image ? (
                          <Image
                            src={detail.image}
                            alt={detail.title}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[10px] text-[#555]">Brak</span>
                        )}
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-[#888] block">
                          Zdjęcie detalu (URL lub plik):
                        </label>
                        <input
                          type="text"
                          value={detail.image}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDetails((prev) => {
                              const next = [...prev];
                              next[index] = { ...next[index], image: val };
                              return next;
                            });
                            markDirty();
                          }}
                          placeholder="Wklej URL zdjęcia detalu..."
                          className="w-full bg-[#111111] border border-[#2A2927] px-2.5 py-1.5 text-xs text-[#F2F0EA]"
                        />

                        <label className="text-[10px] text-[#C5A880] cursor-pointer hover:underline block">
                          Wgraj plik z dysku
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleDetailImageUpload(index, f);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={detail.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDetails((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], title: val };
                          return next;
                        });
                        markDirty();
                      }}
                      placeholder="Tytuł detalu (np. Faktura szpachli)"
                      className="w-full bg-[#111111] border border-[#2A2927] px-2.5 py-1.5 text-xs text-[#F2F0EA]"
                    />

                    <input
                      type="text"
                      value={detail.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDetails((prev) => {
                          const next = [...prev];
                          next[index] = { ...next[index], description: val };
                          return next;
                        });
                        markDirty();
                      }}
                      placeholder="Krótki opis techniki w tym fragmencie..."
                      className="w-full bg-[#111111] border border-[#2A2927] px-2.5 py-1.5 text-xs text-[#AAA69D]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="sticky bottom-0 z-30 bg-[#0B0B0B]/95 backdrop-blur-md border-t border-[#2A2927] py-4 -mx-6 -mb-6 px-6 sm:-mx-10 sm:-mb-10 sm:px-10 flex items-center justify-between">
            <div className="text-xs text-[#777]">
              {isDirty && <span className="text-[#C5A880] font-mono">• Niezapisane zmiany</span>}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] border border-[#2A2927] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
              >
                Anuluj
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 text-xs uppercase tracking-[0.2em] bg-[#C5A880] hover:bg-[#d6ba94] text-[#0B0B0B] font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Zapisywanie...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Zapisz zmiany' : 'Dodaj do kolekcji'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showPreview && (
        <ArtworkPreviewModal
          artwork={currentPreviewArtwork}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};
