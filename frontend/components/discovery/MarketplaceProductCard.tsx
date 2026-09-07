'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import type { CatalogProduct } from '@/services/catalogService';
import { wishlistService } from '@/services/wishlistService';
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
  const href = `/products/${product.id}`;
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isAuthenticated && token) {
        const items = await wishlistService.list(token);
        if (!cancelled) {
          setWishlisted(items.some((item) => String(item.productId) === String(product.id)));
        }
        return;
      }
      if (!cancelled) {
        setWishlisted(wishlistService.localIds().includes(String(product.id)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id, isAuthenticated, token]);

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Log in to save products to your wishlist.',
        variant: 'error',
      });
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    setWishBusy(true);
    try {
      if (wishlisted) {
        await wishlistService.remove(String(product.id), token);
        setWishlisted(false);
        toast({ title: 'Removed from wishlist', variant: 'success' });
      } else {
        await wishlistService.add(String(product.id), token);
        setWishlisted(true);
        toast({ title: 'Saved to wishlist', variant: 'success' });
      }
    } catch {
      toast({ title: 'Wishlist update failed', variant: 'error' });
    } finally {
      setWishBusy(false);
    }
  }

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card marketplace-shadow',
        className
      )}
    >
      <Link href={href} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}>
        <span className="sr-only">View {product.name}</span>
      </Link>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
        />
        <button
          type="button"
          disabled={wishBusy}
          onClick={toggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={cn(
            'absolute right-2.5 top-2.5 z-20 flex size-9 items-center justify-center rounded-full border bg-white/95 shadow-sm transition hover:scale-105',
            wishlisted ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          <Heart className={cn('size-4', wishlisted && 'fill-current')} />
        </button>
      </div>
      <div className="relative z-0 flex flex-1 flex-col p-3 sm:p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
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
        <Button
          asChild
          variant="primary"
          size="sm"
          className="relative z-20 mt-3 w-full rounded-xl"
        >
          <Link href={href}>View Product</Link>
        </Button>
      </div>
    </article>
  );
}
