'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CartTotals } from '@/features/cart/types';
import { Skeleton } from '@/components/ui/skeleton';

interface CartSummaryProps {
  totals: CartTotals;
  isLoading?: boolean;
  checkoutHref?: string;
}

export function CartSummary({
  totals,
  isLoading,
  checkoutHref = '/checkout',
}: CartSummaryProps) {
  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items ({totals.itemCount})</span>
          <span>₹{totals.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery fee</span>
          <span>
            {totals.deliveryFee > 0 ? `₹${totals.deliveryFee.toLocaleString()}` : 'Free'}
          </span>
        </div>
        {totals.platformFee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform fee</span>
            <span>₹{totals.platformFee.toLocaleString()}</span>
          </div>
        )}
        <div className="border-t border-border pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">₹{totals.total.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Fees apply per vendor when cart has multiple shops.
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={totals.itemCount === 0}>
          <Link href={checkoutHref}>Proceed to checkout</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
