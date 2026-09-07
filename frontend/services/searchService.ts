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
      price: Number(row.sale_price ?? row.price ?? 0),
      imageUrl:
        String(row.image_url || '') ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      href: `/products/${row.id}`,
    }));

    let data = [...businesses, ...products];
    data = applyClientFilters(data, { minPrice, maxPrice, minRating, category, location, query });

    return { data, total: data.length, source: 'api' };
  } catch {
    return { data: [], total: 0, source: 'api' };
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
