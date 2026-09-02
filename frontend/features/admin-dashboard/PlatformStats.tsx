'use client';

import {
  FolderTree,
  IndianRupee,
  Package,
  Percent,
  ShoppingBag,
  Star,
  Store,
  Users,
} from 'lucide-react';
import { AnalyticsCard } from '@/features/analytics';
import type { AdminDashboardStats } from '@/services/dashboardService';

interface PlatformStatsProps {
  stats: AdminDashboardStats | null;
  isLoading?: boolean;
}

export function PlatformStats({ stats, isLoading }: PlatformStatsProps) {
  return (
    <div className="grid gap-4 min-[375px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <AnalyticsCard
        title="Total vendors"
        value={String(stats?.vendors ?? 0)}
        icon={Store}
        isLoading={isLoading}
      />
      <AnalyticsCard
        title="Total customers"
        value={String(stats?.customers ?? 0)}
        icon={Users}
        isLoading={isLoading}
      />
      <AnalyticsCard
        title="Total orders"
        value={String(stats?.orders ?? 0)}
        icon={ShoppingBag}
        isLoading={isLoading}
      />
      <AnalyticsCard
        title="Products"
        value={String(stats?.products ?? 0)}
        icon={Package}
        isLoading={isLoading}
      />
      <AnalyticsCard
        title="Platform revenue"
        value={`₹${(stats?.revenue ?? 0).toLocaleString()}`}
        icon={IndianRupee}
        isLoading={isLoading}
      />
      <AnalyticsCard
        title="Commission earnings"
        value={`₹${(stats?.commissions ?? 0).toLocaleString()}`}
        icon={Percent}
        isLoading={isLoading}
      />
      <AnalyticsCard
        title="Reviews"
        value={String(stats?.reviews ?? 0)}
        icon={Star}
        isLoading={isLoading}
      />
      <AnalyticsCard
        title="Categories"
        value={String(stats?.categories ?? 0)}
        icon={FolderTree}
        isLoading={isLoading}
      />
    </div>
  );
}
