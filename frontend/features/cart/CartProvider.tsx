'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartItem, CartTotals } from '@/features/cart/types';
import { useAuth } from '@/features/auth';
import { cartService } from '@/services/cartService';

interface AddToCartInput {
  productId: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  image: string;
  price: number;
  quantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  isLoading: boolean;
  isUpdating: boolean;
  refresh: () => Promise<void>;
  addItem: (input: AddToCartInput) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { items: next } = await cartService.getCart(token);
      setItems(next);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      setIsUpdating(true);
      try {
        const next = await cartService.addItem(input, token);
        setItems(next);
      } finally {
        setIsUpdating(false);
      }
    },
    [token]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      setIsUpdating(true);
      try {
        const next = await cartService.updateQuantity(itemId, quantity, token);
        setItems(next);
      } finally {
        setIsUpdating(false);
      }
    },
    [token]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setIsUpdating(true);
      try {
        const next = await cartService.removeItem(itemId, token);
        setItems(next);
      } finally {
        setIsUpdating(false);
      }
    },
    [token]
  );

  const clearCart = useCallback(() => {
    cartService.clearLocal();
    setItems([]);
  }, []);

  const totals = useMemo(() => cartService.calcTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      totals,
      isLoading,
      isUpdating,
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, totals, isLoading, isUpdating, refresh, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}
