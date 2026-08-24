import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPageClient } from './SearchPageClient';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search products, businesses, categories, and locations.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-sm text-muted-foreground">Loading search…</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
