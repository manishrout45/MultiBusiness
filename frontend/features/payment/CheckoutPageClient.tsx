'use client';

import { useCart } from '@/hooks/useCart';
import { CheckoutForm } from '@/features/payment/CheckoutForm';
import { EmptyCart } from '@/features/cart/EmptyCart';
import { RequireAuth } from '@/features/auth/RequireRole';

function CheckoutContent() {
  const { items, isLoading } = useCart();

  if (!isLoading && items.length === 0) {
    return (
      <div className="container py-8 sm:py-10">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter delivery details and choose how you want to pay.
        </p>
      </div>
      <CheckoutForm />
    </div>
  );
}

export function CheckoutPageClient() {
  return (
    <RequireAuth fallbackHref="/login">
      <CheckoutContent />
    </RequireAuth>
  );
}
