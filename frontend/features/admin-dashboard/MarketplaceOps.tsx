'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { apiRequest } from '@/lib/api';

export function OrderMonitoring() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<
    Array<{ id: string; number: string; status: string; total: number; vendor: string; customer: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: Array<{
          id: number;
          order_number: string;
          order_status: string;
          total_amount: number;
          business_name: string;
          customer_name: string;
        }>;
      }>('/admin/orders', { token });
      setOrders(
        (res.data || []).map((o) => ({
          id: String(o.id),
          number: o.order_number,
          status: o.order_status,
          total: Number(o.total_amount ?? 0),
          vendor: o.business_name,
          customer: o.customer_name,
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

  return (
    <section id="orders" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" />
            Orders
          </CardTitle>
          <p className="text-sm text-muted-foreground">Monitor marketplace orders across all vendors</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 12).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-1 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{order.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer} · {order.vendor}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {order.status}
                    </Badge>
                    <span className="text-sm font-semibold">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export function ReviewModeration() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<
    Array<{
      id: string;
      userName: string;
      businessName: string;
      rating: number;
      comment: string;
      status: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: Array<{
          id: number;
          user_name: string;
          business_name: string;
          rating: number;
          comment?: string;
          status: string;
        }>;
      }>('/admin/reviews?status=pending', { token });
      setReviews(
        (res.data || []).map((r) => ({
          id: String(r.id),
          userName: r.user_name,
          businessName: r.business_name,
          rating: Number(r.rating),
          comment: r.comment || '',
          status: r.status,
        }))
      );
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function moderate(id: string, status: 'approved' | 'rejected') {
    setBusyId(id);
    try {
      await apiRequest(`/admin/reviews/${id}/moderate`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: `Review ${status}`, variant: 'success' });
    } catch (err) {
      toast({
        title: 'Moderation failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section id="reviews" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="size-5 text-primary" />
            Reviews
          </CardTitle>
          <p className="text-sm text-muted-foreground">Approve or reject customer reviews</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending reviews.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{review.userName}</p>
                    <span className="text-sm">★ {review.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.businessName}</p>
                  <p className="mt-2 text-sm">{review.comment}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      disabled={busyId === review.id}
                      onClick={() => void moderate(review.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === review.id}
                      onClick={() => void moderate(review.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
