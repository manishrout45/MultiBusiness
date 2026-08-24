'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartPoint } from '@/services/analyticsService';

interface RevenueChartProps {
  title?: string;
  data: ChartPoint[];
  isLoading?: boolean;
  color?: string;
}

export function RevenueChart({
  title = 'Revenue',
  data,
  isLoading,
  color = 'hsl(var(--primary))',
}: RevenueChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 560;
  const h = 180;
  const pad = 16;
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (d.value / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const area = `M ${pad},${h - pad} L ${points.join(' L ')} L ${w - pad},${h - pad} Z`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No revenue data yet.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full min-w-[280px]">
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d={area}
                fill="url(#revFill)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <motion.polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                points={points.join(' ')}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground sm:text-xs">
              <span>{data[0]?.label}</span>
              <span>{data[Math.floor(data.length / 2)]?.label}</span>
              <span>{data[data.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
