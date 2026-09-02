'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/toast';
import { getCatalogProduct, type ProductDetail } from '@/services/catalogService';
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
  const { addItem, isUpdating } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

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

  const images = useMemo(() => {
    if (!product) return [PLACEHOLDER];
    const list = product.images.length ? product.images : [product.imageUrl || PLACEHOLDER];
    return list.filter(Boolean);
  }, [product]);

  const sizes = useMemo(() => {
    if (!product?.variations?.length) return ['4', '5', '6', '7', '8'];
    return product.variations.map((v) => v.value).filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (sizes.length) setSelectedSize(sizes[Math.min(2, sizes.length - 1)]);
  }, [sizes]);

  if (loaded && !product) return <NotFound />;
  if (!product) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  const salePrice = product.salePrice ?? product.price;
  const discount = discountPercent(product.price, salePrice);
  const rating = product.rating ?? 0;
  const businessHref = product.business?.slug
    ? `/business/${product.business.slug}`
    : product.businessSlug
      ? `/business/${product.businessSlug}`
      : '/businesses';

  async function handleShopNow() {
    await addItem({
      productId: product!.id,
      vendorId: product!.vendorId,
      vendorName: product!.business?.businessName || product!.businessName || 'Vendor',
      productName: product!.name,
      image: images[activeImage] || PLACEHOLDER,
      price: salePrice,
      quantity: 1,
    });
    toast({ title: 'Added to cart', description: product!.name, variant: 'success' });
  }

  return (
    <div className="bg-card pb-16">
      <div className="container py-8 md:py-10">
        <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-dark md:text-3xl">
          Product Details
        </h1>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border/70 bg-muted/20 p-3">
              {images.slice(0, 4).map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-2xl border bg-white',
                    activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border/60'
                  )}
                >
                  <Image src={src} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {images.map((src, idx) => (
                <button
                  key={`thumb-${src}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'relative size-14 overflow-hidden rounded-xl border',
                    activeImage === idx ? 'border-primary' : 'border-border'
                  )}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-dark">
                  {product.business?.businessName || product.businessName || 'Business Name'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product.business?.businessType || product.category || 'Service Details'}
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

            <div>
              <p className="mb-3 text-sm font-semibold text-dark">Select Size</p>
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-5">
                <div className="relative px-2">
                  <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 bg-border" />
                  <div className="relative flex justify-between">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className="relative z-10 flex flex-col items-center gap-2"
                      >
                        <span
                          className={cn(
                            'size-4 rounded-full border-2 bg-white transition',
                            selectedSize === size
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            selectedSize === size ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {size}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-[120px] rounded-2xl border border-border/70 bg-white p-4 text-sm leading-relaxed text-muted-foreground">
              {product.description || 'No description provided for this product yet.'}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
                {rating > 0 ? rating.toFixed(1) : '4.4'}
                <Star className="size-3.5 fill-white text-white" />
              </span>
              <span className="text-3xl font-bold text-dark">{formatPrice(salePrice)}</span>
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {discount}% Off
                  </span>
                </>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-12 rounded-full text-base font-semibold">
                <Link href={businessHref}>Visit Profile</Link>
              </Button>
              <Button
                className="h-12 rounded-full bg-neutral-900 text-base font-semibold text-white hover:bg-neutral-800"
                disabled={isUpdating || product.stock <= 0}
                onClick={() => void handleShopNow()}
              >
                Shop Now
              </Button>
            </div>

            <div className="flex items-center gap-1 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-5',
                    i < Math.round(rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
