import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { artworksData, artistData } from '@/data/gallery-data';
import { ArtworkClientView } from './ArtworkClientView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return artworksData.map((artwork) => ({
    slug: artwork.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const artwork = artworksData.find((a) => a.slug === resolvedParams.slug);

  if (!artwork) {
    return {
      title: 'Dzieło nie zostało odnalezione — Galeria Prywatna',
    };
  }

  const title = `${artwork.title} (${artwork.year}) — ${artistData.name}`;
  const description = `${artwork.medium}. ${artwork.description.replace(/^\[.*?\]\s*—\s*/, '')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: artwork.image,
          width: 1200,
          height: 900,
          alt: artwork.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [artwork.image],
    },
  };
}

export default async function ArtworkPage({ params }: PageProps) {
  const resolvedParams = await params;
  const artwork = artworksData.find((a) => a.slug === resolvedParams.slug);

  if (!artwork) {
    notFound();
  }

  // Schema.org VisualArtwork JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    artMedium: artwork.medium,
    artform: artwork.category,
    dateCreated: artwork.year,
    width: `${artwork.width} cm`,
    height: `${artwork.height} cm`,
    description: artwork.description,
    image: artwork.image,
    creator: {
      '@type': 'Person',
      name: artistData.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArtworkClientView artwork={artwork} allArtworks={artworksData} />
    </>
  );
}
