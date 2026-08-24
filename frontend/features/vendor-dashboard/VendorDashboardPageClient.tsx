'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react';
import { AnalyticsCard, RevenueChart, SalesChart as ActivityChart } from '@/features/analytics';
import { CommissionCard } from '@/features/commission';
import { RequireAuth, RequireRole } from '@/features/auth/RequireRole';
import { useAuth } from '@/features/auth';
import { useVendorAnalytics } from '@/hooks/useAnalytics';
import { useVendorDashboard } from '@/hooks/useDashboard';
import { VendorDashboardGate } from '@/components/vendor/VendorDashboardGate';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { RevenueCard } from './RevenueCard';
import { SalesChart } from './SalesChart';
import { ProductOverview } from './ProductOverview';
import { OrderOverview } from './OrderOverview';
import { CustomerLeads } from './CustomerLeads';

function VendorDashboardContent() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { stats, leads, isLoading, refresh } = useVendorDashboard();
  const { data: analytics, isLoading: analyticsLoading, refresh: refreshAnalytics } =
    useVendorAnalytics();

  async function handleRefresh() {
    await Promise.all([refresh(), refreshAnalytics()]);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/20">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title="Vendor dashboard"
          subtitle={user?.name ? `Welcome back, ${user.name}` : 'Business overview'}
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={() => void handleRefresh()}
          refreshing={isLoading || analyticsLoading}
        />

        <div className="space-y-6 p-4 sm:p-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Overview
            </h2>
            <div className="grid gap-4 min-[375px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <AnalyticsCard
                title="Total Products"
                value={String(stats?.products ?? 0)}
                icon={Package}
                isLoading={isLoading}
              />
              <AnalyticsCard
                title="Total Orders"
                value={String(stats?.orders ?? 0)}
                icon={ShoppingBag}
                isLoading={isLoading}
              />
              <RevenueCard
                revenue={stats?.revenue ?? 0}
                vendorAmount={stats?.vendorAmount}
                commission={stats?.commission}
                isLoading={isLoading}
              />
              <AnalyticsCard
                title="Customer Leads"
                value={String(leads?.length ?? stats?.customers ?? 0)}
                icon={Users}
                isLoading={isLoading}
              />
              <AnalyticsCard
                title="Reviews"
                value={String(stats?.reviews ?? 0)}
                icon={Star}
                isLoading={isLoading}
              />
            </div>
          </section>

          <section id="orders" className="scroll-mt-24 grid gap-4 lg:grid-cols-2">
            <ProductOverview stats={stats} isLoading={isLoading} />
            <OrderOverview stats={stats} isLoading={isLoading} />
          </section>

          <section id="analytics" className="scroll-mt-24">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Business analytics
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <SalesChart data={analytics?.salesSeries ?? []} isLoading={analyticsLoading} />
              <RevenueChart
                title="Revenue graph"
                data={analytics?.revenueSeries ?? []}
                isLoading={analyticsLoading}
              />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card p-4 sm:p-6">
                <h3 className="mb-3 text-base font-semibold">Product performance</h3>
                {analyticsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {(analytics?.productPerformance ?? []).map((p) => (
                      <li key={p.id} className="flex justify-between gap-3 border-b border-border/50 py-2 last:border-0">
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {p.unitsSold} sold · ₹{p.revenue.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ActivityChart
                title={`Customer activity · ${(analytics?.visitorCount ?? 0).toLocaleString()} visits`}
                data={analytics?.customerActivity ?? []}
                isLoading={analyticsLoading}
              />
            </div>
          </section>

          <section id="customers" className="scroll-mt-24">
            <CustomerLeads leads={leads} isLoading={isLoading} />
          </section>

          <section id="commission" className="scroll-mt-24">
            <CommissionCard mode="vendor" />
          </section>
        </div>
      </div>
    </div>
  );
}

export function VendorDashboardPageClient() {
  return (
    <RequireAuth fallbackHref="/login">
      <RequireRole roles={['vendor']} fallbackHref="/">
        <VendorDashboardGate>
          <VendorDashboardContent />
        </VendorDashboardGate>
      </RequireRole>
    </RequireAuth>
  );
}
