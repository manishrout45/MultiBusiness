import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsPageClient } from '@/features/products/ProductsPageClient';

export const metadata: Metadata = {
  title: 'Products — LocalMart',
  description: 'Browse products from local businesses on LocalMart.',
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-sm text-muted-foreground">Loading products…</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
