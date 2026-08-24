'use client';

import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderCard } from '@/features/orders/OrderCard';
import { useOrders } from '@/hooks/useOrders';
import { RequireAuth } from '@/features/auth/RequireRole';

function OrdersContent() {
  const { orders, isLoading, error } = useOrders();

  return (
    <div className="container py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track purchases from local businesses.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/cart">Back to cart</Link>
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <PackageOpen className="mb-4 size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start shopping to see your order history.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrdersPageClient() {
  return (
    <RequireAuth fallbackHref="/login">
      <OrdersContent />
    </RequireAuth>
  );
}
