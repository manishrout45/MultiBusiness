'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterPanel } from '@/features/search/FilterPanel';
import { MarketplaceSearchBar } from '@/features/search/SearchBar';
import { SearchResultCard } from '@/features/search/SearchResultCard';
import { useMarketplaceSearch } from '@/hooks/useMarketplaceSearch';

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { filters, setFilters, result, error, isSearching, runSearch } = useMarketplaceSearch({
    query: initialQuery,
  });

  useEffect(() => {
    if (initialQuery && initialQuery !== filters.query) {
      const next = { ...filters, query: initialQuery };
      setFilters(next);
      runSearch(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Search marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Find products, businesses, categories, and locations in one place.
        </p>
      </div>

      <div className="mb-8 max-w-3xl">
        <MarketplaceSearchBar
          query={filters.query || ''}
          onQueryChange={(query) => setFilters({ ...filters, query })}
          onSubmit={() => runSearch(filters)}
          isSearching={isSearching}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            runSearch(next);
          }}
        />

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {result.total} result{result.total === 1 ? '' : 's'}
            {result.source === 'fallback' ? ' · demo data' : ''}
          </p>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {isSearching ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
          ) : result.data.length === 0 ? (
            <EmptyState
              title="No matches found"
              description="Try another keyword or adjust your filters."
            />
          ) : (
            <div className="space-y-4">
              {result.data.map((item) => (
                <SearchResultCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
