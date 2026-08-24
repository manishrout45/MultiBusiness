'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { VendorDashboardStats } from '@/services/dashboardService';

interface OrderOverviewProps {
  stats: VendorDashboardStats | null;
  isLoading?: boolean;
}

export function OrderOverview({ stats, isLoading }: OrderOverviewProps) {
  if (isLoading || !stats) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  const rows = [
    { label: 'Pending', value: stats.pendingOrders, tone: 'text-amber-700' },
    { label: 'Processing', value: stats.processingOrders, tone: 'text-blue-700' },
    { label: 'Completed', value: stats.completedOrders, tone: 'text-emerald-700' },
    { label: 'Cancelled', value: stats.cancelledOrders, tone: 'text-red-700' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Order management</CardTitle>
        <Link href="/vendor/orders" className="text-sm font-medium text-primary hover:underline">
          View orders
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-border/70 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${row.tone}`}>{row.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
