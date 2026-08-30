import type { ApiBusinessRow, Business } from './types';
import { parseCoordinate } from '@/lib/geo';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|$)/g, '');
}

export function buildBusinessSlug(row: ApiBusinessRow): string {
  if (row.slug) return row.slug;
  const name = row.business_name || row.name || 'business';
  return `${slugify(name)}-${row.id}`;
}

export function mapApiBusiness(row: ApiBusinessRow): Business {
  const name = row.business_name || row.name || 'Untitled business';
  const rating = Number(row.avg_rating ?? 0) || 0;
  const reviewCount = Number(row.review_count ?? 0) || 0;
  const imageUrl =
    row.cover_image ||
    row.logo ||
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
  const categoryName = row.category_name || row.business_type || 'Business';

  return {
    id: String(row.id),
    name,
    slug: buildBusinessSlug(row),
    category: categoryName,
    categorySlug: row.category_slug || slugify(categoryName),
    categoryId: row.category_id != null ? String(row.category_id) : undefined,
    location: row.address || row.city || 'Local area',
    city: row.city || '',
    rating,
    reviewCount,
    imageUrl,
    coverUrl: row.cover_image || undefined,
    featured: Boolean(row.is_featured),
    description: row.description || 'Local business on LocalMarket.',
    phone: row.phone,
    email: row.email || undefined,
    website: row.website || undefined,
    status: row.status,
    directionsUrl: row.directionsUrl,
    embedUrl: row.embedUrl,
    gallery: row.gallery,
    latitude: parseCoordinate(row.latitude),
    longitude: parseCoordinate(row.longitude),
    productCount: row.product_count != null ? Number(row.product_count) : undefined,
    businessType: row.business_type,
  };
}

export function parseBusinessIdFromSlug(slug: string): string | null {
  const match = slug.match(/-(\d+)$/);
  if (match) return match[1];
  if (/^\d+$/.test(slug)) return slug;
  return null;
}
