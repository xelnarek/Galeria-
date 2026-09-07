'use client';

import { Artwork, Artist, CollectionInfo } from '@/types/gallery';

const DB_NAME = 'PrivateGalleryCuratorDB_v1';
const DB_VERSION = 1;

const STORES = {
  ARTWORKS: 'artworks',
  METADATA: 'metadata',
} as const;

class GalleryIndexedDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private isAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private openDB(): Promise<IDBDatabase> {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for artworks
        if (!db.objectStoreNames.contains(STORES.ARTWORKS)) {
          const artworkStore = db.createObjectStore(STORES.ARTWORKS, { keyPath: 'id' });
          artworkStore.createIndex('slug', 'slug', { unique: true });
          artworkStore.createIndex('order', 'order', { unique: false });
          artworkStore.createIndex('status', 'status', { unique: false });
        }

        // Store for artist & collection info
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        this.dbPromise = null;
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  async getAllArtworks(): Promise<Artwork[]> {
    if (!this.isAvailable()) return [];
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ARTWORKS, 'readonly');
      const store = tx.objectStore(STORES.ARTWORKS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getArtworkById(id: string): Promise<Artwork | null> {
    if (!this.isAvailable()) return null;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ARTWORKS, 'readonly');
      const store = tx.objectStore(STORES.ARTWORKS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getArtworkBySlug(slug: string): Promise<Artwork | null> {
    if (!this.isAvailable()) return null;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ARTWORKS, 'readonly');
      const store = tx.objectStore(STORES.ARTWORKS);
      const index = store.index('slug');
      const request = index.get(slug);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveArtwork(artwork: Artwork): Promise<void> {
    if (!this.isAvailable()) return;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ARTWORKS, 'readwrite');
      const store = tx.objectStore(STORES.ARTWORKS);
      const request = store.put(artwork);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveAllArtworks(artworks: Artwork[]): Promise<void> {
    if (!this.isAvailable()) return;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ARTWORKS, 'readwrite');
      const store = tx.objectStore(STORES.ARTWORKS);

      // Clear existing, then write updated list
      store.clear().onsuccess = () => {
        artworks.forEach((art) => store.put(art));
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteArtwork(id: string): Promise<void> {
    if (!this.isAvailable()) return;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ARTWORKS, 'readwrite');
      const store = tx.objectStore(STORES.ARTWORKS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMeta<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.METADATA, 'readonly');
      const store = tx.objectStore(STORES.METADATA);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result && 'value' in request.result) {
          resolve(request.result.value as T);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setMeta<T>(key: string, value: T): Promise<void> {
    if (!this.isAvailable()) return;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.METADATA, 'readwrite');
      const store = tx.objectStore(STORES.METADATA);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.isAvailable()) return;
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.ARTWORKS, STORES.METADATA], 'readwrite');
      tx.objectStore(STORES.ARTWORKS).clear();
      tx.objectStore(STORES.METADATA).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const galleryDB = new GalleryIndexedDB();
