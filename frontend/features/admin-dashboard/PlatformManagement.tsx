'use client';

import { useCallback, useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { dashboardService } from '@/services/dashboardService';
import { apiRequest } from '@/lib/api';

type AdminProduct = {
  id: string;
  name: string;
  businessName: string;
  price: number;
  status: string;
  stock: number;
};

export function ProductModeration() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<AdminProduct[]>([]);
  const [live, setLive] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [pendingRows, liveRows] = await Promise.all([
      dashboardService.listAdminProducts(token, 'pending'),
      dashboardService.listAdminProducts(token, 'published'),
    ]);
    setPending(pendingRows);
    setLive(liveRows.slice(0, 20));
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await dashboardService.updateProductStatus(id, status, token);
      setPending((prev) => prev.filter((p) => p.id !== id));
      toast({ title: `Product ${status}`, variant: 'success' });
      void load();
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

  async function removeProduct(id: string) {
    setBusyId(id);
    try {
      await dashboardService.removeProduct(id, token);
      setPending((prev) => prev.filter((p) => p.id !== id));
      setLive((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Product removed', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Remove failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section id="products" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            Product moderation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review pending product listings before they appear on the marketplace.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : (
            <>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Pending approval</h3>
                {pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending products to review.</p>
                ) : (
                  <div className="space-y-3">
                    {pending.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{product.name}</p>
                            <Badge variant="outline" className="capitalize">
                              {product.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.businessName} · ₹{product.price.toLocaleString()} · Stock{' '}
                            {product.stock}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            disabled={busyId === product.id}
                            onClick={() => void updateStatus(product.id, 'published')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === product.id}
                            onClick={() => void updateStatus(product.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === product.id}
                            onClick={() => void removeProduct(product.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Live products</h3>
                {live.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published products yet.</p>
                ) : (
                  <div className="space-y-3">
                    {live.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.businessName} · ₹{product.price.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === product.id}
                          onClick={() => void removeProduct(product.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export function AnnouncementsManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<
    Array<{ id: string; title: string; description: string; active: boolean }>
  >([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: Array<{
          id: number;
          title: string;
          description?: string;
          is_active?: number | boolean;
        }>;
      }>('/admin/announcements', { token });
      setItems(
        (res.data || []).map((row) => ({
          id: String(row.id),
          title: row.title,
          description: row.description || '',
          active: Boolean(row.is_active),
        }))
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiRequest('/admin/announcements', {
        method: 'POST',
        token,
        body: { title: title.trim(), description: description.trim() || null, isActive: true },
      });
      setTitle('');
      setDescription('');
      toast({ title: 'Announcement created', variant: 'success' });
      void load();
    } catch (err) {
      toast({
        title: 'Could not create announcement',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      await apiRequest(`/admin/announcements/${id}`, {
        method: 'PATCH',
        token,
        body: { isActive: !active },
      });
      void load();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    }
  }

  return (
    <section id="announcements" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <p className="text-sm text-muted-foreground">Platform-wide notices for customers and sellers</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={createAnnouncement} className="space-y-3 rounded-xl border p-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekend marketplace update"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-body">Message</Label>
              <Textarea
                id="announcement-body"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Share platform news with vendors and customers"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Publishing…' : 'Create announcement'}
            </Button>
          </form>

          {loading ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active announcements.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void toggleActive(item.id, item.active)}
                  >
                    {item.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export function OffersManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<
    Array<{
      id: string;
      title: string;
      status: string;
      adType: string;
      imageUrl?: string;
      linkUrl?: string;
    }>
  >([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiRequest<{
        data: Array<{
          id: number;
          title: string;
          status: string;
          ad_type: string;
          image_path?: string;
          link_url?: string;
        }>;
      }>('/admin/offers', { token });
      setItems(
        (res.data || []).map((row) => ({
          id: String(row.id),
          title: row.title,
          status: row.status,
          adType: row.ad_type,
          imageUrl: row.image_path || '',
          linkUrl: row.link_url || '',
        }))
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiRequest('/admin/offers', {
        method: 'POST',
        token,
        body: {
          title: title.trim(),
          adType: 'homepage_banner',
          status: 'active',
          imagePath: imageUrl.trim() || null,
          linkUrl: linkUrl.trim() || null,
        },
      });
      setTitle('');
      setImageUrl('');
      setLinkUrl('');
      toast({ title: 'Homepage banner created', variant: 'success' });
      void load();
    } catch (err) {
      toast({
        title: 'Could not create banner',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: string) {
    try {
      await apiRequest(`/admin/offers/${id}`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      void load();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    }
  }

  async function updateBanner(id: string, patch: { imageUrl?: string; linkUrl?: string }) {
    try {
      await apiRequest(`/admin/offers/${id}`, {
        method: 'PATCH',
        token,
        body: {
          imagePath: patch.imageUrl,
          linkUrl: patch.linkUrl,
        },
      });
      void load();
      toast({ title: 'Banner updated', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    }
  }

  return (
    <section id="offers" className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle>Homepage banners</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage hero banners shown on the home page. Active homepage banners rotate automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={createOffer} className="space-y-3 rounded-xl border p-4">
            <div className="space-y-2">
              <Label htmlFor="offer-title">Banner title</Label>
              <Input
                id="offer-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Festive sale up to 20% off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-image">Image URL</Label>
              <Input
                id="offer-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-link">Link URL</Label>
              <Input
                id="offer-link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/categories or /products"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add homepage banner'}
            </Button>
          </form>

          {loading ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No homepage banners yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="space-y-3 rounded-xl border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.adType.replace(/_/g, ' ')} · {item.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {item.status !== 'active' && (
                        <Button size="sm" onClick={() => void setStatus(item.id, 'active')}>
                          Activate
                        </Button>
                      )}
                      {item.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void setStatus(item.id, 'expired')}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      defaultValue={item.imageUrl}
                      placeholder="Image URL"
                      onBlur={(e) => {
                        if (e.target.value !== item.imageUrl) {
                          void updateBanner(item.id, { imageUrl: e.target.value });
                        }
                      }}
                    />
                    <Input
                      defaultValue={item.linkUrl}
                      placeholder="Link URL"
                      onBlur={(e) => {
                        if (e.target.value !== item.linkUrl) {
                          void updateBanner(item.id, { linkUrl: e.target.value });
                        }
                      }}
                    />
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

export function ReportsManagement() {
  const { token } = useAuth();
  const [sales, setSales] = useState<
    Array<{ period: string; orders: number; amount: number; commission: number }>
  >([]);
  const [revenue, setRevenue] = useState<{
    totalRevenue: number;
    totalCommission: number;
    orderCount: number;
    byPeriod: Array<{
      period: string;
      total_revenue: number;
      total_commission: number;
      order_count: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [salesRes, revenueRes] = await Promise.all([
        apiRequest<{
          data: Array<{
            period: string;
            order_count: number;
            total_amount: number;
            commission_amount: number;
          }>;
        }>('/admin/reports/sales?period=day', { token }),
        apiRequest<{
          data: {
            totalRevenue: number;
            totalCommission: number;
            orderCount: number;
            byPeriod: Array<{
              period: string;
              total_revenue: number;
              total_commission: number;
              order_count: number;
            }>;
          };
        }>('/admin/reports/revenue', { token }),
      ]);
      setSales(
        (salesRes.data || []).slice(-14).map((row) => ({
          period: String(row.period).slice(0, 10),
          orders: Number(row.order_count) || 0,
          amount: Number(row.total_amount) || 0,
          commission: Number(row.commission_amount) || 0,
        }))
      );
      setRevenue(revenueRes.data);
    } catch {
      setSales([]);
      setRevenue(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section id="reports" className="scroll-mt-24 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sales & revenue reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track platform-wide sales performance and commission earnings from live order data.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : (
            <>
              <div className="grid gap-3 min-[375px]:grid-cols-3">
                <div className="rounded-xl border bg-card px-3 py-3">
                  <p className="text-xs text-muted-foreground">Total revenue</p>
                  <p className="text-xl font-bold tabular-nums">
                    ₹{(revenue?.totalRevenue ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border bg-card px-3 py-3">
                  <p className="text-xs text-muted-foreground">Total commissions</p>
                  <p className="text-xl font-bold tabular-nums">
                    ₹{(revenue?.totalCommission ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border bg-card px-3 py-3">
                  <p className="text-xs text-muted-foreground">Paid / delivered orders</p>
                  <p className="text-xl font-bold tabular-nums">{revenue?.orderCount ?? 0}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Daily sales (recent)</h3>
                {sales.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales data yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Orders</th>
                          <th className="px-3 py-2 font-medium">Sales</th>
                          <th className="px-3 py-2 font-medium">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((row) => (
                          <tr key={row.period} className="border-b last:border-0">
                            <td className="px-3 py-2">{row.period}</td>
                            <td className="px-3 py-2 tabular-nums">{row.orders}</td>
                            <td className="px-3 py-2 tabular-nums">₹{row.amount.toLocaleString()}</td>
                            <td className="px-3 py-2 tabular-nums">
                              ₹{row.commission.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">Monthly revenue</h3>
                {!revenue?.byPeriod?.length ? (
                  <p className="text-sm text-muted-foreground">No monthly revenue yet.</p>
                ) : (
                  <div className="space-y-2">
                    {revenue.byPeriod.map((row) => (
                      <div
                        key={row.period}
                        className="flex flex-col gap-1 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <p className="font-medium">{row.period}</p>
                        <p className="text-sm text-muted-foreground">
                          {Number(row.order_count)} orders · ₹
                          {Number(row.total_revenue).toLocaleString()} · commission ₹
                          {Number(row.total_commission).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
