'use client';

import { useRouter } from 'next/navigation';
import { SectionReveal } from '@/components/layout/SectionReveal';
import { SearchBar } from '@/components/SearchBar';
import { useSearch } from '@/hooks/useSearch';

export function SearchSection() {
  const router = useRouter();
  const {
    query,
    setQuery,
    category,
    setCategory,
    categoryOptions,
    isSearching,
    submitSearch,
    results,
    hasFilters,
  } = useSearch();

  const handleSearch = () => {
    submitSearch();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    router.push(`/businesses${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <SectionReveal className="border-b border-border/60 bg-muted/30 py-14 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Find what you need nearby
          </h2>
          <p className="mt-3 text-muted-foreground">
            Search by business name, category, or location across your local marketplace.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            categoryOptions={categoryOptions}
            onSubmit={handleSearch}
            isSearching={isSearching}
          />
        </div>

        {hasFilters && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? '' : 's'} found
            {query ? ` for “${query}”` : ''}
            {category ? ` in ${categoryOptions.find((c) => c.value === category)?.label}` : ''}
          </p>
        )}
      </div>
    </SectionReveal>
  );
}
