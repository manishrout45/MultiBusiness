'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { useAdminDashboard } from '@/hooks/useDashboard';
import { useAdminAnalytics } from '@/hooks/useAnalytics';
import { RevenueChart, UserGrowthChart, SalesChart } from '@/features/analytics';
import { DashboardHeader } from '@/features/vendor-dashboard/DashboardHeader';
import { AdminSidebar } from './AdminSidebar';
import { PlatformStats } from './PlatformStats';
import { UserManagement } from './UserManagement';
import { VendorManagement } from './VendorManagement';
import { CategoryManagement } from './CategoryManagement';
import { CommissionManagement } from './CommissionManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminDashboardPageClient() {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { stats, isLoading, refresh } = useAdminDashboard();
  const { data: analytics, isLoading: analyticsLoading, refresh: refreshAnalytics } =
    useAdminAnalytics();

  const isAdmin =
    user?.role === 'super_admin' || user?.role === 'business_manager';

  async function handleRefresh() {
    await Promise.all([refresh(), refreshAnalytics()]);
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">Sign in as a super admin to continue.</p>
        <Button asChild className="mt-6">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold">Access restricted</h1>
        <p className="mt-2 text-muted-foreground">
          This area is only available to platform administrators.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/20">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title="Super admin"
          subtitle="Marketplace monitoring & controls"
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={() => void handleRefresh()}
          refreshing={isLoading || analyticsLoading}
        />

        <div className="space-y-8 p-4 sm:p-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Platform overview
            </h2>
            <PlatformStats stats={stats} isLoading={isLoading} />
            {stats && (
              <div className="mt-4 grid gap-3 min-[375px]:grid-cols-2 sm:grid-cols-5">
                {(
                  [
                    ['Pending', stats.businesses.pending],
                    ['Recommended', stats.businesses.recommended],
                    ['Approved', stats.businesses.approved],
                    ['Rejected', stats.businesses.rejected],
                    ['Suspended', stats.businesses.suspended],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-xl border bg-card px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Analytics
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <UserGrowthChart
                title="User growth"
                data={analytics?.userGrowth ?? []}
                isLoading={analyticsLoading}
              />
              <RevenueChart
                title="Platform revenue"
                data={analytics?.revenueSeries ?? []}
                isLoading={analyticsLoading}
              />
              <SalesChart
                title="Orders"
                data={analytics?.orderSeries ?? []}
                isLoading={analyticsLoading}
              />
              <RevenueChart
                title="Commission earnings"
                data={analytics?.commissionSeries ?? []}
                isLoading={analyticsLoading}
                color="#059669"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Marketplace monitoring
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.products ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Catalog items monitored</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.orders ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Platform-wide orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Moderation ready</p>
                  <p className="text-xs text-muted-foreground">
                    Complaints & reports surface in notifications
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <VendorManagement />
          <UserManagement />
          <CategoryManagement />
          <CommissionManagement />
        </div>
      </div>
    </div>
  );
}
