'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueChart, SalesChart, UserGrowthChart } from '@/features/analytics';
import type { AdminAnalytics } from '@/services/analyticsService';

interface AnalyticsPanelProps {
  analytics: AdminAnalytics | null;
  isLoading?: boolean;
  compact?: boolean;
}

export function AnalyticsPanel({ analytics, isLoading, compact }: AnalyticsPanelProps) {
  return (
    <div className="space-y-6">
      {!compact && (
        <div className="grid gap-3 min-[375px]:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['Customers', analytics?.totalCustomers ?? 0],
              ['Vendors', analytics?.totalVendors ?? 0],
              ['Products', analytics?.totalProducts ?? 0],
              ['Reviews', analytics?.totalReviews ?? 0],
              ['Orders', analytics?.totalOrders ?? 0],
              ['Revenue', `₹${(analytics?.platformRevenue ?? 0).toLocaleString()}`],
              ['Commissions', `₹${(analytics?.commissionEarnings ?? 0).toLocaleString()}`],
              ['Pending products', analytics?.pendingProducts ?? 0],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-card px-3 py-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-16" />
              ) : (
                <p className="text-xl font-bold tabular-nums">{value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <UserGrowthChart
          title="New users (14 days)"
          data={analytics?.userGrowth ?? []}
          isLoading={isLoading}
        />
        <UserGrowthChart
          title="New vendors (14 days)"
          data={analytics?.vendorGrowth ?? []}
          isLoading={isLoading}
          color="#484AAA"
        />
        <SalesChart
          title="Orders (14 days)"
          data={analytics?.orderSeries ?? []}
          isLoading={isLoading}
        />
        <RevenueChart
          title="Platform revenue (14 days)"
          data={analytics?.revenueSeries ?? []}
          isLoading={isLoading}
        />
        <RevenueChart
          title="Commission earnings (14 days)"
          data={analytics?.commissionSeries ?? []}
          isLoading={isLoading}
          color="#059669"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <LeaderboardCard
          title="Top categories"
          empty="No category data yet"
          isLoading={isLoading}
          rows={(analytics?.topCategories ?? []).map((c) => ({
            label: c.name,
            value: `${c.businessCount} businesses`,
          }))}
        />
        <LeaderboardCard
          title="Top vendors by revenue"
          empty="No vendor sales yet"
          isLoading={isLoading}
          rows={(analytics?.topVendors ?? []).map((v) => ({
            label: v.name,
            value: `₹${v.revenue.toLocaleString()} · ${v.orderCount} orders`,
          }))}
        />
        <LeaderboardCard
          title="Top products"
          empty="No product sales yet"
          isLoading={isLoading}
          rows={(analytics?.topProducts ?? []).map((p) => ({
            label: p.name,
            sub: p.businessName,
            value: `${p.unitsSold} sold · ₹${p.revenue.toLocaleString()}`,
          }))}
        />
      </div>
    </div>
  );
}

function LeaderboardCard({
  title,
  rows,
  empty,
  isLoading,
}: {
  title: string;
  rows: Array<{ label: string; value: string; sub?: string }>;
  empty: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.label} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.label}</p>
                  {row.sub && <p className="truncate text-xs text-muted-foreground">{row.sub}</p>}
                </div>
                <span className="shrink-0 text-right text-xs text-muted-foreground">{row.value}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
