import { apiRequest } from '@/lib/api';
import { parseCoordinate } from '@/lib/geo';
import type { Product } from '@/features/products';

export interface CatalogProduct extends Product {
  businessName?: string;
  businessSlug?: string;
  rating?: number;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  distanceKm?: number | null;
}

export interface ProductSearchParams {
  q?: string;
  categoryId?: string;
  businessId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'name';
  limit?: number;
  offset?: number;
}

function mapRow(row: Record<string, unknown>): CatalogProduct {
  const images: string[] = [];
  if (row.image_url) images.push(String(row.image_url));
  if (Array.isArray(row.images)) {
    for (const img of row.images as { file_path?: string; url?: string }[]) {
      const url = img.file_path || img.url;
      if (url) images.push(url);
    }
  }

  return {
    id: String(row.id),
    name: String(row.name ?? 'Product'),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    images,
    category: String(row.category_name ?? row.category ?? 'General'),
    categorySlug: String(row.category_slug ?? 'services'),
    stock: Number(row.stock ?? 0),
    variations: [],
    vendorId: String(row.business_id ?? ''),
    status: (row.status as Product['status']) || 'published',
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    businessName: (row.business_name as string) || undefined,
    businessSlug: (row.business_slug as string) || undefined,
    rating: row.avg_rating != null ? Number(row.avg_rating) : undefined,
    imageUrl: (row.image_url as string) || images[0],
    latitude: parseCoordinate(row.business_latitude ?? row.latitude),
    longitude: parseCoordinate(row.business_longitude ?? row.longitude),
    city: row.business_city != null ? String(row.business_city) : undefined,
  };
}

export async function searchCatalogProducts(
  params: ProductSearchParams = {}
): Promise<CatalogProduct[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.businessId) qs.set('businessId', params.businessId);
  if (params.minPrice != null) qs.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) qs.set('maxPrice', String(params.maxPrice));
  if (params.sort) qs.set('sort', params.sort);
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));

  try {
    const res = await apiRequest<{ data: Record<string, unknown>[] }>(
      `/products${qs.toString() ? `?${qs}` : ''}`
    );
    return (res.data || []).map(mapRow);
  } catch {
    return [];
  }
}
