import { apiRequest } from '@/lib/api';
import { parseCoordinate } from '@/lib/geo';
import type { Product } from '@/features/products';

export interface CatalogProduct extends Product {
  businessName?: string;
  businessSlug?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  distanceKm?: number | null;
}

export interface ProductDetail extends CatalogProduct {
  business?: {
    id: string;
    businessName: string;
    slug?: string;
    city?: string;
    phone?: string;
    whatsapp?: string;
    logo?: string | null;
    businessType?: string;
    description?: string;
  };
  variations: Array<{
    id: string;
    name: string;
    value: string;
    priceAdjustment: number;
    stock: number;
  }>;
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    comment?: string;
  }>;
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

function mapDetail(row: Record<string, unknown>): ProductDetail {
  const base = mapRow(row);
  const business = row.business as Record<string, unknown> | null;
  const images = base.images.length
    ? base.images
    : Array.isArray(row.images)
      ? (row.images as { file_path?: string }[])
          .map((img) => img.file_path || '')
          .filter(Boolean)
      : [];

  return {
    ...base,
    images,
    imageUrl: images[0] || base.imageUrl,
    rating: row.avg_rating != null ? Number(row.avg_rating) : base.rating,
    reviewCount: row.review_count != null ? Number(row.review_count) : undefined,
    business: business
      ? {
          id: String(business.id),
          businessName: String(business.business_name ?? ''),
          slug: business.slug ? String(business.slug) : undefined,
          city: business.city ? String(business.city) : undefined,
          phone: business.phone ? String(business.phone) : undefined,
          whatsapp: business.whatsapp ? String(business.whatsapp) : undefined,
          logo: business.logo ? String(business.logo) : null,
          businessType: business.business_type ? String(business.business_type) : undefined,
          description: business.description ? String(business.description) : undefined,
        }
      : undefined,
    variations: Array.isArray(row.variations)
      ? (row.variations as Record<string, unknown>[]).map((v) => ({
          id: String(v.id),
          name: String(v.variation_name ?? 'Size'),
          value: String(v.variation_value ?? ''),
          priceAdjustment: Number(v.price_adjustment ?? 0),
          stock: Number(v.stock ?? 0),
        }))
      : [],
    reviews: Array.isArray(row.reviews)
      ? (row.reviews as Record<string, unknown>[]).map((r) => ({
          id: String(r.id),
          userName: String(r.user_name ?? 'Customer'),
          rating: Number(r.rating ?? 0),
          comment: r.comment ? String(r.comment) : undefined,
        }))
      : [],
  };
}

export async function getCatalogProduct(id: string): Promise<ProductDetail | null> {
  try {
    const res = await apiRequest<{ data: Record<string, unknown> }>(`/products/${id}`);
    return mapDetail(res.data);
  } catch {
    return null;
  }
}
