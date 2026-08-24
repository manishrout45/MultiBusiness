import { AUTH_TOKEN_KEY } from '@/features/auth/types';
import { apiRequest } from '@/lib/api';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  imageUrl?: string;
  businessId: string;
  businessName: string;
  businessSlug?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

const WISHLIST_KEY = 'marketplace_wishlist_v1';

function loadLocal(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

function mapItem(row: Record<string, unknown>): WishlistItem {
  return {
    id: String(row.id ?? row.product_id),
    productId: String(row.product_id ?? row.id),
    name: String(row.name ?? 'Product'),
    price: Number(row.price ?? 0),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    stock: Number(row.stock ?? 0),
    imageUrl: (row.image_url as string) || undefined,
    businessId: String(row.business_id ?? ''),
    businessName: String(row.business_name ?? 'Local store'),
    businessSlug: (row.business_slug as string) || undefined,
  };
}

export const wishlistService = {
  async list(token?: string | null): Promise<WishlistItem[]> {
    const auth = token ?? getToken();
    if (auth) {
      try {
        const res = await apiRequest<{ data: Record<string, unknown>[] }>('/customer/wishlist', {
          token: auth,
        });
        return (res.data || []).map(mapItem);
      } catch {
        // fall through
      }
    }
    return [];
  },

  async add(productId: string, token?: string | null): Promise<void> {
    const auth = token ?? getToken();
    if (auth) {
      await apiRequest('/customer/wishlist', {
        method: 'POST',
        token: auth,
        body: { productId: Number(productId) || productId },
      });
      return;
    }
    const ids = loadLocal();
    if (!ids.includes(productId)) {
      saveLocal([productId, ...ids]);
    }
  },

  async remove(productId: string, token?: string | null): Promise<void> {
    const auth = token ?? getToken();
    if (auth) {
      await apiRequest(`/customer/wishlist/${productId}`, {
        method: 'DELETE',
        token: auth,
      });
      return;
    }
    saveLocal(loadLocal().filter((id) => id !== productId));
  },

  localIds(): string[] {
    return loadLocal();
  },
};
