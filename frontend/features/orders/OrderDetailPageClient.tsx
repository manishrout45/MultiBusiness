'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderDetails } from '@/features/orders/OrderDetails';
import { useOrder } from '@/hooks/useOrders';

export function OrderDetailPageClient({ orderId }: { orderId: string }) {
  const { order, isLoading, error } = useOrder(orderId);

  return (
    <div className="container py-8 sm:py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/orders">
          <ArrowLeft className="mr-1 size-4" />
          All orders
        </Link>
      </Button>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : error || !order ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-muted-foreground">{error ?? 'Order not found'}</p>
          <Button asChild className="mt-4">
            <Link href="/orders">View orders</Link>
          </Button>
        </div>
      ) : (
        <OrderDetails order={order} />
      )}
    </div>
  );
}
