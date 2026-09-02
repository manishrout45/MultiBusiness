'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Package, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import {
  dashboardService,
  type PendingVendor,
  type VendorDetails,
  type VendorProduct,
} from '@/services/dashboardService';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'approved' | 'suspended' | 'rejected';

export function VendorManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<VendorDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [productBusyId, setProductBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    const status = filter === 'all' ? undefined : filter === 'pending' ? undefined : filter;
    const data = await dashboardService.listAllVendors(token, status);
    const filtered =
      filter === 'pending'
        ? data.filter((v) => v.status === 'pending' || v.status === 'recommended')
        : filter === 'all'
          ? data
          : data.filter((v) => v.status === filter);
    setVendors(filtered);
    setIsLoading(false);
  }, [token, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openVendor(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetails(null);
      return;
    }
    setExpandedId(id);
    setDetailsLoading(true);
    const data = await dashboardService.getVendorDetails(id, token);
    setDetails(data);
    setDetailsLoading(false);
  }

  async function approve(id: string) {
    setBusyId(id);
    try {
      await dashboardService.approveVendor(id, token);
      toast({ title: 'Vendor approved', description: 'Dashboard access unlocked.', variant: 'success' });
      await load();
      if (expandedId === id) {
        const data = await dashboardService.getVendorDetails(id, token);
        setDetails(data);
      }
    } catch (err) {
      toast({
        title: 'Approve failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmReject() {
    if (!rejectId) return;
    setBusyId(rejectId);
    try {
      await dashboardService.rejectVendor(
        rejectId,
        rejectReason.trim() || 'Application rejected',
        token
      );
      toast({ title: 'Vendor rejected', variant: 'success' });
      setRejectId(null);
      setRejectReason('');
      if (expandedId === rejectId) {
        setExpandedId(null);
        setDetails(null);
      }
      await load();
    } catch (err) {
      toast({
        title: 'Reject failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  }

  async function verify(id: string) {
    setBusyId(id);
    try {
      await dashboardService.verifyVendor(id, token);
      toast({ title: 'Documents verified', variant: 'success' });
      await load();
    } catch (err) {
      toast({
        title: 'Verify failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  }

  async function updateProductStatus(productId: string, status: string) {
    setProductBusyId(productId);
    try {
      await dashboardService.updateProductStatus(productId, status, token);
      toast({ title: `Product ${status}`, variant: 'success' });
      if (expandedId) {
        const data = await dashboardService.getVendorDetails(expandedId, token);
        setDetails(data);
      }
      await load();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setProductBusyId(null);
    }
  }

  async function removeProduct(productId: string) {
    setProductBusyId(productId);
    try {
      await dashboardService.removeProduct(productId, token);
      toast({ title: 'Product removed', variant: 'success' });
      if (expandedId) {
        const data = await dashboardService.getVendorDetails(expandedId, token);
        setDetails(data);
      }
      await load();
    } catch (err) {
      toast({
        title: 'Remove failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setProductBusyId(null);
    }
  }

  const filters: Array<{ id: StatusFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'rejected', label: 'Rejected' },
  ];

  return (
    <>
      <Card id="vendors" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">Vendors</CardTitle>
          <p className="text-sm text-muted-foreground">
            Browse every seller, review their profile, and manage products or services under each vendor.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={filter === f.id ? 'default' : 'outline'}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : vendors.length === 0 ? (
            <EmptyState
              title="No vendors found"
              description="Vendor registrations will appear here."
              icon={<Store className="size-8" />}
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <div className="space-y-3">
              {vendors.map((v) => {
                const open = expandedId === v.id;
                return (
                  <div key={v.id} className="overflow-hidden rounded-xl border border-border">
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/40"
                      onClick={() => void openVendor(v.id)}
                    >
                      <span className="mt-1 text-muted-foreground">
                        {open ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{v.businessName}</p>
                          <Badge variant="outline" className="capitalize">
                            {v.status}
                          </Badge>
                          {v.documentsVerified && (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              Docs verified
                            </Badge>
                          )}
                          {(v.pendingProductCount ?? 0) > 0 && (
                            <Badge variant="secondary">
                              {v.pendingProductCount} pending items
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {v.ownerName} · {v.ownerEmail}
                          {v.ownerPhone ? ` · ${v.ownerPhone}` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {v.categoryName ? `${v.categoryName} · ` : ''}
                          {v.city || 'Location pending'}
                          {' · '}
                          {v.productCount ?? 0} products/services
                          {(v.publishedProductCount ?? 0) > 0
                            ? ` (${v.publishedProductCount} live)`
                            : ''}
                        </p>
                      </div>
                    </button>

                    {open && (
                      <div className="border-t bg-muted/20 px-4 py-4">
                        {detailsLoading || !details || details.id !== v.id ? (
                          <Skeleton className="h-28 w-full rounded-xl" />
                        ) : (
                          <VendorExpandedPanel
                            vendor={details}
                            busyId={busyId}
                            productBusyId={productBusyId}
                            onApprove={() => void approve(v.id)}
                            onReject={() => {
                              setRejectId(v.id);
                              setRejectReason('');
                            }}
                            onVerify={() => void verify(v.id)}
                            onProductStatus={updateProductStatus}
                            onRemoveProduct={removeProduct}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(rejectId)} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject vendor application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="reject-reason">Reason for rejection</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this application was rejected…"
            />
            <Button
              className="w-full"
              variant="destructive"
              disabled={busyId === rejectId}
              onClick={() => void confirmReject()}
            >
              Confirm rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function VendorExpandedPanel({
  vendor,
  busyId,
  productBusyId,
  onApprove,
  onReject,
  onVerify,
  onProductStatus,
  onRemoveProduct,
}: {
  vendor: VendorDetails;
  busyId: string | null;
  productBusyId: string | null;
  onApprove: () => void;
  onReject: () => void;
  onVerify: () => void;
  onProductStatus: (id: string, status: string) => void;
  onRemoveProduct: (id: string) => void;
}) {
  const canReview = vendor.status === 'pending' || vendor.status === 'recommended';

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Owner" value={vendor.ownerName} />
        <Detail label="Email" value={vendor.ownerEmail} />
        <Detail label="Phone" value={vendor.ownerPhone || '—'} />
        <Detail label="Category" value={vendor.categoryName || '—'} />
        <Detail label="City" value={vendor.city || '—'} />
        <Detail label="Address" value={vendor.address || '—'} />
        <Detail label="Status" value={vendor.status} className="capitalize" />
        <Detail
          label="Joined"
          value={new Date(vendor.createdAt).toLocaleDateString()}
        />
      </div>
      {vendor.description && (
        <p className="text-sm text-muted-foreground">{vendor.description}</p>
      )}

      {canReview && (
        <div className="flex flex-wrap gap-2">
          {!vendor.documentsVerified && (
            <Button
              size="sm"
              variant="outline"
              disabled={busyId === vendor.id}
              onClick={onVerify}
            >
              Verify docs
            </Button>
          )}
          <Button size="sm" disabled={busyId === vendor.id} onClick={onApprove}>
            Approve vendor
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busyId === vendor.id}
            onClick={onReject}
          >
            Reject
          </Button>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Package className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Products & services</h3>
          <Badge variant="outline">{vendor.products.length}</Badge>
        </div>
        {vendor.products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This vendor has not listed any products or services yet.
          </p>
        ) : (
          <div className="space-y-3">
            {vendor.products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                busy={productBusyId === product.id}
                onStatus={onProductStatus}
                onRemove={onRemoveProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  busy,
  onStatus,
  onRemove,
}: {
  product: VendorProduct;
  busy: boolean;
  onStatus: (id: string, status: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{product.name}</p>
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              product.status === 'published' && 'border-emerald-300 text-emerald-700',
              product.status === 'pending' && 'border-amber-300 text-amber-700',
              product.status === 'rejected' && 'border-red-300 text-red-700'
            )}
          >
            {product.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          ₹{product.price.toLocaleString()} · Stock {product.stock}
        </p>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {product.status !== 'published' && (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => onStatus(product.id, 'published')}
          >
            Approve
          </Button>
        )}
        {product.status === 'pending' && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onStatus(product.id, 'rejected')}
          >
            Reject
          </Button>
        )}
        {product.status === 'published' && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onStatus(product.id, 'rejected')}
          >
            Unpublish
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          disabled={busy}
          onClick={() => onRemove(product.id)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('text-sm font-medium', className)}>{value}</p>
    </div>
  );
}
