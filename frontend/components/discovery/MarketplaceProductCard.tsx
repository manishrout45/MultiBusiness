'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CatalogProduct } from '@/services/catalogService';
import { formatDistance } from '@/lib/geo';
import { cn } from '@/lib/utils';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

interface MarketplaceProductCardProps {
  product: CatalogProduct;
  className?: string;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function MarketplaceProductCard({ product, className }: MarketplaceProductCardProps) {
  const price = product.salePrice ?? product.price;
  const image = product.imageUrl || product.images[0] || PLACEHOLDER;
  const href = product.businessSlug
    ? `/business/${product.businessSlug}`
    : `/products?q=${encodeURIComponent(product.name)}`;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card marketplace-shadow',
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-primary">{formatPrice(price)}</span>
          {product.rating != null && product.rating > 0 ? (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-warning">
              <Star className="size-3 fill-warning text-warning" />
              {product.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {product.businessName ? (
            <p className="inline-flex max-w-full items-center gap-1 truncate">
              <Store className="size-3 shrink-0 text-primary" />
              <span className="truncate">Sold by {product.businessName}</span>
            </p>
          ) : null}
          {product.distanceKm != null ? (
            <p className="inline-flex items-center gap-1 text-primary">
              <MapPin className="size-3" />
              {formatDistance(product.distanceKm)}
            </p>
          ) : null}
        </div>
        <Button asChild variant="primary" size="sm" className="mt-3 w-full rounded-xl">
          <Link href={href}>View Product</Link>
        </Button>
      </div>
    </article>
  );
}
