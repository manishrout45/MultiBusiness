'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CartTotals } from '@/features/cart/types';

interface PaymentSummaryProps {
  totals: CartTotals;
  paymentMethodLabel?: string;
}

export function PaymentSummary({ totals, paymentMethodLabel }: PaymentSummaryProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Payment summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{totals.subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery</span>
          <span className="text-emerald-600">Free</span>
        </div>
        {paymentMethodLabel && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span>{paymentMethodLabel}</span>
          </div>
        )}
        <div className="border-t border-border pt-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total due</span>
            <span className="text-primary">₹{totals.total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
