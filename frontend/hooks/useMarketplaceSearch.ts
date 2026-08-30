'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  searchMarketplace,
  type SearchFilters,
  type SearchResponse,
} from '@/services/searchService';

export function useMarketplaceSearch(initial: SearchFilters = {}) {
  const [filters, setFilters] = useState<SearchFilters>(initial);
  const [result, setResult] = useState<SearchResponse>({ data: [], total: 0, source: 'fallback' });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runSearch = useCallback((nextFilters?: SearchFilters) => {
    const active = nextFilters ?? filters;
    startTransition(async () => {
      setError(null);
      try {
        const response = await searchMarketplace(active);
        setResult(response);
      } catch {
        setError('Search failed. Please try again.');
      }
    });
  }, [filters]);

  useEffect(() => {
    runSearch(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filters,
    setFilters,
    result,
    error,
    isSearching: isPending,
    runSearch,
  };
}
