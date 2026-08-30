'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
  isLoading?: boolean;
}

export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  isLoading,
}: AnalyticsCardProps) {
  if (isLoading) {
    return <Skeleton className={cn('h-28 rounded-2xl', className)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {Icon && (
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {(subtitle || trend) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {trend && <span className="font-medium text-emerald-600">{trend} </span>}
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
