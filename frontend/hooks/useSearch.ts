'use client';

import { useCallback, useMemo, useState } from 'react';
import { CATEGORIES } from '@/features/categories';
import { FEATURED_BUSINESSES, filterBusinesses } from '@/features/businesses';

export interface UseSearchOptions {
  initialQuery?: string;
  initialCategory?: string;
}

/**
 * Landing / quick business search hook.
 * For full marketplace search (products + businesses + filters),
 * use `useMarketplaceSearch` from `@/hooks/useMarketplaceSearch`.
 */
export function useSearch(options: UseSearchOptions = {}) {
  const { initialQuery = '', initialCategory = '' } = options;

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [isSearching, setIsSearching] = useState(false);

  const results = useMemo(() => {
    return filterBusinesses(FEATURED_BUSINESSES, query, category || undefined);
  }, [query, category]);

  const categoryOptions = useMemo(
    () => CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
    []
  );

  const submitSearch = useCallback(() => {
    setIsSearching(true);
    window.setTimeout(() => setIsSearching(false), 400);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setCategory('');
  }, []);

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    categoryOptions,
    isSearching,
    submitSearch,
    clearSearch,
    hasFilters: Boolean(query.trim() || category),
  };
}

export { useMarketplaceSearch } from './useMarketplaceSearch';
