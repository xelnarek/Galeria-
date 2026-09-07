import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firebaseError';
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
import { generateUniqueSlug } from '@/lib/slug';
import { IGalleryRepository, ArtworkQueryOptions } from './galleryRepository';

const ARTWORKS_COLLECTION = 'artworks';
const METADATA_COLLECTION = 'metadata';
const ARTIST_DOC_ID = 'artist';
const COLLECTION_DOC_ID = 'collection';

const GALLERY_DATA_EVENT = 'gallery_data_updated';

function notifyDataUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GALLERY_DATA_EVENT));
  }
}

export class FirestoreGalleryRepository implements IGalleryRepository {
  private initialized = false;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  isLocalMode(): boolean {
    return false;
  }

  getStorageModeLabel(): string {
    return 'Chmura Firebase Firestore (Chmura Realtime)';
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isClient() || this.initialized) return;

    try {
      const artworksRef = collection(db, ARTWORKS_COLLECTION);
      let snapshot;
      try {
        snapshot = await getDocs(artworksRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, ARTWORKS_COLLECTION);
      }

      if (snapshot.empty) {
        // Seed initial gallery data to Firestore
        const batch = writeBatch(db);

        defaultArtworks.forEach((art, idx) => {
          const artDocRef = doc(db, ARTWORKS_COLLECTION, art.id);
          const artworkData: Artwork = {
            ...art,
            status: 'published' as ArtworkStatus,
            order: idx + 1,
            exhibitionOrder: art.exhibitionOrder || idx + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          batch.set(artDocRef, artworkData);
        });

        const artistDocRef = doc(db, METADATA_COLLECTION, ARTIST_DOC_ID);
        batch.set(artistDocRef, defaultArtist);

        const collectionDocRef = doc(db, METADATA_COLLECTION, COLLECTION_DOC_ID);
        batch.set(collectionDocRef, defaultCollection);

        try {
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'batch_seed');
        }
      }

      this.initialized = true;
    } catch (err) {
      console.warn('FirestoreGalleryRepository init check warning:', err);
      this.initialized = true;
    }
  }

  async getAllArtworksForStudio(): Promise<Artwork[]> {
    if (!this.isClient()) {
      return defaultArtworks.map((a, idx) => ({
        ...a,
        status: (a.status || 'published') as ArtworkStatus,
        order: idx + 1,
      }));
    }

    await this.ensureInitialized();
    try {
      const artworksRef = collection(db, ARTWORKS_COLLECTION);
      const q = query(artworksRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return defaultArtworks.map((a, idx) => ({
          ...a,
          status: (a.status || 'published') as ArtworkStatus,
          order: idx + 1,
        }));
      }

      const list: Artwork[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Artwork);
      });
      return list.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ARTWORKS_COLLECTION);
    }
  }

  async getArtworks(options?: ArtworkQueryOptions): Promise<Artwork[]> {
    const list = await this.getAllArtworksForStudio();

    return list.filter((artwork) => {
      const status = artwork.status || 'published';
      if (status === 'published') return true;
      if (status === 'draft' && options?.includeDrafts) return true;
      if (status === 'hidden' && options?.includeHidden) return true;
      return false;
    });
  }

  async getArtwork(idOrSlug: string, options?: ArtworkQueryOptions): Promise<Artwork | null> {
    const list = await this.getAllArtworksForStudio();
    const artwork = list.find((a) => a.id === idOrSlug || a.slug === idOrSlug) || null;

    if (!artwork) return null;

    const status = artwork.status || 'published';
    if (status === 'published') return artwork;
    if (status === 'draft' && options?.includeDrafts) return artwork;
    if (status === 'hidden' && options?.includeHidden) return artwork;

    return null;
  }

  async createArtwork(
    data: Omit<Artwork, 'id' | 'order'> & { id?: string; order?: number }
  ): Promise<Artwork> {
    await this.ensureInitialized();
    const all = await this.getAllArtworksForStudio();

    const newId = data.id || `dzielo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newOrder = data.order ?? all.length + 1;

    const finalSlug = data.slug
      ? generateUniqueSlug(data.slug, all.map((a) => a.slug))
      : generateUniqueSlug(data.title, all.map((a) => a.slug));

    if (data.featured) {
      for (const existing of all) {
        if (existing.featured) {
          try {
            await updateDoc(doc(db, ARTWORKS_COLLECTION, existing.id), { featured: false });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `${ARTWORKS_COLLECTION}/${existing.id}`);
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
    };

    try {
      await setDoc(doc(db, ARTWORKS_COLLECTION, newId), newArtwork);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${ARTWORKS_COLLECTION}/${newId}`);
    }

    notifyDataUpdated();
    return newArtwork;
  }

  async updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork> {
    await this.ensureInitialized();
    const all = await this.getAllArtworksForStudio();
    const target = all.find((a) => a.id === id);

    if (!target) {
      throw new Error(`Dzieło o identyfikatorze "${id}" nie zostało odnalezione.`);
    }

    let updatedSlug = target.slug;
    if (updates.slug && updates.slug !== target.slug) {
      updatedSlug = generateUniqueSlug(updates.slug, all.map((a) => a.slug), id, all);
    } else if (updates.title && updates.title !== target.title && !updates.slug) {
      updatedSlug = generateUniqueSlug(updates.title, all.map((a) => a.slug), id, all);
    }

    if (updates.featured === true) {
      for (const existing of all) {
        if (existing.id !== id && existing.featured) {
          try {
            await updateDoc(doc(db, ARTWORKS_COLLECTION, existing.id), { featured: false });
          } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, `${ARTWORKS_COLLECTION}/${existing.id}`);
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

    try {
      await setDoc(doc(db, ARTWORKS_COLLECTION, id), updatedArtwork);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${ARTWORKS_COLLECTION}/${id}`);
    }

    notifyDataUpdated();
    return updatedArtwork;
  }

  async deleteArtwork(id: string): Promise<boolean> {
    await this.ensureInitialized();
    try {
      await deleteDoc(doc(db, ARTWORKS_COLLECTION, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${ARTWORKS_COLLECTION}/${id}`);
    }
    notifyDataUpdated();
    return true;
  }

  async reorderArtworks(orderedIds: string[]): Promise<Artwork[]> {
    await this.ensureInitialized();
    const all = await this.getAllArtworksForStudio();
    const map = new Map(all.map((a) => [a.id, a]));

    const batch = writeBatch(db);
    const reordered: Artwork[] = [];

    orderedIds.forEach((id, index) => {
      const art = map.get(id);
      if (art) {
        const updatedArt: Artwork = {
          ...art,
          order: index + 1,
          exhibitionOrder: index + 1,
          updatedAt: new Date().toISOString(),
        };
        reordered.push(updatedArt);
        const ref = doc(db, ARTWORKS_COLLECTION, id);
        batch.update(ref, {
          order: index + 1,
          exhibitionOrder: index + 1,
          updatedAt: updatedArt.updatedAt,
        });
      }
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch_reorder');
    }

    notifyDataUpdated();
    return reordered;
  }

  async setFeatured(id: string): Promise<Artwork[]> {
    await this.ensureInitialized();
    const all = await this.getAllArtworksForStudio();
    const batch = writeBatch(db);

    const updatedList: Artwork[] = all.map((art) => {
      const isFeatured = art.id === id;
      const updated = { ...art, featured: isFeatured };
      const ref = doc(db, ARTWORKS_COLLECTION, art.id);
      batch.update(ref, { featured: isFeatured });
      return updated;
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch_set_featured');
    }

    notifyDataUpdated();
    return updatedList;
  }

  async getArtist(): Promise<Artist> {
    if (!this.isClient()) return defaultArtist;
    await this.ensureInitialized();
    try {
      const docRef = doc(db, METADATA_COLLECTION, ARTIST_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Artist;
      }
      return defaultArtist;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${METADATA_COLLECTION}/${ARTIST_DOC_ID}`);
    }
  }

  async updateArtist(data: Partial<Artist>): Promise<Artist> {
    await this.ensureInitialized();
    const current = await this.getArtist();
    const updated: Artist = { ...current, ...data };
    try {
      await setDoc(doc(db, METADATA_COLLECTION, ARTIST_DOC_ID), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${METADATA_COLLECTION}/${ARTIST_DOC_ID}`);
    }
    notifyDataUpdated();
    return updated;
  }

  async getCollectionInfo(): Promise<CollectionInfo> {
    if (!this.isClient()) return defaultCollection;
    await this.ensureInitialized();
    try {
      const docRef = doc(db, METADATA_COLLECTION, COLLECTION_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as CollectionInfo;
      }
      return defaultCollection;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${METADATA_COLLECTION}/${COLLECTION_DOC_ID}`);
    }
  }

  async updateCollectionInfo(data: Partial<CollectionInfo>): Promise<CollectionInfo> {
    await this.ensureInitialized();
    const current = await this.getCollectionInfo();
    const updated: CollectionInfo = { ...current, ...data };
    try {
      await setDoc(doc(db, METADATA_COLLECTION, COLLECTION_DOC_ID), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${METADATA_COLLECTION}/${COLLECTION_DOC_ID}`);
    }
    notifyDataUpdated();
    return updated;
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

    const batch = writeBatch(db);
    sanitizedArtworks.forEach((art) => {
      const ref = doc(db, ARTWORKS_COLLECTION, art.id);
      batch.set(ref, art);
    });

    if (backup.artist) {
      const artistRef = doc(db, METADATA_COLLECTION, ARTIST_DOC_ID);
      batch.set(artistRef, backup.artist);
    }
    if (backup.collection) {
      const collRef = doc(db, METADATA_COLLECTION, COLLECTION_DOC_ID);
      batch.set(collRef, backup.collection);
    }

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch_import');
    }

    notifyDataUpdated();
    return { success: true, count: sanitizedArtworks.length };
  }

  async resetToDefaults(): Promise<void> {
    await this.ensureInitialized();
    const existing = await this.getAllArtworksForStudio();

    const batch = writeBatch(db);
    existing.forEach((art) => {
      batch.delete(doc(db, ARTWORKS_COLLECTION, art.id));
    });

    defaultArtworks.forEach((art, idx) => {
      const ref = doc(db, ARTWORKS_COLLECTION, art.id);
      const artworkData: Artwork = {
        ...art,
        status: 'published' as ArtworkStatus,
        order: idx + 1,
        exhibitionOrder: art.exhibitionOrder || idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(ref, artworkData);
    });

    batch.set(doc(db, METADATA_COLLECTION, ARTIST_DOC_ID), defaultArtist);
    batch.set(doc(db, METADATA_COLLECTION, COLLECTION_DOC_ID), defaultCollection);

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch_reset');
    }

    notifyDataUpdated();
  }
}
