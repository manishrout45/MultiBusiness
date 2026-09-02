'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { useAdminDashboard } from '@/hooks/useDashboard';
import { useAdminAnalytics } from '@/hooks/useAnalytics';
import { DashboardHeader } from '@/features/vendor-dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSidebar, ADMIN_SECTIONS, type AdminSection } from './AdminSidebar';
import { PlatformStats } from './PlatformStats';
import { AnalyticsPanel } from './AnalyticsPanel';
import { UserManagement } from './UserManagement';
import { VendorManagement } from './VendorManagement';
import { CategoryManagement } from './CategoryManagement';
import { ThemeManagement } from './ThemeManagement';
import { CommissionManagement } from './CommissionManagement';
import {
  OffersManagement,
  AnnouncementsManagement,
  ReportsManagement,
} from './PlatformManagement';
import { OrderMonitoring, ReviewModeration } from './MarketplaceOps';

function readSectionFromHash(): AdminSection {
  if (typeof window === 'undefined') return 'overview';
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'products') return 'vendors';
  if (hash && ADMIN_SECTIONS.has(hash)) return hash as AdminSection;
  return 'overview';
}

export function AdminDashboardPageClient() {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<AdminSection>('overview');
  const { stats, isLoading, refresh } = useAdminDashboard();
  const { data: analytics, isLoading: analyticsLoading, refresh: refreshAnalytics } =
    useAdminAnalytics();

  const isAdmin =
    user?.role === 'super_admin' || user?.role === 'business_manager';

  useEffect(() => {
    setSection(readSectionFromHash());
    const onHash = () => setSection(readSectionFromHash());
    const onPop = () => setSection(readSectionFromHash());
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const navigate = useCallback((next: AdminSection) => {
    setSection(next);
  }, []);

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
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={section}
        onNavigate={navigate}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title="Super admin"
          subtitle="Marketplace monitoring & controls"
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={() => void handleRefresh()}
          refreshing={isLoading || analyticsLoading}
        />

        <div className="space-y-8 p-4 sm:p-6">
          {section === 'overview' && (
            <>
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
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Analytics snapshot
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate('analytics');
                      window.history.pushState(null, '', '/admin/dashboard#analytics');
                    }}
                  >
                    Full analytics
                  </Button>
                </div>
                <AnalyticsPanel analytics={analytics} isLoading={analyticsLoading} compact />
              </section>

              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Marketplace pulse
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <PulseCard
                    title="Pending products"
                    value={stats?.pendingProducts ?? 0}
                    hint="Review under Vendors"
                    onOpen={() => {
                      navigate('vendors');
                      window.history.pushState(null, '', '/admin/dashboard#vendors');
                    }}
                  />
                  <PulseCard
                    title="Published products"
                    value={stats?.publishedProducts ?? 0}
                    hint="Listed under each vendor"
                    onOpen={() => {
                      navigate('vendors');
                      window.history.pushState(null, '', '/admin/dashboard#vendors');
                    }}
                  />
                  <PulseCard
                    title="Pending reviews"
                    value={stats?.pendingReviews ?? 0}
                    hint="Need approval"
                    onOpen={() => {
                      navigate('reviews');
                      window.history.pushState(null, '', '/admin/dashboard#reviews');
                    }}
                  />
                  <PulseCard
                    title="Categories"
                    value={stats?.categories ?? 0}
                    hint="Active categories"
                    onOpen={() => {
                      navigate('categories');
                      window.history.pushState(null, '', '/admin/dashboard#categories');
                    }}
                  />
                </div>
                {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
                  <div className="mt-4 grid gap-3 min-[375px]:grid-cols-2 sm:grid-cols-4">
                    {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="rounded-xl border bg-card px-3 py-2 text-center">
                        <p className="text-xs capitalize text-muted-foreground">{status}</p>
                        <p className="text-lg font-bold tabular-nums">{count}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {section === 'analytics' && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Website analytics
              </h2>
              <AnalyticsPanel analytics={analytics} isLoading={analyticsLoading} />
            </section>
          )}

          {section === 'users' && <UserManagement />}
          {section === 'vendors' && <VendorManagement />}
          {section === 'orders' && <OrderMonitoring />}
          {section === 'reviews' && <ReviewModeration />}
          {section === 'categories' && <CategoryManagement />}
          {section === 'theme' && <ThemeManagement />}
          {section === 'offers' && <OffersManagement />}
          {section === 'announcements' && <AnnouncementsManagement />}
          {section === 'reports' && <ReportsManagement />}
          {section === 'commissions' && <CommissionManagement />}
        </div>
      </div>
    </div>
  );
}

function PulseCard({
  title,
  value,
  hint,
  onOpen,
}: {
  title: string;
  value: number;
  hint: string;
  onOpen: () => void;
}) {
  return (
    <Card className="cursor-pointer transition hover:border-primary/40" onClick={onOpen}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
