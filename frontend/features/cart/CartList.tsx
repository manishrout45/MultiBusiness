'use client';

import { AnimatePresence } from 'framer-motion';
import { CartItem } from '@/features/cart/CartItem';
import type { CartItem as CartItemType } from '@/features/cart/types';
import { Skeleton } from '@/components/ui/skeleton';

interface CartListProps {
  items: CartItemType[];
  isLoading?: boolean;
  isUpdating?: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartList({
  items,
  isLoading,
  isUpdating,
  onQuantityChange,
  onRemove,
}: CartListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const byVendor = items.reduce<Record<string, CartItemType[]>>((acc, item) => {
    const key = item.vendorId;
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(byVendor).map(([vendorId, vendorItems]) => (
        <section key={vendorId}>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            {vendorItems[0]?.vendorName}
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {vendorItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  disabled={isUpdating}
                  onQuantityChange={(q) => onQuantityChange(item.id, q)}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}
