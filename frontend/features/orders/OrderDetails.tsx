'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/features/orders/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/OrderTimeline';
import type { Order } from '@/services/orderService';

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const date = new Date(order.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const reviewHref = order.vendor.slug
    ? `/business/${order.vendor.slug}/reviews`
    : `/business/${order.vendor.id}/reviews`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{order.orderNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
            </div>
            <OrderStatusBadge status={order.status} />
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Order date</p>
                <p className="font-medium">{date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment status</p>
                <p className="font-medium capitalize">{order.paymentStatus}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment method</p>
                <p className="font-medium capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p className="font-medium">{order.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Delivery address</p>
              <p className="font-medium">{order.shippingAddress}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Products</CardTitle>
          </CardHeader>
          <CardContent>
            {order.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Loading line items…</p>
            ) : (
              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 font-semibold">₹{item.totalPrice.toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
              <span>Total</span>
              <span className="text-primary">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendor</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{order.vendor.name}</p>
            {order.vendor.city && <p className="text-muted-foreground">{order.vendor.city}</p>}
            {order.vendor.phone && (
              <p className="mt-2 text-muted-foreground">{order.vendor.phone}</p>
            )}
            {order.status === 'delivered' && (
              <Button asChild className="mt-4 w-full" size="sm">
                <Link href={reviewHref}>Write a review</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Track order</CardTitle>
          </CardHeader>
          <CardContent>
            {order.trackingNumber && (
              <p className="mb-4 text-xs text-muted-foreground">
                Tracking: <span className="font-mono">{order.trackingNumber}</span>
              </p>
            )}
            <OrderTimeline status={order.status} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
