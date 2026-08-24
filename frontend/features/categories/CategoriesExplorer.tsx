'use client';

import { useMemo, useState } from 'react';
import { CategoryFilter } from '@/features/categories/CategoryFilter';
import { CategoryGrid } from '@/features/categories/CategoryGrid';
import type { CategoryItem } from '@/features/categories/CategoryCard';

interface CategoriesExplorerProps {
  categories: CategoryItem[];
  hrefBase?: string;
  title?: string;
  description?: string;
}

export function CategoriesExplorer({
  categories,
  hrefBase = '/categories',
  title = 'Browse categories',
  description = 'Find businesses by industry and interest.',
}: CategoriesExplorerProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');

  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.includes(q);
      const matchesSelected = !selected || c.slug === selected;
      return matchesQuery && matchesSelected;
    });
  }, [categories, query, selected]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      <CategoryFilter
        query={query}
        onQueryChange={setQuery}
        selected={selected}
        onSelectedChange={setSelected}
        categories={categories}
      />
      <CategoryGrid categories={filtered} hrefBase={hrefBase} />
    </div>
  );
}
