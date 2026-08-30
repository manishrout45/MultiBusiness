'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">Your cart is empty</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Browse local businesses and add products you love. Your cart saves automatically.
      </p>
      <Button asChild className="mt-6">
        <Link href="/businesses">Explore businesses</Link>
      </Button>
    </div>
  );
}
