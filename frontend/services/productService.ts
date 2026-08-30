import { AUTH_TOKEN_KEY } from '@/features/auth/types';
import { MOCK_PRODUCTS, type Product, type ProductInput } from '@/features/products';
import { apiRequest } from '@/lib/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

let localProducts: Product[] = structuredClone(MOCK_PRODUCTS);

function mapApiProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name ?? 'Product'),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    images: Array.isArray(row.images)
      ? (row.images as { file_path?: string }[]).map((i) => i.file_path || '').filter(Boolean)
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
  try {
    const token = getToken();
    const res = await apiRequest<{ data: Record<string, unknown>[] }>('/vendor/products', {
      token,
    });
    localProducts = (res.data || []).map(mapApiProduct);
    return structuredClone(localProducts);
  } catch {
    return structuredClone(localProducts);
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const product: Product = {
    ...input,
    id: `p-${Date.now()}`,
    vendorId: input.vendorId || 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
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
    const mapped = mapApiProduct(res.data);
    localProducts = [mapped, ...localProducts];
    return mapped;
  } catch {
    localProducts = [product, ...localProducts];
    return product;
  }
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const idx = localProducts.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found');

  const next = {
    ...localProducts[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  } as Product;

  try {
    const token = getToken();
    await apiRequest(`/vendor/products/${id}`, {
      method: 'PUT',
      token,
      body: {
        name: next.name,
        description: next.description,
        price: next.price,
        sale_price: next.salePrice,
        stock: next.stock,
        status: next.status,
      },
    });
  } catch {
    // optimistic local
  }

  localProducts[idx] = next;
  return structuredClone(next);
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const token = getToken();
    await apiRequest(`/vendor/products/${id}`, { method: 'DELETE', token });
  } catch {
    // continue with local delete
  }
  localProducts = localProducts.filter((p) => p.id !== id);
}
