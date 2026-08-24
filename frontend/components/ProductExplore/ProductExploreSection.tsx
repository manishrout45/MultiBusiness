'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/features/products';
import { cn } from '@/lib/utils';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

interface MarketplaceProductCardProps {
  product: Product;
  vendorName?: string;
  className?: string;
}

export function MarketplaceProductCard({
  product,
  vendorName = 'Local store',
  className,
}: MarketplaceProductCardProps) {
  const { addItem, isUpdating } = useCart();
  const { toast } = useToast();
  const price = product.salePrice ?? product.price;
  const hasSale = product.salePrice != null && product.salePrice < product.price;

  async function handleAdd() {
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

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={cn(
        'group flex h-full w-[180px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-white marketplace-shadow sm:w-auto',
        className
      )}
    >
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.images[0] || PLACEHOLDER}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 180px, 20vw"
        />
        {hasSale && (
          <span className="absolute left-2 top-2 rounded-full bg-[hsl(var(--offer))] px-2 py-0.5 text-[10px] font-bold text-white">
            Sale
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{vendorName}</p>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          4.7
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-primary">₹{price.toLocaleString()}</span>
          {hasSale && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-auto w-full rounded-xl border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground"
          disabled={isUpdating || product.stock <= 0}
          onClick={() => void handleAdd()}
        >
          <ShoppingCart className="size-3.5" />
          {product.stock <= 0 ? 'Out of stock' : 'Add'}
        </Button>
      </div>
    </motion.article>
  );
}

interface ProductExploreSectionProps {
  products: Product[];
}

export function ProductExploreSection({ products }: ProductExploreSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Explore Products</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Shop products from verified local businesses
            </p>
          </div>
          <Link href="/search?q=products" className="text-sm font-semibold text-primary hover:underline">
            See more →
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="sm:min-w-0"
            >
              <MarketplaceProductCard product={product} className="sm:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
