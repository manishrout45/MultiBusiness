'use client';

import { cn } from '@/lib/utils';

export type SearchResultTab = 'all' | 'stores' | 'products' | 'services';

interface SearchResultTabsProps {
  value: SearchResultTab;
  onChange: (tab: SearchResultTab) => void;
  counts: { all: number; stores: number; products: number; services: number };
  query: string;
  className?: string;
}

const TABS: { id: SearchResultTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'stores', label: 'Stores' },
  { id: 'products', label: 'Products' },
  { id: 'services', label: 'Services' },
];

export function SearchResultTabs({
  value,
  onChange,
  counts,
  query,
  className,
}: SearchResultTabsProps) {
  if (!query.trim()) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm text-muted-foreground">
        Search results for{' '}
        <span className="font-semibold text-foreground">&ldquo;{query.trim()}&rdquo;</span>
      </p>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1 hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
              value === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'rounded-md px-1.5 text-[10px]',
                value === tab.id ? 'bg-primary-foreground/20' : 'bg-card text-muted-foreground'
              )}
            >
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
