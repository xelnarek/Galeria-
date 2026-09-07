/**
 * Polish diacritics mapping and URL-friendly slug generator.
 */

const POLISH_MAP: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
  Ą: 'a',
  Ć: 'c',
  Ę: 'e',
  Ł: 'l',
  Ń: 'n',
  Ó: 'o',
  Ś: 's',
  Ź: 'z',
  Ż: 'z',
};

export function generateSlug(title: string): string {
  if (!title) return 'dzielo-bez-tytulu';

  let normalized = title;
  for (const [char, replacement] of Object.entries(POLISH_MAP)) {
    normalized = normalized.replaceAll(char, replacement);
  }

  // Remove diacritics generally, then sanitize
  return normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'dzielo';
}

export function generateUniqueSlug(
  title: string,
  existingSlugs: string[],
  currentArtworkId?: string,
  existingArtworks?: { id: string; slug: string }[]
): string {
  const baseSlug = generateSlug(title);

  // Filter out the current artwork's existing slug if we're editing
  const otherSlugs = new Set<string>();
  if (existingArtworks && currentArtworkId) {
    existingArtworks.forEach((art) => {
      if (art.id !== currentArtworkId && art.slug) {
        otherSlugs.add(art.slug.toLowerCase());
      }
    });
  } else {
    existingSlugs.forEach((s) => otherSlugs.add(s.toLowerCase()));
  }

  if (!otherSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (otherSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}
