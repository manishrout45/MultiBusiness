import type { CartItem } from '@/features/cart/types';
import { apiRequest } from '@/lib/api';
import { clearLocalCart, loadLocalCart, saveLocalCart } from '@/features/cart/storage';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop';

interface ApiCartRow {
  id: number;
  product_id: number;
  business_id?: number;
  quantity: number;
  name: string;
  price: number;
  sale_price?: number | null;
  business_name: string;
  image_url?: string | null;
}

function mapApiRow(row: ApiCartRow): CartItem {
  const price = row.sale_price != null ? Number(row.sale_price) : Number(row.price);
  return {
    id: String(row.id),
    productId: String(row.product_id),
    vendorId: row.business_id != null ? String(row.business_id) : 'unknown',
    vendorName: row.business_name,
    productName: row.name,
    image: row.image_url || PLACEHOLDER_IMAGE,
    price,
    quantity: Number(row.quantity),
  };
}

function calcTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function mergeLocalItem(items: CartItem[], incoming: Omit<CartItem, 'id'>): CartItem[] {
  const existing = items.find((i) => i.productId === incoming.productId);
  if (existing) {
    return items.map((i) =>
      i.productId === incoming.productId
        ? { ...i, quantity: i.quantity + incoming.quantity }
        : i
    );
  }
  return [...items, { ...incoming, id: `local-${incoming.productId}-${Date.now()}` }];
}

export const cartService = {
  async getCart(token?: string | null): Promise<{ items: CartItem[]; total: number }> {
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
    },
    token?: string | null
  ): Promise<CartItem[]> {
    const quantity = payload.quantity ?? 1;

    if (token) {
      try {
        const res = await apiRequest<{ data: ApiCartRow[] }>('/customer/cart', {
          method: 'POST',
          token,
          body: { productId: Number(payload.productId), quantity },
        });
        const items = res.data.map(mapApiRow);
        saveLocalCart(items);
        return items;
      } catch {
        // fall through to local
      }
    }

    const items = mergeLocalItem(loadLocalCart(), {
      productId: payload.productId,
      vendorId: payload.vendorId,
      vendorName: payload.vendorName,
      productName: payload.productName,
      image: payload.image,
      price: payload.price,
      quantity,
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
};
