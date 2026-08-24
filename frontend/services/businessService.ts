import {
  FEATURED_BUSINESSES,
  filterBusinesses,
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

function fallbackList(params: BusinessSearchParams): BusinessListResponse {
  const { query = '', category, city, featured, page = 1, limit = 12 } = params;
  let data = filterBusinesses(FEATURED_BUSINESSES, query, category);
  if (city) {
    data = data.filter((b) => b.city.toLowerCase() === city.toLowerCase());
  }
  if (featured !== undefined) {
    data = data.filter((b) => b.featured === featured);
  }
  const start = (page - 1) * limit;
  return {
    data: data.slice(start, start + limit),
    total: data.length,
    page,
    limit,
    source: 'fallback',
  };
}

export async function fetchBusinesses(
  params: BusinessSearchParams = {}
): Promise<BusinessListResponse> {
  const { query = '', categoryId, city, featured, page = 1, limit = 12 } = params;
  const offset = (page - 1) * limit;

  try {
    if (featured) {
      const featuredRes = await apiRequest<ApiListEnvelope>('/featured', {
        next: { revalidate: 60 },
      });
      const mapped = (featuredRes.data || []).map(mapApiBusiness);
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
    if (city) searchParams.set('city', city);
    searchParams.set('limit', String(limit));
    searchParams.set('offset', String(offset));

    const response = await apiRequest<ApiListEnvelope>(
      `/businesses?${searchParams.toString()}`,
      { next: { revalidate: 30 } }
    );

    const mapped = (response.data || []).map(mapApiBusiness);
    return {
      data: mapped,
      total: mapped.length,
      page,
      limit,
      source: 'api',
    };
  } catch {
    return fallbackList(params);
  }
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
  const local = FEATURED_BUSINESSES.find((b) => b.slug === slug);
  const apiId = parseBusinessIdFromSlug(slug) ?? (local ? local.id : null);

  if (apiId) {
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
      if (error instanceof ApiError && error.status === 404 && local) {
        return local;
      }
      if (local) return local;
      return null;
    }
  }

  return local ?? null;
}

export async function fetchBusinessesForListing(
  params: BusinessSearchParams = {}
): Promise<BusinessListResponse> {
  return fetchBusinesses(params);
}
