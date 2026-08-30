'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { useSearch } from '@/hooks/useSearch';

export function BusinessesSearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const {
    query,
    setQuery,
    category,
    setCategory,
    categoryOptions,
    submitSearch,
    isSearching,
  } = useSearch({ initialQuery, initialCategory });

  useEffect(() => {
    setQuery(initialQuery);
    setCategory(initialCategory);
  }, [initialQuery, initialCategory, setQuery, setCategory]);

  const onSubmit = () => {
    submitSearch();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    startTransition(() => {
      router.push(`/businesses${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  return (
    <SearchBar
      query={query}
      onQueryChange={setQuery}
      category={category}
      onCategoryChange={setCategory}
      categoryOptions={categoryOptions}
      onSubmit={onSubmit}
      isSearching={isSearching || isPending}
      size="large"
    />
  );
}
