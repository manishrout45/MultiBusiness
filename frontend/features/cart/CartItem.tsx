'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from '@/features/cart/QuantitySelector';
import type { CartItem as CartItemType } from '@/features/cart/types';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function CartItem({ item, onQuantityChange, onRemove, disabled }: CartItemProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="flex gap-3 rounded-xl border border-border bg-card p-3 sm:gap-4 sm:p-4"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
        <Image src={item.image} alt={item.productName} fill className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{item.productName}</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">{item.vendorName}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${item.productName}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantitySelector
            quantity={item.quantity}
            onChange={onQuantityChange}
            disabled={disabled}
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">₹{lineTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString()} each</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
