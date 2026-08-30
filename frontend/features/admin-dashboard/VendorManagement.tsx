'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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
import { dashboardService, type PendingVendor } from '@/services/dashboardService';
import { EmptyState } from '@/components/EmptyState';
import { Store } from 'lucide-react';

export function VendorManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewVendor, setViewVendor] = useState<PendingVendor | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await dashboardService.listPendingVendors(token);
    setVendors(data);
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: string) {
    setBusyId(id);
    try {
      await dashboardService.approveVendor(id, token);
      setVendors((prev) => prev.filter((v) => v.id !== id));
      toast({ title: 'Vendor approved', description: 'Dashboard access unlocked.', variant: 'success' });
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
      await dashboardService.rejectVendor(rejectId, rejectReason.trim() || 'Application rejected', token);
      setVendors((prev) => prev.filter((v) => v.id !== rejectId));
      toast({ title: 'Vendor rejected', variant: 'success' });
      setRejectId(null);
      setRejectReason('');
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
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, documentsVerified: true } : v))
      );
      toast({ title: 'Documents verified', variant: 'success' });
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

  return (
    <>
      <Card id="vendors" className="scroll-mt-24">
        <CardHeader>
          <CardTitle className="text-base">Vendor requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review pending seller applications. Approved vendors can manage products and orders.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : vendors.length === 0 ? (
            <EmptyState
              title="No pending vendors"
              description="New vendor registrations will appear here for review."
              icon={<Store className="size-8" />}
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <div className="space-y-4">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
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
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Owner: {v.ownerName} · {v.ownerEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {v.categoryName ? `${v.categoryName} · ` : ''}
                      {v.city || 'Location pending'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setViewVendor(v)}
                    >
                      <Eye className="size-4" />
                      View details
                    </Button>
                    {!v.documentsVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === v.id}
                        onClick={() => void verify(v.id)}
                      >
                        Verify docs
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={busyId === v.id}
                      onClick={() => void approve(v.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === v.id}
                      onClick={() => {
                        setRejectId(v.id);
                        setRejectReason('');
                      }}
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

      <Dialog open={Boolean(viewVendor)} onOpenChange={(open) => !open && setViewVendor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewVendor?.businessName}</DialogTitle>
          </DialogHeader>
          {viewVendor && (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="font-medium">{viewVendor.ownerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{viewVendor.ownerEmail}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Category</dt>
                <dd>{viewVendor.categoryName || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Location</dt>
                <dd>{viewVendor.city || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="capitalize">{viewVendor.status}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
