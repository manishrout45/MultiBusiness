'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function BusinessCardSkeleton({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex overflow-hidden rounded-2xl border border-border bg-card',
          className
        )}
      >
        <Skeleton className="h-auto w-28 shrink-0 self-stretch rounded-none" />
        <div className="flex flex-1 flex-col space-y-2 p-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-1 h-8 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
      <Skeleton className="aspect-[5/4] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-border bg-muted/40',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
