'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { useCart } from '@/hooks/useCart';
import { wishlistService } from '@/services/wishlistService';
import type { Product } from '@/features/products';
import { cn } from '@/lib/utils';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

interface ProductCardProps {
  product: Product;
  vendorName?: string;
  businessSlug?: string;
  rating?: number;
  className?: string;
  wishlisted?: boolean;
  onWishlistChange?: (productId: string, wishlisted: boolean) => void;
}

export function ProductCard({
  product,
  vendorName = 'Local store',
  businessSlug,
  rating,
  className,
  wishlisted: initialWishlisted = false,
  onWishlistChange,
}: ProductCardProps) {
  const { addItem, isUpdating } = useCart();
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishBusy, setWishBusy] = useState(false);
  const price = product.salePrice ?? product.price;
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const displayRating = rating != null && rating > 0 ? rating.toFixed(1) : '—';

  async function add() {
    await addItem({
      productId: product.id,
      vendorId: product.vendorId,
      vendorName,
      productName: product.name,
      image: product.images[0] || PLACEHOLDER,
      price,
      quantity: 1,
    });
    toast({ title: 'Added to cart', description: product.name, variant: 'success' });
  }

  async function toggleWishlist() {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Log in to save products to your wishlist.',
        variant: 'error',
      });
      return;
    }
    setWishBusy(true);
    try {
      if (wishlisted) {
        await wishlistService.remove(product.id, token);
        setWishlisted(false);
        onWishlistChange?.(product.id, false);
        toast({ title: 'Removed from wishlist', variant: 'success' });
      } else {
        await wishlistService.add(product.id, token);
        setWishlisted(true);
        onWishlistChange?.(product.id, true);
        toast({ title: 'Saved to wishlist', variant: 'success' });
      }
    } catch {
      toast({ title: 'Wishlist update failed', variant: 'error' });
    } finally {
      setWishBusy(false);
    }
  }

  const storeHref = businessSlug
    ? `/business/${businessSlug}`
    : `/businesses?q=${encodeURIComponent(vendorName)}`;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-white marketplace-shadow',
        className
      )}
    >
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.images[0] || PLACEHOLDER}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 170px, 20vw"
        />
        {onSale && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[hsl(var(--offer))] px-2 py-0.5 text-[10px] font-bold text-white">
            Deal
          </span>
        )}
        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          disabled={wishBusy}
          onClick={() => void toggleWishlist()}
          className={cn(
            'absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full border bg-white/95 shadow-sm transition hover:scale-105',
            wishlisted ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          <Heart className={cn('size-4', wishlisted && 'fill-current')} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          <Link href={`/products/${product.id}`} className="hover:text-primary hover:underline">
            {product.name}
          </Link>
        </h3>
        <Link href={storeHref} className="text-[11px] text-muted-foreground hover:text-primary">
          {vendorName}
        </Link>
        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {displayRating}
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-primary">₹{price.toLocaleString()}</span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-auto w-full rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
          disabled={isUpdating || product.stock <= 0}
          onClick={() => void add()}
        >
          <ShoppingCart className="size-3.5" />
          {product.stock <= 0 ? 'Out of stock' : 'Add Cart'}
        </Button>
      </div>
    </motion.article>
  );
}
