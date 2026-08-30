'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DEFAULT_SEARCH_SUGGESTIONS } from './data';
import { SearchSuggestionsPanel } from './SearchSuggestionsPanel';
import {
  SearchCategoryDropdown,
  type SearchCategoryId,
} from './SearchCategoryDropdown';
import { cn } from '@/lib/utils';

interface MarketplaceSearchBarProps {
  className?: string;
  inputClassName?: string;
  showCategoryDropdown?: boolean;
  /** @deprecated use showCategoryDropdown */
  showTypeDropdown?: boolean;
  defaultQuery?: string;
  defaultCategory?: SearchCategoryId;
  compact?: boolean;
}

export function MarketplaceSearchBar({
  className,
  inputClassName,
  showCategoryDropdown,
  showTypeDropdown = true,
  defaultQuery = '',
  defaultCategory = 'all',
  compact = false,
}: MarketplaceSearchBarProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [category, setCategory] = useState<SearchCategoryId>(defaultCategory);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const showDropdown = showCategoryDropdown ?? showTypeDropdown;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setFocused(false);
        setCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'all') params.set('category', category);
    router.push(`/search${params.toString() ? `?${params}` : ''}`);
    setFocused(false);
    setCategoryOpen(false);
  }

  const showSuggestions = focused && !categoryOpen;

  return (
    <div ref={rootRef} className={cn('relative min-w-0 flex-1', className)}>
      <form
        onSubmit={submit}
        className={cn(
          'flex w-full items-stretch overflow-hidden border-2 border-primary/25 bg-white shadow-sm transition focus-within:border-primary focus-within:shadow-md',
          compact ? 'h-10 rounded-lg' : 'h-11 rounded-xl sm:h-12 sm:rounded-2xl'
        )}
      >
        {showDropdown && (
          <SearchCategoryDropdown
            value={category}
            onChange={setCategory}
            open={categoryOpen}
            onOpenChange={setCategoryOpen}
            className="flex"
          />
        )}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            setCategoryOpen(false);
          }}
          placeholder="Search products, businesses, categories, services..."
          className={cn(
            'min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0',
            compact ? 'h-10 text-sm' : 'h-11 text-sm sm:h-12 sm:text-[15px]',
            inputClassName
          )}
        />
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            'flex shrink-0 items-center justify-center bg-primary text-primary-foreground transition hover:bg-primary/90',
            compact ? 'w-11' : 'w-12 sm:w-14'
          )}
        >
          <Search className={cn(compact ? 'size-4' : 'size-5')} strokeWidth={2.25} />
        </button>
      </form>

      {showSuggestions && (
        <SearchSuggestionsPanel
          groups={DEFAULT_SEARCH_SUGGESTIONS}
          filter="all"
          query={query}
          onSelect={() => setFocused(false)}
        />
      )}
    </div>
  );
}
