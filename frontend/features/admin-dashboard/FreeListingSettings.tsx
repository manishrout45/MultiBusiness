'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { apiRequest } from '@/lib/api';

interface FreeListingStatus {
  quota: number;
  used: number;
  spotsLeft: number;
  available: boolean;
}

export function FreeListingSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [quota, setQuota] = useState('20');
  const [status, setStatus] = useState<FreeListingStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [settingsRes, freeRes] = await Promise.all([
        apiRequest<{ data: Array<{ setting_key: string; setting_value: string }> }>(
          '/admin/settings',
          { token }
        ),
        apiRequest<{ data: FreeListingStatus }>('/free-listing'),
      ]);
      const row = (settingsRes.data || []).find((s) => s.setting_key === 'free_listing_quota');
      if (row) setQuota(String(row.setting_value));
      setStatus(freeRes.data);
    } catch (err) {
      toast({
        title: 'Could not load free listing settings',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!token) return;
    const n = Math.max(0, Math.floor(Number(quota) || 0));
    setPending(true);
    try {
      await apiRequest('/admin/settings', {
        method: 'PATCH',
        token,
        body: { free_listing_quota: String(n) },
      });
      setQuota(String(n));
      toast({ title: 'Quota updated', description: `Free listing spots set to ${n}`, variant: 'success' });
      await load();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Free vendor listing spots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          First vendors can take the Free plan until this quota is used. Change the number anytime
          (15, 20, 50…).
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">Quota</p>
              <p className="text-xl font-bold tabular-nums">{status?.quota ?? '—'}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">Used</p>
              <p className="text-xl font-bold tabular-nums">{status?.used ?? '—'}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">Spots left</p>
              <p className="text-xl font-bold tabular-nums text-primary">{status?.spotsLeft ?? '—'}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:w-40">
            <Label htmlFor="free-quota">Free spots (N)</Label>
            <Input
              id="free-quota"
              type="number"
              min={0}
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
            />
          </div>
          <Button onClick={() => void save()} disabled={pending}>
            {pending ? 'Saving…' : 'Save quota'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
