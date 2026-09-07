export interface ArtworkDetail {
  id: string;
  image: string;
  title: string;
  description: string;
}

export type ArtworkStatus = 'published' | 'draft' | 'hidden';

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  year: string;
  category: string;
  medium: string;
  width: number;
  height: number;
  image: string;
  thumbnail: string;
  description: string;
  status?: ArtworkStatus;
  story?: {
    origin?: string;
    meaning?: string;
    curatorialNote?: string;
  };
  details?: ArtworkDetail[];
  featured?: boolean;
  order: number;
  exhibitionOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Artist {
  name: string;
  tagline: string;
  biography: string;
  statement: string;
  portrait: string;
  yearsActive?: string;
}

export interface CollectionInfo {
  title: string;
  subtitle: string;
  quote: string;
  description: string;
  giftDedication: string;
  curatorNote: string;
  coverArtworkId: string;
}

export interface GalleryBackupPackage {
  version: string;
  exportedAt: string;
  collection: CollectionInfo;
  artist: Artist;
  artworks: Artwork[];
}
