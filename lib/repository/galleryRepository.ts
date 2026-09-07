import {
  Artwork,
  Artist,
  CollectionInfo,
  GalleryBackupPackage,
  ArtworkStatus,
} from '@/types/gallery';
import {
  artworksData as defaultArtworks,
  artistData as defaultArtist,
  collectionData as defaultCollection,
} from '@/data/gallery-data';
import { galleryDB } from '@/lib/storage/indexedDb';
import { generateUniqueSlug } from '@/lib/slug';

export interface ArtworkQueryOptions {
  includeDrafts?: boolean;
  includeHidden?: boolean;
}

export interface IGalleryRepository {
  getArtworks(options?: ArtworkQueryOptions): Promise<Artwork[]>;
  getAllArtworksForStudio(): Promise<Artwork[]>;
  getArtwork(idOrSlug: string, options?: ArtworkQueryOptions): Promise<Artwork | null>;
  createArtwork(data: Omit<Artwork, 'id' | 'order'> & { id?: string; order?: number }): Promise<Artwork>;
  updateArtwork(id: string, data: Partial<Artwork>): Promise<Artwork>;
  deleteArtwork(id: string): Promise<boolean>;
  reorderArtworks(orderedIds: string[]): Promise<Artwork[]>;
  setFeatured(id: string): Promise<Artwork[]>;
  getArtist(): Promise<Artist>;
  updateArtist(data: Partial<Artist>): Promise<Artist>;
  getCollectionInfo(): Promise<CollectionInfo>;
  updateCollectionInfo(data: Partial<CollectionInfo>): Promise<CollectionInfo>;
  exportCollection(): Promise<GalleryBackupPackage>;
  importCollection(backup: GalleryBackupPackage): Promise<{ success: boolean; count: number }>;
  resetToDefaults(): Promise<void>;
  isLocalMode(): boolean;
  getStorageModeLabel(): string;
}

const GALLERY_DATA_EVENT = 'gallery_data_updated';

function notifyDataUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GALLERY_DATA_EVENT));
  }
}

class LocalIndexedDBGalleryRepository implements IGalleryRepository {
  private initialized = false;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  isLocalMode(): boolean {
    return true;
  }

  getStorageModeLabel(): string {
    return 'Lokalny magazyn IndexedDB (offline-ready)';
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isClient() || this.initialized) return;

