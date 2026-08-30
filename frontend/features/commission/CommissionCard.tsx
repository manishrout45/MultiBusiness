'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth';
import {
  commissionService,
  type CommissionEarningRow,
  type VendorCommissionSummary,
} from '@/services/commissionService';

interface CommissionCardProps {
  mode: 'vendor' | 'admin';
}

export function CommissionCard({ mode }: CommissionCardProps) {
  const { token } = useAuth();
  const [vendor, setVendor] = useState<VendorCommissionSummary | null>(null);
  const [earnings, setEarnings] = useState<CommissionEarningRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      if (mode === 'vendor') {
        const data = await commissionService.getVendorCommission(token);
        if (!cancelled) setVendor(data);
      } else {
        const data = await commissionService.getEarningsReport(token);
        if (!cancelled) setEarnings(data);
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, token]);

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;

  if (mode === 'vendor' && vendor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commission & payouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 min-[375px]:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Rate</p>
              <p className="text-xl font-bold">{vendor.rate}%</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Deducted</p>
              <p className="text-xl font-bold">₹{vendor.commissionDeducted.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Net earnings</p>
              <p className="text-xl font-bold text-emerald-700">
                ₹{vendor.netEarnings.toLocaleString()}
              </p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Payment history</p>
            <ul className="space-y-2 text-sm">
              {vendor.paymentHistory.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <span>
                    {p.note} · {new Date(p.date).toLocaleDateString()}
                  </span>
                  <span className="font-semibold">
                    ₹{p.amount.toLocaleString()}{' '}
                    <span className="text-xs font-normal capitalize text-muted-foreground">
                      ({p.status})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  const platformTotal = earnings.reduce((s, e) => s + e.commissionAmount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform commission earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-2xl font-bold text-primary">₹{platformTotal.toLocaleString()}</p>
        <ul className="space-y-2 text-sm">
          {earnings.map((e) => (
            <li key={e.id} className="flex justify-between gap-2 border-b border-border/50 py-2 last:border-0">
              <span className="font-medium">{e.vendorName}</span>
              <span className="text-muted-foreground">₹{e.commissionAmount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
