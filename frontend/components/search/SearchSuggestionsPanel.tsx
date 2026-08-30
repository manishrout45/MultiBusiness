'use client';

import Link from 'next/link';
import { Building2, FolderTree, MapPin, Package, Search } from 'lucide-react';
import type { SearchFilterType, SearchSuggestionGroup } from './types';
import { cn } from '@/lib/utils';

const GROUP_ICONS = {
  businesses: Building2,
  products: Package,
  categories: FolderTree,
  locations: MapPin,
} as const;

interface SearchSuggestionsPanelProps {
  groups: SearchSuggestionGroup[];
  filter: SearchFilterType;
  query: string;
  onSelect?: () => void;
  className?: string;
}

export function SearchSuggestionsPanel({
  groups,
  filter,
  query,
  onSelect,
  className,
}: SearchSuggestionsPanelProps) {
  const normalized = query.trim().toLowerCase();

  const visible = groups
    .filter((g) => filter === 'all' || filter === g.type)
    .map((group) => ({
      ...group,
      items: normalized
        ? group.items.filter((item) => item.label.toLowerCase().includes(normalized))
        : group.items,
    }))
    .filter((g) => g.items.length > 0);

  if (!visible.length) {
    return (
      <div
        className={cn(
          'absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border bg-card p-4 marketplace-shadow-lg',
          className
        )}
      >
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="size-4 shrink-0" />
          {normalized ? `No results for “${query.trim()}”` : 'Start typing to search LocalMart'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(420px,70vh)] overflow-y-auto rounded-2xl border bg-card p-3 marketplace-shadow-lg',
        className
      )}
    >
      {visible.map((group) => {
        const Icon = GROUP_ICONS[group.type];
        return (
          <div key={group.type} className="mb-2 last:mb-0">
            <p className="mb-1.5 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Icon className="size-3.5 text-primary" />
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onSelect}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-secondary"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-4" />
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
