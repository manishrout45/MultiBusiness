'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { VendorDashboardStats } from '@/services/dashboardService';

interface ProductOverviewProps {
  stats: VendorDashboardStats | null;
  isLoading?: boolean;
}

export function ProductOverview({ stats, isLoading }: ProductOverviewProps) {
  if (isLoading || !stats) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  const rows = [
    { label: 'Total products', value: stats.products },
    { label: 'Active products', value: stats.activeProducts },
    { label: 'Out of stock', value: stats.outOfStock },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Product management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold tabular-nums">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
