import { FEATURED_BUSINESSES, filterBusinesses } from '@/features/businesses';
import { MOCK_PRODUCTS } from '@/features/products';
import { apiRequest } from '@/lib/api';

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface SearchResultItem {
  id: string;
  type: 'business' | 'product';
  title: string;
  subtitle: string;
  category: string;
  location?: string;
  price?: number;
  rating?: number;
  imageUrl: string;
  href: string;
}

export interface SearchResponse {
  data: SearchResultItem[];
  total: number;
  source: 'api' | 'fallback';
}

export async function searchMarketplace(filters: SearchFilters = {}): Promise<SearchResponse> {
  const {
    query = '',
    category,
    location,
    minPrice,
    maxPrice,
    minRating,
  } = filters;

  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (location) params.set('city', location);

    const [businessRes, productRes] = await Promise.all([
      apiRequest<{ data: Record<string, unknown>[] }>(`/businesses?${params.toString()}`),
      apiRequest<{ data: Record<string, unknown>[] }>(`/products?${params.toString()}`),
    ]);

    const businesses: SearchResultItem[] = (businessRes.data || []).map((row) => ({
      id: `b-${row.id}`,
      type: 'business',
      title: String(row.business_name ?? row.name ?? 'Business'),
      subtitle: String(row.description ?? ''),
      category: String(row.business_type ?? 'Business'),
      location: String(row.city ?? ''),
      rating: Number(row.avg_rating ?? 0),
      imageUrl:
        String(row.cover_image || row.logo || '') ||
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      href: `/business/${String(row.business_name || 'business')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|$)/g, '')}-${row.id}`,
    }));

    const products: SearchResultItem[] = (productRes.data || []).map((row) => ({
      id: `p-${row.id}`,
      type: 'product',
      title: String(row.name ?? 'Product'),
      subtitle: String(row.description ?? ''),
      category: String(row.category_name ?? 'Product'),
      price: Number(row.price ?? 0),
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      href: `/businesses?q=${encodeURIComponent(String(row.name ?? ''))}`,
    }));

    let data = [...businesses, ...products];
    data = applyClientFilters(data, { minPrice, maxPrice, minRating, category, location, query });

    return { data, total: data.length, source: 'api' };
  } catch {
    const businesses = filterBusinesses(FEATURED_BUSINESSES, query, category).map((b) => ({
      id: `b-${b.id}`,
      type: 'business' as const,
      title: b.name,
      subtitle: b.description,
      category: b.category,
      location: b.city,
      rating: b.rating,
      imageUrl: b.imageUrl,
      href: `/business/${b.slug}`,
    }));

    const products = MOCK_PRODUCTS.filter((p) => {
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchCategory = !category || p.categorySlug === category;
      return matchQuery && matchCategory;
    }).map((p) => ({
      id: `p-${p.id}`,
      type: 'product' as const,
      title: p.name,
      subtitle: p.description,
      category: p.category,
      price: p.salePrice ?? p.price,
      imageUrl: p.images[0],
      href: `/business/sharma-electronics`,
    }));

    let data = [...businesses, ...products];
    data = applyClientFilters(data, { minPrice, maxPrice, minRating, location, query, category });
    return { data, total: data.length, source: 'fallback' };
  }
}

function applyClientFilters(
  data: SearchResultItem[],
  filters: SearchFilters
): SearchResultItem[] {
  return data.filter((item) => {
    if (filters.location && item.location) {
      if (!item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    }
    if (filters.minRating != null && item.rating != null && item.rating < filters.minRating) {
      return false;
    }
    if (filters.minPrice != null && item.price != null && item.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice != null && item.price != null && item.price > filters.maxPrice) {
      return false;
    }
    return true;
  });
}
