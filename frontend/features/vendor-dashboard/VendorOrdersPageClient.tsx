'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { apiRequest } from '@/lib/api';
import { RequireAuth, RequireRole } from '@/features/auth/RequireRole';
import { VendorApprovalGate } from '@/components/vendor/VendorApprovalGate';

interface VendorOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  customerName?: string;
  createdAt: string;
}

const STATUS_FLOW: Record<string, { next: string; label: string } | null> = {
  placed: { next: 'accepted', label: 'Accept order' },
  pending: { next: 'accepted', label: 'Accept order' },
  accepted: { next: 'packed', label: 'Mark packed' },
  packed: { next: 'shipped', label: 'Mark shipped' },
  shipped: { next: 'delivered', label: 'Mark delivered' },
  delivered: null,
  cancelled: null,
};

function VendorOrdersContent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: Array<{
          id: number;
          order_number: string;
          order_status?: string;
          status?: string;
          total_amount?: number;
          customer_name?: string;
          created_at: string;
        }>;
      }>('/vendor/orders', { token });
      setOrders(
        (res.data || []).map((o) => ({
          id: String(o.id),
          orderNumber: o.order_number,
          status: o.order_status || o.status || 'placed',
          total: Number(o.total_amount ?? 0),
          customerName: o.customer_name,
          createdAt: o.created_at,
        }))
      );
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await apiRequest(`/vendor/orders/${id}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast({ title: 'Order updated', description: `Status: ${status}`, variant: 'success' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="When customers place orders for your products, they will appear here."
        icon={<Package className="size-8" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const action = STATUS_FLOW[order.status] ?? STATUS_FLOW.placed;
        return (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{order.orderNumber}</p>
                <Badge variant="outline" className="capitalize">
                  {order.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.customerName || 'Customer'} · ₹{order.total.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {action && (
                <Button
                  size="sm"
                  disabled={busyId === order.id}
                  onClick={() => void updateStatus(order.id, action.next)}
                >
                  {action.label}
                </Button>
              )}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === order.id}
                  onClick={() => void updateStatus(order.id, 'cancelled')}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VendorOrdersPageClient() {
  return (
    <RequireAuth fallbackHref="/login">
      <RequireRole roles={['vendor']} fallbackHref="/">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Accept orders and update fulfillment status for your customers.
            </p>
          </div>
          <VendorApprovalGate>
            <VendorOrdersContent />
          </VendorApprovalGate>
          <p className="text-sm text-muted-foreground">
            Need analytics?{' '}
            <Link href="/vendor/dashboard#orders" className="font-medium text-primary hover:underline">
              View dashboard overview
            </Link>
          </p>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
