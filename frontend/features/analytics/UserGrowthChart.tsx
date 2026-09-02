'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartPoint } from '@/services/analyticsService';

interface UserGrowthChartProps {
  title?: string;
  data: ChartPoint[];
  isLoading?: boolean;
  color?: string;
}

export function UserGrowthChart({
  title = 'User growth',
  data,
  isLoading,
  color = 'hsl(var(--primary))',
}: UserGrowthChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = Math.max(max - min, 1);
  const w = 560;
  const h = 180;
  const pad = 16;
  const coords = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((d.value - min) / range) * (h - pad * 2);
    return { x, y };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No growth data yet.</p>
        ) : (
          <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full min-w-[280px]">
            <motion.polyline
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            {coords.map((c, i) => (
              <motion.circle
                key={i}
                cx={c.x}
                cy={c.y}
                r="3.5"
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
              />
            ))}
          </svg>
        )}
        {data.length > 0 && (
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{data[0].label}</span>
            <span className="font-medium text-foreground">
              {data[data.length - 1].value.toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
