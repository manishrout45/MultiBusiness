'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Package, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Business } from '@/features/businesses';
import { formatDistance } from '@/lib/geo';
import { cn, formatRating } from '@/lib/utils';

interface MarketplaceBusinessCardProps {
  business: Business;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function MarketplaceBusinessCard({
  business,
  selected,
  onSelect,
  className,
  compact,
}: MarketplaceBusinessCardProps) {
  return (
    <article
      className={cn(
        'group flex overflow-hidden rounded-2xl border bg-card transition',
        selected
          ? 'border-primary shadow-md ring-2 ring-primary/20'
          : 'border-border/80 hover:border-primary/30 marketplace-shadow',
        compact ? 'flex-row' : 'flex-col',
        className
      )}
      onClick={() => onSelect?.(business.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect?.(business.id);
      }}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-muted',
          compact ? 'h-auto w-28 self-stretch' : 'aspect-[5/3] w-full'
        )}
      >
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          sizes={compact ? '112px' : '(max-width: 768px) 100vw, 280px'}
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {business.featured ? (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Featured
          </span>
        ) : null}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col', compact ? 'p-3' : 'p-4')}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {business.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{business.category}</p>
          </div>
          {business.rating > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-warning/10 px-1.5 py-0.5 text-xs font-semibold text-warning">
              <Star className="size-3 fill-warning text-warning" />
              {formatRating(business.rating)}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {business.distanceKm != null ? (
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              <MapPin className="size-3" />
              {formatDistance(business.distanceKm)}
            </span>
          ) : business.city ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {business.city}
            </span>
          ) : null}
          {business.productCount != null && business.productCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Package className="size-3" />
              {business.productCount} products
            </span>
          ) : null}
          {business.reviewCount > 0 ? (
            <span>{business.reviewCount} reviews</span>
          ) : null}
        </div>

        <Button
          asChild
          variant="outline-primary"
          size="sm"
          className="mt-3 w-full rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/business/${business.slug}`}>View Store</Link>
        </Button>
      </div>
    </article>
  );
}
