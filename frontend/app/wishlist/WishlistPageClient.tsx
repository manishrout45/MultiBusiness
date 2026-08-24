'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { useCart } from '@/hooks/useCart';
import { wishlistService, type WishlistItem } from '@/services/wishlistService';
import { RequireAuth } from '@/features/auth/RequireRole';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

function WishlistContent() {
  const { token } = useAuth();
  const { addItem, isUpdating } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await wishlistService.list(token);
    setItems(data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(productId: string) {
    setBusyId(productId);
    try {
      await wishlistService.remove(productId, token);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      toast({ title: 'Removed from wishlist', variant: 'success' });
    } catch {
      toast({ title: 'Could not remove item', variant: 'error' });
    } finally {
      setBusyId(null);
    }
  }

  async function addToCart(item: WishlistItem) {
    await addItem({
      productId: item.productId,
      vendorId: item.businessId,
      vendorName: item.businessName,
      productName: item.name,
      image: item.imageUrl || PLACEHOLDER,
      price: item.salePrice ?? item.price,
      quantity: 1,
    });
    toast({ title: 'Added to cart', description: item.name, variant: 'success' });
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save products you love. They’ll show up here for quick access."
        icon={<Heart className="size-10 text-primary/60" />}
        actionLabel="Browse products"
        onAction={() => {
          window.location.href = '/products';
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const price = item.salePrice ?? item.price;
        return (
          <div
            key={item.productId}
            className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center marketplace-shadow"
          >
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image
                src={item.imageUrl || PLACEHOLDER}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.name}</p>
              <Link
                href={item.businessSlug ? `/business/${item.businessSlug}` : '/businesses'}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {item.businessName}
              </Link>
              <p className="mt-1 text-lg font-bold text-primary">₹{price.toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={isUpdating || item.stock <= 0}
                onClick={() => void addToCart(item)}
              >
                <ShoppingCart className="size-4" />
                Add Cart
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === item.productId}
                onClick={() => void remove(item.productId)}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WishlistPageClient() {
  return (
    <RequireAuth fallbackHref="/login">
      <div className="container py-10 md:py-14">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Wishlist</h1>
        <WishlistContent />
      </div>
    </RequireAuth>
  );
}
