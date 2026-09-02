'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CategoryGrid } from '@/features/categories/CategoryGrid';
import type { CategoryItem } from '@/features/categories/CategoryCard';
import { cn } from '@/lib/utils';

interface CategoriesExplorerProps {
  categories: CategoryItem[];
  hrefBase?: string;
  title?: string;
  description?: string;
}

export function CategoriesExplorer({
  categories,
  hrefBase = '/categories',
  title = 'All Categories',
  description = 'Discover every type of local business on LocalMart — shops, services, and more.',
}: CategoriesExplorerProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q)
    );
  }, [categories, query]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-[hsl(var(--secondary))] via-card to-card px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 size-40 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <LayoutGrid className="size-3.5" />
            Browse
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>

          <div className="relative mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="h-12 rounded-2xl border-border/70 bg-white/90 pl-10 shadow-sm"
              aria-label="Search categories"
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> categor
            {filtered.length === 1 ? 'y' : 'ies'}
            {query.trim() ? ' found' : ' available'}
          </p>
        </div>
      </div>

      {!query.trim() && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 8).map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setQuery(c.name)}
              className={cn(
                'rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition',
                'hover:border-primary/40 hover:text-primary'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <CategoryGrid categories={filtered} hrefBase={hrefBase} />

      <div className="rounded-2xl border border-border/60 bg-muted/30 px-5 py-6 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">
          Looking for something specific?{' '}
          <Link href="/" className="font-semibold text-primary hover:underline">
            Search on the home page
          </Link>{' '}
          or{' '}
          <Link href="/businesses" className="font-semibold text-primary hover:underline">
            browse all businesses
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
