'use client';

import { motion } from 'framer-motion';
import { Loader2, MapPin, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categoryOptions: { value: string; label: string }[];
  onSubmit?: () => void;
  isSearching?: boolean;
  className?: string;
  size?: 'default' | 'large';
}

export function SearchBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categoryOptions,
  onSubmit,
  isSearching = false,
  className,
  size = 'default',
}: SearchBarProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn(
        'w-full rounded-2xl border border-border/80 bg-card/95 p-3 shadow-lg shadow-primary/5 backdrop-blur-sm',
        size === 'large' && 'p-4 md:p-5',
        className
      )}
      whileFocus={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search businesses, services, or locations..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className={cn('h-11 pl-10', size === 'large' && 'h-12 text-base md:h-14')}
            aria-label="Search businesses"
          />
        </div>

        <div className="relative md:w-56">
          <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cn(
              'flex h-11 w-full appearance-none rounded-md border border-input bg-background py-2 pl-10 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              size === 'large' && 'h-12 text-base md:h-14'
            )}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          size={size === 'large' ? 'lg' : 'default'}
          className="h-11 w-full md:h-auto md:w-auto md:min-w-[120px]"
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="animate-spin" />
              Searching
            </>
          ) : (
            <>
              <MapPin />
              Search
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
