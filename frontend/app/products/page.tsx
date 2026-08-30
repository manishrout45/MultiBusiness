import { useEffect } from 'react';
import { Suspense } from 'react';
import { ProductsPageClient } from '@/features/products/ProductsPageClient';

export default function ProductsPage() {
  useEffect(() => {
    document.title = 'Products — LocalMart';
  }, []);

  return (
    <Suspense fallback={<div className="container py-16 text-sm text-muted-foreground">Loading products…</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
