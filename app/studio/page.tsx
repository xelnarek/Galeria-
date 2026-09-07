'use client';

import React, { useState } from 'react';
import { Artwork, ArtworkStatus, Artist, CollectionInfo, GalleryBackupPackage } from '@/types/gallery';
import { useGalleryData } from '@/hooks/useGalleryData';
import { galleryRepository } from '@/lib/repository/galleryRepository';
import { StudioNavbar, StudioTab } from '@/components/studio/StudioNavbar';
import { ArtworkCatalogList } from '@/components/studio/ArtworkCatalogList';
import { ArtworkFormModal } from '@/components/studio/ArtworkFormModal';
import { DeleteConfirmModal } from '@/components/studio/DeleteConfirmModal';
import { ArtworkPreviewModal } from '@/components/studio/ArtworkPreviewModal';
import { ArtistStudioSection } from '@/components/studio/ArtistStudioSection';
import { SettingsBackupSection } from '@/components/studio/SettingsBackupSection';

export default function StudioPage() {
  const { artworks, artist, collection, isLoading, refresh } = useGalleryData({
    forStudio: true,
  });

  const [activeTab, setActiveTab] = useState<StudioTab>('kolekcja');

  // Modal states
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingArtwork, setDeletingArtwork] = useState<Artwork | null>(null);
  const [previewArtwork, setPreviewArtwork] = useState<Artwork | null>(null);

  const existingSlugs = artworks.map((a) => a.slug);
  const existingCategories = Array.from(new Set(artworks.map((a) => a.category)));

  // Handlers for Artwork CRUD
  const handleSaveArtwork = async (
    data: Omit<Artwork, 'id' | 'order'> & { id?: string }
  ) => {
    if (data.id) {
      await galleryRepository.updateArtwork(data.id, data);
    } else {
      await galleryRepository.createArtwork(data);
    }
    await refresh();
  };

  const handleConfirmDelete = async () => {
    if (!deletingArtwork) return;
    await galleryRepository.deleteArtwork(deletingArtwork.id);
    setDeletingArtwork(null);
    await refresh();
  };

  const handleReorder = async (newOrderIds: string[]) => {
    await galleryRepository.reorderArtworks(newOrderIds);
    await refresh();
  };

  const handleToggleStatus = async (artwork: Artwork, newStatus: ArtworkStatus) => {
    await galleryRepository.updateArtwork(artwork.id, { status: newStatus });
    await refresh();
  };

  const handleToggleFeatured = async (artwork: Artwork) => {
    if (artwork.featured) {
      await galleryRepository.updateArtwork(artwork.id, { featured: false });
    } else {
      await galleryRepository.setFeatured(artwork.id);
    }
    await refresh();
  };

  // Artist & Collection handlers
  const handleSaveArtist = async (data: Partial<Artist>) => {
    await galleryRepository.updateArtist(data);
    await refresh();
  };

  const handleSaveCollection = async (data: Partial<CollectionInfo>) => {
    await galleryRepository.updateCollectionInfo(data);
    await refresh();
  };

  // Backup handlers
  const handleExport = async (): Promise<GalleryBackupPackage> => {
    return await galleryRepository.exportCollection();
  };

  const handleImport = async (backup: GalleryBackupPackage) => {
    const res = await galleryRepository.importCollection(backup);
    await refresh();
    return res;
  };

  const handleResetToDefaults = async () => {
    await galleryRepository.resetToDefaults();
    await refresh();
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F2F0EA]">
      {/* Curator Studio Navigation Header */}
      <StudioNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        artworksCount={artworks.length}
      />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {isLoading ? (
          <div className="py-24 text-center text-[#777] font-serif-luxury text-xl">
            Ładowanie rejestru archiwalnego...
          </div>
        ) : (
          <>
            {/* 1. Tab: KOLEKCJA */}
            {activeTab === 'kolekcja' && (
              <ArtworkCatalogList
                artworks={artworks}
                onAddNew={() => setIsCreating(true)}
                onEdit={(art) => setEditingArtwork(art)}
                onDelete={(art) => setDeletingArtwork(art)}
                onPreview={(art) => setPreviewArtwork(art)}
                onReorder={handleReorder}
                onToggleStatus={handleToggleStatus}
                onToggleFeatured={handleToggleFeatured}
              />
            )}

            {/* 2. Tab: ARTYSTA */}
            {activeTab === 'artysta' && (
              <ArtistStudioSection
                artist={artist}
                collection={collection}
                onSaveArtist={handleSaveArtist}
                onSaveCollection={handleSaveCollection}
              />
            )}

            {/* 3. Tab: USTAWIENIA */}
            {activeTab === 'ustawienia' && (
              <SettingsBackupSection
                onExport={handleExport}
                onImport={handleImport}
                onResetToDefaults={handleResetToDefaults}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {(isCreating || editingArtwork) && (
        <ArtworkFormModal
          initialData={editingArtwork}
          existingSlugs={existingSlugs}
          existingCategories={existingCategories}
          onSave={handleSaveArtwork}
          onClose={() => {
            setIsCreating(false);
            setEditingArtwork(null);
          }}
        />
      )}

      {deletingArtwork && (
        <DeleteConfirmModal
          artwork={deletingArtwork}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingArtwork(null)}
        />
      )}

      {previewArtwork && (
        <ArtworkPreviewModal
          artwork={previewArtwork}
          onClose={() => setPreviewArtwork(null)}
        />
      )}
    </div>
  );
}
