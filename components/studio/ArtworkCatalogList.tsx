'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Artwork, ArtworkStatus } from '@/types/gallery';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Trash2,
  Star,
  Search,
  CheckCircle2,
  EyeOff,
  FileText,
  Sparkles,
} from 'lucide-react';

interface ArtworkCatalogListProps {
  artworks: Artwork[];
  onAddNew: () => void;
  onEdit: (artwork: Artwork) => void;
  onDelete: (artwork: Artwork) => void;
  onPreview: (artwork: Artwork) => void;
  onReorder: (newOrderIds: string[]) => Promise<void>;
  onToggleStatus: (artwork: Artwork, newStatus: ArtworkStatus) => Promise<void>;
  onToggleFeatured: (artwork: Artwork) => Promise<void>;
}

export const ArtworkCatalogList: React.FC<ArtworkCatalogListProps> = ({
  artworks,
  onAddNew,
  onEdit,
  onDelete,
  onPreview,
  onReorder,
  onToggleStatus,
  onToggleFeatured,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ArtworkStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(artworks.map((a) => a.category)));

  // Filter artworks
  const filtered = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.year.includes(searchTerm) ||
      art.medium.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : (art.status || 'published') === statusFilter;

    const matchesCategory =
      categoryFilter === 'all' ? true : art.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= artworks.length) return;

    const newOrder = [...artworks];
    const temp = newOrder[currentIndex];
    newOrder[currentIndex] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    await onReorder(newOrder.map((a) => a.id));
  };

  const getStatusBadge = (status?: ArtworkStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-amber-800/40 bg-amber-950/20 text-amber-300 text-[10px] tracking-wider uppercase font-mono">
            <FileText className="w-2.5 h-2.5" />
            <span>Szkic</span>
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#333] bg-[#161616] text-[#777] text-[10px] tracking-wider uppercase font-mono">
            <EyeOff className="w-2.5 h-2.5" />
            <span>Ukryte</span>
          </span>
        );
      case 'published':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#C5A880]/40 bg-[#C5A880]/10 text-[#C5A880] text-[10px] tracking-wider uppercase font-mono">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Opublikowane</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters, Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2927] pb-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#666]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj w rejestrze..."
              className="bg-[#111111] border border-[#2A2927] pl-8 pr-3 py-1.5 text-xs text-[#F2F0EA] placeholder-[#666] focus:outline-none focus:border-[#C5A880] w-48 sm:w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#111111] border border-[#2A2927] px-3 py-1.5 text-xs text-[#AAA69D] focus:outline-none focus:border-[#C5A880]"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="published">Tylko opublikowane</option>
            <option value="draft">Tylko szkice</option>
            <option value="hidden">Tylko ukryte</option>
          </select>

          {/* Category Filter */}
          {categories.length > 1 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#111111] border border-[#2A2927] px-3 py-1.5 text-xs text-[#AAA69D] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">Wszystkie kategorie</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Add New Artwork CTA */}
        <button
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#C5A880] bg-[#C5A880]/10 hover:bg-[#C5A880] text-[#F2F0EA] hover:text-[#0B0B0B] text-xs uppercase tracking-[0.2em] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dodaj dzieło</span>
        </button>
      </div>

      {/* Catalog Registry Table */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-[#2A2927] bg-[#111111] p-8 space-y-3">
          <p className="font-serif-luxury text-2xl text-[#AAA69D] font-light">
            Brak dzieł spełniających kryteria wyszukiwania.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="text-xs uppercase tracking-wider text-[#C5A880] underline"
          >
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="border border-[#2A2927] bg-[#111111] divide-y divide-[#2A2927]">
          {/* Table Header (Hidden on Mobile) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#777] font-mono bg-[#0D0D0D]">
            <div className="col-span-1">Lp.</div>
            <div className="col-span-4">Tytuł i technika</div>
            <div className="col-span-2">Format i rok</div>
            <div className="col-span-2">Status & Dedykacja</div>
            <div className="col-span-1">Kolejność</div>
            <div className="col-span-2 text-right">Działania</div>
          </div>

          {/* Table Rows */}
          {filtered.map((artwork, index) => {
            const rawIndex = artworks.findIndex((a) => a.id === artwork.id);

            return (
              <div
                key={artwork.id}
                className="p-4 sm:p-5 lg:px-6 lg:py-4 transition-colors hover:bg-[#161616]/70 flex flex-col lg:grid lg:grid-cols-12 gap-4 items-start lg:items-center"
              >
                {/* 1. Index & Thumbnail */}
                <div className="lg:col-span-1 flex items-center gap-3">
                  <span className="font-mono text-xs text-[#777]">
                    {String(rawIndex + 1).padStart(2, '0')}
                  </span>
                  <div className="relative w-12 h-12 bg-[#0B0B0B] border border-[#2A2927] overflow-hidden flex-shrink-0">
                    {artwork.thumbnail || artwork.image ? (
                      <Image
                        src={artwork.thumbnail || artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[9px] text-[#555] flex items-center justify-center h-full">
                        Brak
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Title, Category, Medium */}
                <div className="lg:col-span-4 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif-luxury text-lg sm:text-xl text-[#F2F0EA] font-normal">
                      {artwork.title}
                    </h3>
                    {artwork.featured && (
                      <span
                        className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 bg-[#C5A880] text-[#0B0B0B] font-mono uppercase tracking-wider font-semibold"
                        title="Główne dzieło w sekcji Hero na stronie głównej"
                      >
                        <Star className="w-2.5 h-2.5 fill-[#0B0B0B]" />
                        <span>Hero</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#AAA69D] font-light">
                    {artwork.category} • {artwork.medium}
                  </p>
                  <p className="text-[10px] text-[#666] font-mono">
                    /artworks/{artwork.slug}
                  </p>
                </div>

                {/* 3. Format & Year */}
                <div className="lg:col-span-2 text-xs text-[#AAA69D] font-light">
                  <div className="text-[#F2F0EA] font-mono text-[11px]">
                    {artwork.width} × {artwork.height} cm
                  </div>
                  <div className="text-[#777] text-[10px] uppercase tracking-wider">
                    Rok: {artwork.year}
                  </div>
                </div>

                {/* 4. Status Badge & Details Count */}
                <div className="lg:col-span-2 space-y-1">
                  <div>{getStatusBadge(artwork.status)}</div>
                  <div className="text-[10px] text-[#777] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C5A880]/80" />
                    <span>Detale: {artwork.details?.length || 0}</span>
                  </div>
                </div>

                {/* 5. Reorder Buttons */}
                <div className="lg:col-span-1 flex items-center gap-1">
                  <button
                    onClick={() => handleMove(rawIndex, 'up')}
                    disabled={rawIndex === 0}
                    className="p-1.5 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] disabled:opacity-20 disabled:hover:border-[#2A2927]"
                    title="Przesuń wyżej"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(rawIndex, 'down')}
                    disabled={rawIndex === artworks.length - 1}
                    className="p-1.5 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] disabled:opacity-20 disabled:hover:border-[#2A2927]"
                    title="Przesuń niżej"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 6. Row Actions */}
                <div className="lg:col-span-2 w-full lg:w-auto flex items-center justify-end gap-2 border-t lg:border-t-0 border-[#2A2927] pt-3 lg:pt-0">
                  {/* Toggle Featured */}
                  <button
                    onClick={() => onToggleFeatured(artwork)}
                    className={`p-1.5 border transition-colors ${
                      artwork.featured
                        ? 'border-[#C5A880] text-[#C5A880] bg-[#C5A880]/10'
                        : 'border-[#2A2927] text-[#666] hover:text-[#AAA69D]'
                    }`}
                    title={artwork.featured ? 'Wyróżnione jako dzieło główne' : 'Ustaw jako główne dzieło Hero'}
                  >
                    <Star className={`w-3.5 h-3.5 ${artwork.featured ? 'fill-[#C5A880]' : ''}`} />
                  </button>

                  {/* Preview */}
                  <button
                    onClick={() => onPreview(artwork)}
                    className="p-1.5 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                    title="Podgląd dzieła"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEdit(artwork)}
                    className="p-1.5 border border-[#2A2927] hover:border-[#C5A880] text-[#AAA69D] hover:text-[#F2F0EA] transition-colors"
                    title="Edytuj dane"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete(artwork)}
                    className="p-1.5 border border-[#2A2927] hover:border-red-500/80 text-[#777] hover:text-red-400 transition-colors"
                    title="Usuń dzieło"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
