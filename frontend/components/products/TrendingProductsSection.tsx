'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import type { Product } from '@/features/products';

interface TrendingProductsSectionProps {
  products: Product[];
}

export function TrendingProductsSection({ products }: TrendingProductsSectionProps) {
  return (
    <section className="lm-section">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="lm-section-title">Trending Products</h2>
            <p className="lm-section-sub">Shop products from verified local businesses</p>
          </div>
          <Link href="/search?q=products" className="text-sm font-semibold text-primary hover:underline">
            See more →
          </Link>
        </div>

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="w-[168px] shrink-0 snap-start sm:w-auto sm:min-w-0"
            >
              <ProductCard product={product} className="h-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
