'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapPin, Package, Search, Store } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'search' | 'location' | 'store' | 'product';
  className?: string;
}

const ICONS = {
  search: Search,
  location: MapPin,
  store: Store,
  product: Package,
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'search',
  className,
}: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-light/60 px-6 py-10 text-center',
        className
      )}
    >
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="primary" size="sm" className="mt-4 rounded-xl" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
