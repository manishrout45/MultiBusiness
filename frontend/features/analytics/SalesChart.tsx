'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartPoint } from '@/services/analyticsService';

interface SalesChartProps {
  title?: string;
  data: ChartPoint[];
  isLoading?: boolean;
}

export function SalesChart({ title = 'Sales', data, isLoading }: SalesChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const max = Math.max(...data.map((d) => d.value), 1);
  const visible = data.slice(-10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No sales data yet.</p>
        ) : (
          <div className="flex h-44 items-end gap-1.5 sm:gap-2">
            {visible.map((point, i) => {
              const height = Math.max(8, (point.value / max) * 100);
              return (
                <div key={`${point.label}-${i}`} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    className="w-full max-w-8 rounded-t-md bg-primary/80"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 120, damping: 18 }}
                    title={`${point.label}: ${point.value}`}
                  />
                  <span className="hidden truncate text-[9px] text-muted-foreground sm:block">
                    {point.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
