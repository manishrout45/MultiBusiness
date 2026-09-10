'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Minus, Plus, ShoppingCart, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportButton } from '@/components/ReportButton';
import { useAuth } from '@/features/auth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/toast';
import { getCatalogProduct, type ProductDetail } from '@/services/catalogService';
import { wishlistService } from '@/services/wishlistService';
import NotFound from '@/app/not-found';
import { cn } from '@/lib/utils';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1611591434801-40c01f09e7f0?w=800&h=800&fit=crop';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function discountPercent(price: number, salePrice: number) {
  if (!price || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, isUpdating } = useCart();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    getCatalogProduct(id).then((data) => {
      if (!cancelled) {
        setProduct(data);
        if (data) document.title = `${data.name} | LocalMart`;
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      if (isAuthenticated && token) {
        const items = await wishlistService.list(token);
        if (!cancelled) {
          setWishlisted(items.some((item) => String(item.productId) === String(id)));
        }
        return;
      }
      if (!cancelled) {
        setWishlisted(wishlistService.localIds().includes(String(id)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, token]);

  const images = useMemo(() => {
    if (!product) return [PLACEHOLDER];
    const list = product.images.length ? product.images : [product.imageUrl || PLACEHOLDER];
    return list.filter(Boolean);
  }, [product]);

  const hasRealVariations = Boolean(product?.variations?.length);
  const sizes = useMemo(() => {
    if (!product?.variations?.length) return [];
    return product.variations.map((v) => v.value).filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (sizes.length) setSelectedSize(sizes[0]);
    else setSelectedSize(null);
  }, [sizes]);

  if (loaded && !product) return <NotFound />;
  if (!product) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  const salePrice = product.salePrice ?? product.price;
  const discount = discountPercent(product.price, salePrice);
  const rating = product.rating ?? 0;
  const selectedVariation = product.variations?.find((v) => v.value === selectedSize);
  const availableStock = selectedVariation
    ? Number(selectedVariation.stock)
    : Number(product.stock);
  const businessHref = product.business?.slug
    ? `/business/${product.business.slug}`
    : product.businessSlug
      ? `/business/${product.businessSlug}`
      : product.business?.id
        ? `/business/store-${product.business.id}`
        : product.vendorId
          ? `/business/store-${product.vendorId}`
          : '/businesses';

  async function toggleWishlist() {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Log in to save products to your wishlist.',
        variant: 'error',
      });
      router.push(`/login?next=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }
    setWishBusy(true);
    try {
      if (wishlisted) {
        await wishlistService.remove(String(id), token);
        setWishlisted(false);
        toast({ title: 'Removed from wishlist', variant: 'success' });
      } else {
        await wishlistService.add(String(id), token);
        setWishlisted(true);
        toast({ title: 'Saved to wishlist', variant: 'success' });
      }
    } catch {
      toast({ title: 'Wishlist update failed', variant: 'error' });
    } finally {
      setWishBusy(false);
    }
  }

  async function addToCart(options?: { goToCart?: boolean }) {
    if (availableStock <= 0) {
      toast({ title: 'Out of stock', variant: 'error' });
      return;
    }
    if (hasRealVariations && !selectedSize) {
      toast({ title: 'Select a size', variant: 'error' });
      return;
    }
    if (quantity > availableStock) {
      toast({ title: 'Not enough stock for this size', variant: 'error' });
      return;
    }
    setCartBusy(true);
    try {
      await addItem({
        productId: product.id,
        vendorId: product.vendorId,
        vendorName: product.business?.businessName || product.businessName || 'Vendor',
        productName: product.name,
        image: images[activeImage] || PLACEHOLDER,
        price: salePrice + Number(selectedVariation?.priceAdjustment || 0),
        quantity,
        variationId: selectedVariation?.id || null,
        variationLabel: selectedVariation?.value || null,
      });
      toast({ title: 'Added to cart', description: product.name, variant: 'success' });
      if (options?.goToCart) {
        router.push('/cart');
      }
    } catch (err) {
      toast({
        title: 'Could not add to cart',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'error',
      });
    } finally {
      setCartBusy(false);
    }
  }

  async function shopNow() {
    await addToCart({ goToCart: true });
  }

  return (
    <div className="bg-card pb-16">
      <div className="container py-8 md:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-dark md:text-3xl">Product Details</h1>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={wishBusy}
            onClick={() => void toggleWishlist()}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'size-11 rounded-full',
              wishlisted ? 'border-red-200 text-red-500' : 'text-muted-foreground'
            )}
          >
            <Heart className={cn('size-5', wishlisted && 'fill-current')} />
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-muted/20">
              <div className="relative aspect-square">
                <Image
                  src={images[activeImage] || PLACEHOLDER}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <button
                type="button"
                disabled={wishBusy}
                onClick={() => void toggleWishlist()}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={cn(
                  'absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border bg-white/95 shadow-sm transition hover:scale-105',
                  wishlisted ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                <Heart className={cn('size-5', wishlisted && 'fill-current')} />
              </button>
            </div>

            {images.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {images.map((src, idx) => (
                  <button
                    key={`thumb-${src}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      'relative size-16 overflow-hidden rounded-xl border',
                      activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    )}
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-dark">
                  {product.business?.businessName || product.businessName || 'Business Name'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product.business?.businessType || product.category || 'Local product'}
                </p>
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white">
                {product.business?.logo ? (
                  <Image
                    src={product.business.logo}
                    alt=""
                    width={48}
                    height={48}
                    className="size-full object-cover"
                  />
                ) : (
                  <Store className="size-5 text-muted-foreground" />
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold leading-snug text-dark md:text-[1.75rem]">
              {product.name}
            </h2>

            {hasRealVariations ? (
              <div>
                <p className="mb-3 text-sm font-semibold text-dark">Select size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={v.stock <= 0}
                      onClick={() => setSelectedSize(v.value)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        selectedSize === v.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-white text-muted-foreground hover:border-primary/40',
                        v.stock <= 0 && 'cursor-not-allowed opacity-40'
                      )}
                    >
                      {v.value}
                      <span className="ml-1 text-xs opacity-70">({v.stock})</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="min-h-[100px] rounded-2xl border border-border/70 bg-white p-4 text-sm leading-relaxed text-muted-foreground">
              {product.description || 'No description provided for this product yet.'}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {rating > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
                  {rating.toFixed(1)}
                  <Star className="size-3.5 fill-white text-white" />
                </span>
              ) : null}
              <span className="text-3xl font-bold text-dark">{formatPrice(salePrice)}</span>
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">{discount}% Off</span>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-dark">Quantity</p>
              <div className="inline-flex items-center rounded-full border border-border">
                <button
                  type="button"
                  className="flex size-10 items-center justify-center text-muted-foreground hover:text-dark"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  className="flex size-10 items-center justify-center text-muted-foreground hover:text-dark"
                  onClick={() =>
                    setQuantity((q) => Math.min(Math.max(availableStock, 1), q + 1))
                  }
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Button asChild variant="outline" className="h-12 rounded-full text-base font-semibold">
                <Link href={businessHref}>Visit store</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-full text-base font-semibold"
                disabled={cartBusy || isUpdating || availableStock <= 0}
                onClick={() => void addToCart()}
              >
                <ShoppingCart className="size-4" />
                Add to cart
              </Button>
              <Button
                type="button"
                className="h-12 rounded-full bg-neutral-900 text-base font-semibold text-white hover:bg-neutral-800"
                disabled={cartBusy || isUpdating || availableStock <= 0}
                onClick={() => void shopNow()}
              >
                Shop now
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <ReportButton targetType="product" targetId={product.id} label="Report product" />
              {product.vendorId ? (
                <ReportButton
                  targetType="business"
                  targetId={product.vendorId}
                  label="Report store"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
