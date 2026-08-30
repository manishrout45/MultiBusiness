'use client';

import { IndianRupee } from 'lucide-react';
import { AnalyticsCard } from '@/features/analytics';

interface RevenueCardProps {
  revenue: number;
  vendorAmount?: number;
  commission?: number;
  isLoading?: boolean;
}

export function RevenueCard({
  revenue,
  vendorAmount,
  commission,
  isLoading,
}: RevenueCardProps) {
  return (
    <AnalyticsCard
      title="Revenue"
      value={`₹${revenue.toLocaleString()}`}
      subtitle={
        vendorAmount != null && commission != null
          ? `Net ₹${vendorAmount.toLocaleString()} · Fee ₹${commission.toLocaleString()}`
          : 'Paid orders'
      }
      icon={IndianRupee}
      trend="+12.4%"
      isLoading={isLoading}
    />
  );
}
