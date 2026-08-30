'use client';

import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/features/orders/OrderStatusBadge';
import type { Order } from '@/services/orderService';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-base font-semibold">{order.orderNumber}</CardTitle>
          <p className="text-xs text-muted-foreground">Placed on {date}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Store className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{order.vendor.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {order.items.length
              ? `${order.items.length} item(s)`
              : 'View details for items'}
          </span>
          <span className="font-semibold text-primary">₹{order.totalAmount.toLocaleString()}</span>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href={`/orders/${order.id}`}>
            View details
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
