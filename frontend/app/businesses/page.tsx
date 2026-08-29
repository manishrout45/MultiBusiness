import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BusinessCard } from '@/components/BusinessCard';
import { BusinessesSearchPanel } from '@/components/businesses/BusinessesSearchPanel';
import { fetchBusinesses } from '@/services/businessService';
import type { BusinessListResponse } from '@/features/businesses';

export default function BusinessesPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const city = searchParams.get('city') || undefined;
  const [result, setResult] = useState<BusinessListResponse | null>(null);

  useEffect(() => {
    document.title = 'Browse businesses | LocalMart';
    let cancelled = false;
    fetchBusinesses({
      query: q,
      category,
      city,
      limit: 24,
    }).then((data) => {
      if (!cancelled) setResult(data);
    });
    return () => {
      cancelled = true;
    };
  }, [q, category, city]);

  return (
    <div className="pb-16">
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse businesses</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Find trusted local shops, services, and stores near you.
          </p>
          <div className="mt-8 max-w-3xl">
            <Suspense fallback={<div className="h-16 animate-pulse rounded-2xl bg-muted" />}>
              <BusinessesSearchPanel />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="container mt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {result
              ? `Showing ${result.data.length} business${result.data.length === 1 ? '' : 'es'}${
                  result.source === 'fallback' ? ' (demo data — API offline)' : ''
                }`
              : 'Loading businesses…'}
          </p>
        </div>

        {!result ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
        ) : result.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">No businesses found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {result.data.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
