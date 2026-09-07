import {
  mapApiBusiness,
  parseBusinessIdFromSlug,
  type ApiBusinessRow,
  type Business,
  type BusinessDetail,
  type BusinessListResponse,
  type BusinessProduct,
  type BusinessSearchParams,
} from '@/features/businesses';
import { apiRequest, ApiError } from '@/lib/api';

interface ApiListEnvelope {
  data: ApiBusinessRow[];
}

interface ApiItemEnvelope {
  data: ApiBusinessRow;
}

interface ApiProductsEnvelope {
  data: BusinessProduct[];
}

export async function fetchBusinesses(
  params: BusinessSearchParams = {}
): Promise<BusinessListResponse> {
  const { query = '', category, categoryId, city, minRating, featured, page = 1, limit = 12 } =
    params;
  const offset = (page - 1) * limit;

  if (featured) {
    const featuredRes = await apiRequest<ApiListEnvelope>('/featured', {
      next: { revalidate: 60 },
    });
    let mapped = (featuredRes.data || []).map(mapApiBusiness);
    if (minRating != null) {
      mapped = mapped.filter((b) => (b.rating || 0) >= minRating);
    }
    if (city) {
      mapped = mapped.filter((b) => b.city.toLowerCase().includes(city.toLowerCase()));
    }
    return {
      data: mapped.slice(0, limit),
      total: mapped.length,
      page,
      limit,
      source: 'api',
    };
  }

  const searchParams = new URLSearchParams();
  if (query) searchParams.set('q', query);
  if (categoryId) searchParams.set('categoryId', String(categoryId));
  else if (category) searchParams.set('category', category);
  if (city) searchParams.set('city', city);
  if (minRating != null) searchParams.set('minRating', String(minRating));
  searchParams.set('limit', String(limit));
  searchParams.set('offset', String(offset));

  const response = await apiRequest<ApiListEnvelope>(`/businesses?${searchParams.toString()}`, {
    next: { revalidate: 30 },
  });

  const mapped = (response.data || []).map(mapApiBusiness);
  return {
    data: mapped,
    total: mapped.length,
    page,
    limit,
    source: 'api',
  };
}

/** Fetch a larger pool of businesses for map / nearby filtering. */
export async function fetchNearbyBusinessPool(params: {
  query?: string;
  categoryId?: string | number;
  city?: string;
  limit?: number;
} = {}): Promise<Business[]> {
  const result = await fetchBusinesses({
    query: params.query,
    categoryId: params.categoryId,
    city: params.city,
    page: 1,
    limit: params.limit ?? 100,
  });
  return result.data;
}

export async function fetchFeaturedBusinesses(): Promise<Business[]> {
  const result = await fetchBusinesses({ featured: true, limit: 8 });
  return result.data;
}

export async function searchBusinesses(query: string, category?: string): Promise<Business[]> {
  const result = await fetchBusinesses({ query, category, limit: 20 });
  return result.data;
}

export async function fetchBusinessBySlug(slug: string): Promise<BusinessDetail | null> {
  const apiId = parseBusinessIdFromSlug(slug);
  if (!apiId) return null;

  try {
    const [businessRes, productsRes] = await Promise.all([
      apiRequest<ApiItemEnvelope>(`/businesses/${apiId}`, {
        next: { revalidate: 30 },
      }),
      apiRequest<ApiProductsEnvelope>(`/businesses/${apiId}/products`, {
        next: { revalidate: 30 },
      }).catch(() => ({ data: [] as BusinessProduct[] })),
    ]);

    const business = mapApiBusiness(businessRes.data);
    return {
      ...business,
      products: productsRes.data || [],
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchBusinessesForListing(
  params: BusinessSearchParams = {}
): Promise<BusinessListResponse> {
  return fetchBusinesses(params);
}
