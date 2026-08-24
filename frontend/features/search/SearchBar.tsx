'use client';

import { motion } from 'framer-motion';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface MarketplaceSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit?: () => void;
  isSearching?: boolean;
  className?: string;
  placeholder?: string;
}

export function MarketplaceSearchBar({
  query,
  onQueryChange,
  onSubmit,
  isSearching,
  className,
  placeholder = 'Search products, businesses, categories, locations…',
}: MarketplaceSearchBarProps) {
  return (
    <motion.form
      className={cn('flex w-full flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center', className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      whileFocus={{ scale: 1.005 }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 pl-10"
          aria-label="Search marketplace"
        />
      </div>
      <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isSearching}>
        {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
        Search
      </Button>
    </motion.form>
  );
}

export { MarketplaceSearchBar as SearchBar };
