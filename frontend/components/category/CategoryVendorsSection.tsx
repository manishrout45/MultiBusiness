'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { MapPin, Search } from 'lucide-react';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessCardSkeleton } from '@/components/discovery';
import { SortFilterBar, type SortOption } from '@/components/discovery/SortFilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Business } from '@/features/businesses';
import { fetchBusinesses } from '@/services/businessService';
import type { DisplayCategory } from '@/lib/displayCategories';
import { cn } from '@/lib/utils';

interface CategoryVendorsSectionProps {
  category: DisplayCategory;
  className?: string;
}

function sortVendors(list: Business[], sort: SortOption): Business[] {
  const next = [...list];
  next.sort((a, b) => {
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'popularity') {
      return (
        (b.reviewCount || 0) +
        (b.featured ? 50 : 0) -
        ((a.reviewCount || 0) + (a.featured ? 50 : 0))
      );
    }
    return a.name.localeCompare(b.name);
  });
  return next;
}

export function CategoryVendorsSection({ category, className }: CategoryVendorsSectionProps) {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [city, setCity] = useState('');
  const [activeCity, setActiveCity] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>('rating');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCities = useCallback(async () => {
    const result = await fetchBusinesses({
      categoryId: category.id,
      category: category.slug,
      limit: 100,
    });
    const cities = [
      ...new Set(
        result.data.map((b) => b.city?.trim()).filter((c): c is string => Boolean(c))
      ),
    ].sort((a, b) => a.localeCompare(b));
    setCityOptions(cities);
  }, [category.id, category.slug]);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    const result = await fetchBusinesses({
      query: activeQuery,
      categoryId: category.id,
      category: category.slug,
      city: activeCity || undefined,
      minRating: minRating ?? undefined,
      limit: 60,
    });
    setBusinesses(result.data);
    setLoading(false);
  }, [activeQuery, activeCity, category.id, category.slug, minRating]);

  useEffect(() => {
    void loadCities();
  }, [loadCities]);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  const sortedBusinesses = useMemo(
    () => sortVendors(businesses, sort),
    [businesses, sort]
  );

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
  }

  function applyCityFilter(nextCity: string) {
    setCity(nextCity);
    setActiveCity(nextCity.trim());
  }

  return (
    <div className={cn('space-y-6', className)}>
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--category-theme-border))] bg-[hsl(var(--category-theme-soft))]/40 p-4 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={`Search ${category.name.toLowerCase()} vendors…`}
            className="h-11 rounded-xl border-border/70 bg-card pl-10"
          />
        </div>
        <div className="relative min-w-0 sm:w-52">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => setActiveCity(city.trim())}
            list="category-city-options"
            placeholder="Filter by city"
            className="h-11 rounded-xl border-border/70 bg-card pl-10"
          />
          <datalist id="category-city-options">
            {cityOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <Button type="submit" className="h-11 shrink-0 rounded-xl px-6">
          Search
        </Button>
      </form>

      {cityOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular locations
          </span>
          <button
            type="button"
            onClick={() => applyCityFilter('')}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              !activeCity
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40'
            )}
          >
            All cities
          </button>
          {cityOptions.slice(0, 8).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => applyCityFilter(c)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                activeCity === c
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <SortFilterBar
        sort={sort}
        onSortChange={setSort}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        showPriceSort={false}
        showDistanceSort={false}
      />

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{sortedBusinesses.length}</span>{' '}
          vendor{sortedBusinesses.length === 1 ? '' : 's'} in {category.name}
          {activeCity ? ` · ${activeCity}` : ''}
          {activeQuery ? ` · “${activeQuery}”` : ''}
        </p>
        {(activeQuery || activeCity || minRating != null) && (
          <button
            type="button"
            className="text-xs font-semibold text-primary hover:underline"
            onClick={() => {
              setSearchInput('');
              setActiveQuery('');
              setCity('');
              setActiveCity('');
              setMinRating(null);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BusinessCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedBusinesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <p className="font-medium text-foreground">No vendors match your filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term, city, or rating filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sortedBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
