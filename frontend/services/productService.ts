import { AUTH_TOKEN_KEY } from '@/features/auth/types';
import type { Product, ProductInput } from '@/features/products';
import { apiRequest } from '@/lib/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
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
    variations: [],
    vendorId: String(row.business_id ?? 'vendor-1'),
    status: (row.status as Product['status']) || 'draft',
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
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
  const res = await apiRequest<{ data: Record<string, unknown> }>('/vendor/products', {
    method: 'POST',
    token,
    body: {
      name: input.name,
      description: input.description,
      price: input.price,
      sale_price: input.salePrice,
      stock: input.stock,
      status: input.status,
    },
  });
  return mapApiProduct(res.data);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const token = getToken();
  const res = await apiRequest<{ data: Record<string, unknown> }>(`/vendor/products/${id}`, {
    method: 'PUT',
    token,
    body: {
      name: input.name,
      description: input.description,
      price: input.price,
      sale_price: input.salePrice,
      stock: input.stock,
      status: input.status,
    },
  });
  return mapApiProduct(res.data);
}

export async function deleteProduct(id: string): Promise<void> {
  const token = getToken();
  await apiRequest(`/vendor/products/${id}`, { method: 'DELETE', token });
}
