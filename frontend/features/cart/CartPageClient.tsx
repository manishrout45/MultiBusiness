'use client';

import { useCart } from '@/hooks/useCart';
import { CartList } from '@/features/cart/CartList';
import { CartSummary } from '@/features/cart/CartSummary';
import { EmptyCart } from '@/features/cart/EmptyCart';

export function CartPageClient() {
  const { items, totals, isLoading, isUpdating, updateQuantity, removeItem } = useCart();

  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shopping cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review items from local vendors before checkout.
        </p>
      </div>

      {!isLoading && items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <CartList
            items={items}
            isLoading={isLoading}
            isUpdating={isUpdating}
            onQuantityChange={(id, q) => void updateQuantity(id, q)}
            onRemove={(id) => void removeItem(id)}
          />
          <CartSummary totals={totals} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
