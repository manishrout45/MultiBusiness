import type { CartItem, CartTotals } from '@/features/cart/types';
import { apiRequest } from '@/lib/api';
import { clearLocalCart, loadLocalCart, saveLocalCart } from '@/features/cart/storage';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop';

let cachedFees: { deliveryFee: number; platformFee: number } | null = null;

interface ApiCartRow {
  id: number;
  product_id: number;
  business_id?: number;
  quantity: number;
  name: string;
  price: number;
  sale_price?: number | null;
  price_adjustment?: number | null;
  business_name: string;
  image_url?: string | null;
  variation_id?: number | null;
  variation_value?: string | null;
}

function mapApiRow(row: ApiCartRow): CartItem {
  const base = row.sale_price != null ? Number(row.sale_price) : Number(row.price);
  const price = base + Number(row.price_adjustment || 0);
  return {
    id: String(row.id),
    productId: String(row.product_id),
    vendorId: row.business_id != null ? String(row.business_id) : 'unknown',
    vendorName: row.business_name,
    productName: row.variation_value ? `${row.name} (${row.variation_value})` : row.name,
    image: row.image_url || PLACEHOLDER_IMAGE,
    price,
    quantity: Number(row.quantity),
    variationId: row.variation_id != null ? String(row.variation_id) : null,
    variationLabel: row.variation_value || null,
  };
}

export async function fetchCheckoutFees(): Promise<{ deliveryFee: number; platformFee: number }> {
  if (cachedFees) return cachedFees;
  try {
    const res = await apiRequest<{ data: { deliveryFee: number; platformFee: number } }>('/fees');
    cachedFees = {
      deliveryFee: Number(res.data?.deliveryFee ?? 40) || 0,
      platformFee: Number(res.data?.platformFee ?? 0) || 0,
    };
  } catch {
    cachedFees = { deliveryFee: 40, platformFee: 0 };
  }
  return cachedFees;
}

function calcTotals(
  items: CartItem[],
  fees: { deliveryFee: number; platformFee: number } = cachedFees || {
    deliveryFee: 40,
    platformFee: 0,
  }
): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vendorCount = new Set(items.map((i) => i.vendorId)).size || (items.length ? 1 : 0);
  const deliveryFee = items.length ? fees.deliveryFee * vendorCount : 0;
  const platformFee = items.length ? fees.platformFee * vendorCount : 0;
  const total = subtotal + deliveryFee + platformFee;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function mergeLocalItem(items: CartItem[], incoming: Omit<CartItem, 'id'>): CartItem[] {
  const existing = items.find(
    (i) =>
      i.productId === incoming.productId &&
      (i.variationId || null) === (incoming.variationId || null)
  );
  if (existing) {
    return items.map((i) =>
      i.id === existing.id ? { ...i, quantity: i.quantity + incoming.quantity } : i
    );
  }
  return [
    ...items,
    {
      ...incoming,
      id: `local-${incoming.productId}-${incoming.variationId || 'base'}-${Date.now()}`,
    },
  ];
}

export const cartService = {
  async getCart(token?: string | null): Promise<{ items: CartItem[]; total: number }> {
    await fetchCheckoutFees();
    if (token) {
      try {
        const res = await apiRequest<{ data: ApiCartRow[]; total: number }>('/customer/cart', {
          token,
        });
        const items = res.data.map(mapApiRow);
        saveLocalCart(items);
        return { items, total: res.total };
      } catch {
        // fall through to local
      }
    }
    const items = loadLocalCart();
    return { items, total: calcTotals(items).total };
  },

  async addItem(
    payload: {
      productId: string;
      vendorId: string;
      vendorName: string;
      productName: string;
      image: string;
      price: number;
      quantity?: number;
      variationId?: string | null;
      variationLabel?: string | null;
    },
    token?: string | null
  ): Promise<CartItem[]> {
    const quantity = payload.quantity ?? 1;

    if (token) {
      try {
        const res = await apiRequest<{ data: ApiCartRow[] }>('/customer/cart', {
          method: 'POST',
          token,
          body: {
            productId: Number(payload.productId),
            quantity,
            variationId: payload.variationId ? Number(payload.variationId) : null,
          },
        });
        const items = res.data.map(mapApiRow);
        saveLocalCart(items);
        return items;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Could not add to cart');
      }
    }

    const items = mergeLocalItem(loadLocalCart(), {
      productId: payload.productId,
      vendorId: payload.vendorId,
      vendorName: payload.vendorName,
      productName: payload.variationLabel
        ? `${payload.productName} (${payload.variationLabel})`
        : payload.productName,
      image: payload.image,
      price: payload.price,
      quantity,
      variationId: payload.variationId || null,
      variationLabel: payload.variationLabel || null,
    });
    saveLocalCart(items);
    return items;
  },

  async updateQuantity(
    itemId: string,
    quantity: number,
    token?: string | null
  ): Promise<CartItem[]> {
    if (token && !itemId.startsWith('local-')) {
      try {
        const res = await apiRequest<{ data: ApiCartRow[] }>(`/customer/cart/${itemId}`, {
          method: 'PATCH',
          token,
          body: { quantity },
        });
        const items = res.data.map(mapApiRow);
        saveLocalCart(items);
        return items;
      } catch {
        // fall through
      }
    }

    const items = loadLocalCart().map((i) => (i.id === itemId ? { ...i, quantity } : i));
    saveLocalCart(items);
    return items;
  },

  async removeItem(itemId: string, token?: string | null): Promise<CartItem[]> {
    if (token && !itemId.startsWith('local-')) {
      try {
        await apiRequest(`/customer/cart/${itemId}`, { method: 'DELETE', token });
        const { items } = await this.getCart(token);
        return items;
      } catch {
        // fall through
      }
    }

    const items = loadLocalCart().filter((i) => i.id !== itemId);
    saveLocalCart(items);
    return items;
  },

  clearLocal(): void {
    clearLocalCart();
  },

  calcTotals,
  fetchCheckoutFees,
};