    try {
      const existing = await galleryDB.getAllArtworks();
      if (!existing || existing.length === 0) {
        // Seed default dataset on first run
        const fallback = Array.isArray(defaultArtworks) ? defaultArtworks : [];
        const seededArtworks: Artwork[] = fallback.map((art, idx) => ({
          ...art,
          status: 'published' as ArtworkStatus,
          order: idx + 1,
          exhibitionOrder: art.exhibitionOrder || idx + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        await galleryDB.saveAllArtworks(seededArtworks);
        await galleryDB.setMeta<Artist>('artist', defaultArtist);
        await galleryDB.setMeta<CollectionInfo>('collection', defaultCollection);
      }
      this.initialized = true;
    } catch (err) {
      console.warn('GalleryRepository: IndexedDB initialization fallback:', err);
    }
  }

  async getAllArtworksForStudio(): Promise<Artwork[]> {
    const fallback = Array.isArray(defaultArtworks) ? defaultArtworks : [];
    if (!this.isClient()) {
      return fallback.map((a, idx) => ({
        ...a,
        status: (a.status || 'published') as ArtworkStatus,
        order: idx + 1,
      }));
    }

    try {
      await this.ensureInitialized();
      const list = await galleryDB.getAllArtworks();
      if (!list || list.length === 0) {
        return fallback.map((a, idx) => ({
          ...a,
          status: (a.status || 'published') as ArtworkStatus,
          order: idx + 1,
        }));
      }
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (err) {
      console.warn('getAllArtworksForStudio error, returning fallback:', err);
      return fallback.map((a, idx) => ({
        ...a,
        status: (a.status || 'published') as ArtworkStatus,
        order: idx + 1,
      }));
    }
  }

  async getArtworks(options?: ArtworkQueryOptions): Promise<Artwork[]> {
    try {
      const list = await this.getAllArtworksForStudio();
      if (!Array.isArray(list)) return [];

      return list.filter((artwork) => {
        if (!artwork) return false;
        const status = artwork.status || 'published';
        if (status === 'published') return true;
        if (status === 'draft' && options?.includeDrafts) return true;
        if (status === 'hidden' && options?.includeHidden) return true;
        return false;
      });
    } catch (err) {
      console.warn('getArtworks error:', err);
      return [];
    }
  }

  async getArtwork(idOrSlug: string, options?: ArtworkQueryOptions): Promise<Artwork | null> {
    try {
      const list = await this.getAllArtworksForStudio();
      if (!Array.isArray(list)) return null;
      const artwork = list.find((a) => a && (a.id === idOrSlug || a.slug === idOrSlug)) || null;

      if (!artwork) return null;

      const status = artwork.status || 'published';
      if (status === 'published') return artwork;
      if (status === 'draft' && options?.includeDrafts) return artwork;
      if (status === 'hidden' && options?.includeHidden) return artwork;

      return null;
    } catch (err) {
      console.warn(`getArtwork error for idOrSlug ${idOrSlug}:`, err);
      return null;
    }
  }

  async createArtwork(
    data: Omit<Artwork, 'id' | 'order'> & { id?: string; order?: number }
  ): Promise<Artwork> {
    try {
      await this.ensureInitialized();
      const all = await this.getAllArtworksForStudio();

      const newId = data.id || `dzielo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newOrder = data.order ?? all.length + 1;

      // Generate unique slug
      const finalSlug = data.slug
        ? generateUniqueSlug(data.slug, all.map((a) => a.slug))
        : generateUniqueSlug(data.title, all.map((a) => a.slug));

      // Handle featured exclusivity: if this new artwork is featured, unfeature others
      if (data.featured) {
        for (const existing of all) {
          if (existing && existing.featured) {
            existing.featured = false;
            try {
              await galleryDB.saveArtwork(existing);
            } catch (err) {
              console.warn('Failed to unfeature existing artwork:', err);
            }
          }
        }
      }

      const newArtwork: Artwork = {
        ...data,
        id: newId,
        slug: finalSlug,
        order: newOrder,
        exhibitionOrder: data.exhibitionOrder ?? newOrder,
        status: data.status || 'published',
        featured: Boolean(data.featured),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Artwork;

      await galleryDB.saveArtwork(newArtwork);
      notifyDataUpdated();
      return newArtwork;
    } catch (err) {
      console.error('createArtwork failed:', err);
      return {
        ...data,
        id: data.id || `dzielo-fallback-${Date.now()}`,
        slug: data.slug || 'dzielo-fallback',
        order: data.order || 1,
        status: data.status || 'published',
        featured: Boolean(data.featured),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Artwork;
    }
  }

  async updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork> {
    try {
      await this.ensureInitialized();
      const all = await this.getAllArtworksForStudio();
      const target = all.find((a) => a && a.id === id);

      if (!target) {
        throw new Error(`Dzieło o identyfikatorze "${id}" nie zostało odnalezione.`);
      }

      // Slug update check if title changed or custom slug provided
      let updatedSlug = target.slug;
      if (updates.slug && updates.slug !== target.slug) {
        updatedSlug = generateUniqueSlug(updates.slug, all.map((a) => a.slug), id, all);
      } else if (updates.title && updates.title !== target.title && !updates.slug) {
        updatedSlug = generateUniqueSlug(updates.title, all.map((a) => a.slug), id, all);
      }

      // Handle featured exclusivity
      if (updates.featured === true) {
        for (const existing of all) {
          if (existing && existing.id !== id && existing.featured) {
            existing.featured = false;
            try {
              await galleryDB.saveArtwork(existing);
            } catch (err) {
              console.warn('Failed to unfeature existing artwork:', err);
            }
          }
        }
      }

      const updatedArtwork: Artwork = {
        ...target,
        ...updates,
        id: target.id,
        slug: updatedSlug,
        updatedAt: new Date().toISOString(),
      };

      await galleryDB.saveArtwork(updatedArtwork);
      notifyDataUpdated();
      return updatedArtwork;
    } catch (err) {
      console.error('updateArtwork failed:', err);
      throw err;
    }
  }

  async deleteArtwork(id: string): Promise<boolean> {
    try {
      await this.ensureInitialized();
      await galleryDB.deleteArtwork(id);
      notifyDataUpdated();
      return true;
    } catch (err) {
      console.error('deleteArtwork failed:', err);
      return false;
    }
  }

  async reorderArtworks(orderedIds: string[]): Promise<Artwork[]> {
    try {
      await this.ensureInitialized();
      const all = await this.getAllArtworksForStudio();
      const map = new Map(all.map((a) => [a.id, a]));

      const reordered: Artwork[] = [];
      orderedIds.forEach((id, index) => {
        const art = map.get(id);
        if (art) {
          art.order = index + 1;
          art.exhibitionOrder = index + 1;
          art.updatedAt = new Date().toISOString();
          reordered.push(art);
        }
      });

      // Save all to IndexedDB
      await galleryDB.saveAllArtworks(reordered);
      notifyDataUpdated();
      return reordered;
    } catch (err) {
      console.error('reorderArtworks failed:', err);
      return [];
    }
  }

  async setFeatured(id: string): Promise<Artwork[]> {
    try {
      await this.ensureInitialized();
      const all = await this.getAllArtworksForStudio();

      for (const art of all) {
        art.featured = art.id === id;
        try {
          await galleryDB.saveArtwork(art);
        } catch (err) {
          console.warn('Failed to save featured status for artwork:', art.id, err);
        }
      }

      notifyDataUpdated();
      return all;
    } catch (err) {
      console.error('setFeatured failed:', err);
      return [];
    }
  }

  async getArtist(): Promise<Artist> {
    if (!this.isClient()) return defaultArtist;
    try {
      await this.ensureInitialized();
      const meta = await galleryDB.getMeta<Artist>('artist');
      return meta || defaultArtist;
    } catch (err) {
      console.warn('getArtist error, using defaultArtist:', err);
      return defaultArtist;
    }
  }

  async updateArtist(data: Partial<Artist>): Promise<Artist> {
    try {
      await this.ensureInitialized();
      const current = await this.getArtist();
      const updated: Artist = { ...current, ...data };
      await galleryDB.setMeta<Artist>('artist', updated);
      notifyDataUpdated();
      return updated;
    } catch (err) {
      console.warn('updateArtist error, returning fallback:', err);
      return { ...defaultArtist, ...data };
    }
  }

  async getCollectionInfo(): Promise<CollectionInfo> {
    if (!this.isClient()) return defaultCollection;
    try {
      await this.ensureInitialized();
      const meta = await galleryDB.getMeta<CollectionInfo>('collection');
      return meta || defaultCollection;
    } catch (err) {
      console.warn('getCollectionInfo error, using defaultCollection:', err);
      return defaultCollection;
    }
  }

  async updateCollectionInfo(data: Partial<CollectionInfo>): Promise<CollectionInfo> {
    try {
      await this.ensureInitialized();
      const current = await this.getCollectionInfo();
      const updated: CollectionInfo = { ...current, ...data };
      await galleryDB.setMeta<CollectionInfo>('collection', updated);
      notifyDataUpdated();
      return updated;
    } catch (err) {
      console.warn('updateCollectionInfo error, returning fallback:', err);
      return { ...defaultCollection, ...data };
    }
  }

  async exportCollection(): Promise<GalleryBackupPackage> {
    await this.ensureInitialized();
    const artworks = await this.getAllArtworksForStudio();
    const artist = await this.getArtist();
    const collection = await this.getCollectionInfo();

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      collection,
      artist,
      artworks,
    };
  }

  async importCollection(backup: GalleryBackupPackage): Promise<{ success: boolean; count: number }> {
    if (!backup || !Array.isArray(backup.artworks)) {
      throw new Error('Nieprawidłowy format pliku kopii zapasowej. Brak listy dzieł.');
    }

    await this.ensureInitialized();

    // Validate and sanitize artworks
    const sanitizedArtworks: Artwork[] = backup.artworks.map((art, idx) => ({
      ...art,
      id: art.id || `imported-${Date.now()}-${idx}`,
      slug: art.slug || generateUniqueSlug(art.title || `Dzieło ${idx + 1}`, []),
      title: art.title || 'Dzieło bez tytułu',
      year: art.year || '',
      category: art.category || 'Malarstwo',
      medium: art.medium || 'Olej na płótnie',
      width: Number(art.width) || 60,
      height: Number(art.height) || 80,
      image: art.image,
      thumbnail: art.thumbnail || art.image,
      description: art.description || '',
      status: art.status || 'published',
      order: idx + 1,
      exhibitionOrder: art.exhibitionOrder || idx + 1,
      featured: Boolean(art.featured),
      updatedAt: new Date().toISOString(),
    }));

    await galleryDB.saveAllArtworks(sanitizedArtworks);

    if (backup.artist) {
      await galleryDB.setMeta<Artist>('artist', backup.artist);
    }
    if (backup.collection) {
      await galleryDB.setMeta<CollectionInfo>('collection', backup.collection);
    }

    notifyDataUpdated();
    return { success: true, count: sanitizedArtworks.length };
  }

  async resetToDefaults(): Promise<void> {
    try {
      await this.ensureInitialized();
      await galleryDB.clearAll();

      const fallback = Array.isArray(defaultArtworks) ? defaultArtworks : [];
      const seededArtworks: Artwork[] = fallback.map((art, idx) => ({
        ...art,
        status: 'published' as ArtworkStatus,
        order: idx + 1,
        exhibitionOrder: art.exhibitionOrder || idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await galleryDB.saveAllArtworks(seededArtworks);
      await galleryDB.setMeta<Artist>('artist', defaultArtist);
      await galleryDB.setMeta<CollectionInfo>('collection', defaultCollection);

      notifyDataUpdated();
    } catch (err) {
      console.error('resetToDefaults failed:', err);
    }
  }
}

// Singleton repository instance
export const galleryRepository: IGalleryRepository = new LocalIndexedDBGalleryRepository();
