import { AUTH_TOKEN_KEY } from '@/features/auth/types';
import type { Product, ProductInput, ProductVariation } from '@/features/products';
import { apiRequest } from '@/lib/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function mapVariations(row: Record<string, unknown>): ProductVariation[] {
  if (!Array.isArray(row.variations)) return [];
  return (row.variations as Record<string, unknown>[]).map((v) => ({
    id: String(v.id ?? `var-${Math.random()}`),
    name: String(v.variation_name ?? v.name ?? 'Size'),
    value: String(v.variation_value ?? v.value ?? ''),
    priceAdjustment: Number(v.price_adjustment ?? v.priceAdjustment ?? 0),
    stock: Number(v.stock ?? 0),
    sku: v.sku ? String(v.sku) : undefined,
  }));
}

function mapApiProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name ?? 'Product'),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    images: Array.isArray(row.images)
      ? (row.images as { file_path?: string }[]).map((i) => i.file_path || '').filter(Boolean)
      : row.image_url
        ? [String(row.image_url)]
        : [],
    category: String(row.category_name ?? row.category ?? 'General'),
    categorySlug: String(row.category_slug ?? 'services'),
    stock: Number(row.stock ?? 0),
    variations: mapVariations(row),
    vendorId: String(row.business_id ?? 'vendor-1'),
    status: (row.status as Product['status']) || 'draft',
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function variationsPayload(variations: ProductVariation[] | undefined) {
  if (!variations?.length) return [];
  return variations
    .filter((v) => v.value?.trim())
    .map((v) => ({
      name: v.name || 'Size',
      value: v.value.trim(),
      priceAdjustment: Number(v.priceAdjustment || 0),
      stock: Number(v.stock || 0),
      sku: v.sku || null,
    }));
}

export async function listVendorProducts(): Promise<Product[]> {
  const token = getToken();
  const res = await apiRequest<{ data: Record<string, unknown>[] }>('/vendor/products', {
    token,
  });
  return (res.data || []).map(mapApiProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const token = getToken();
  const variations = variationsPayload(input.variations);
  const stock =
    variations.length > 0
      ? variations.reduce((sum, v) => sum + Number(v.stock || 0), 0)
      : input.stock;
  const res = await apiRequest<{ data: Record<string, unknown> }>('/vendor/products', {
    method: 'POST',
    token,
    body: {
      name: input.name,
      description: input.description,
      price: input.price,
      sale_price: input.salePrice,
      stock,
      status: input.status,
      variations,
    },
  });
  return mapApiProduct(res.data);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const token = getToken();
  const variations =
    input.variations !== undefined ? variationsPayload(input.variations) : undefined;
  const stock =
    variations && variations.length > 0
      ? variations.reduce((sum, v) => sum + Number(v.stock || 0), 0)
      : input.stock;
  const res = await apiRequest<{ data: Record<string, unknown> }>(`/vendor/products/${id}`, {
    method: 'PUT',
    token,
    body: {
      name: input.name,
      description: input.description,
      price: input.price,
      sale_price: input.salePrice,
      stock,
      status: input.status,
      ...(variations !== undefined ? { variations } : {}),
    },
  });
  return mapApiProduct(res.data);
}

export async function deleteProduct(id: string): Promise<void> {
  const token = getToken();
  await apiRequest(`/vendor/products/${id}`, { method: 'DELETE', token });
}
