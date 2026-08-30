'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import {
  commissionService,
  type CommissionSetting,
  type CommissionEarningRow,
} from '@/services/commissionService';

export function CommissionTable() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [earnings, setEarnings] = useState<CommissionEarningRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const [s, e] = await Promise.all([
        commissionService.listSettings(token),
        commissionService.getEarningsReport(token),
      ]);
      if (!cancelled) {
        setSettings(s);
        setEarnings(e);
        setDrafts(Object.fromEntries(s.map((row) => [row.id, String(row.rate)])));
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function saveRate(id: string) {
    const rate = Number(drafts[id]);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      toast({ title: 'Invalid rate', description: 'Enter 0–100.', variant: 'error' });
      return;
    }
    setSavingId(id);
    try {
      await commissionService.updateRate(id, rate, token);
      setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, rate } : s)));
      toast({ title: 'Commission updated', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) return <Skeleton className="h-72 w-full rounded-2xl" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configure commission %</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Scope</th>
                <th className="pb-2 font-medium">Category / Vendor</th>
                <th className="pb-2 font-medium">Rate %</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3">{row.scope}</td>
                  <td className="py-3 text-muted-foreground">
                    {row.businessName || row.categoryName || 'All businesses'}
                  </td>
                  <td className="py-3">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-24"
                      value={drafts[row.id] ?? ''}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [row.id]: e.target.value }))
                      }
                    />
                  </td>
                  <td className="py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingId === row.id}
                      onClick={() => void saveRate(row.id)}
                    >
                      {savingId === row.id ? 'Saving…' : 'Save'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor commission reports</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Vendor</th>
                <th className="pb-2 font-medium">Orders</th>
                <th className="pb-2 font-medium">Gross sales</th>
                <th className="pb-2 font-medium">Commission</th>
                <th className="pb-2 font-medium">Vendor payout</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-medium">{row.vendorName}</td>
                  <td className="py-3">{row.orderCount}</td>
                  <td className="py-3">₹{row.grossSales.toLocaleString()}</td>
                  <td className="py-3 text-primary">₹{row.commissionAmount.toLocaleString()}</td>
                  <td className="py-3">₹{row.vendorPayout.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
