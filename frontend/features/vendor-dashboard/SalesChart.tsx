'use client';

import { SalesChart as AnalyticsSalesChart } from '@/features/analytics';
import type { ChartPoint } from '@/services/analyticsService';

interface SalesChartProps {
  data: ChartPoint[];
  isLoading?: boolean;
}

export function SalesChart({ data, isLoading }: SalesChartProps) {
  return <AnalyticsSalesChart title="Sales performance" data={data} isLoading={isLoading} />;
}
