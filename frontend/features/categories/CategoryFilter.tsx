'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CategoryItem } from '@/features/categories/CategoryCard';

interface CategoryFilterProps {
  query: string;
  onQueryChange: (value: string) => void;
  selected: string;
  onSelectedChange: (value: string) => void;
  categories: CategoryItem[];
}

export function CategoryFilter({
  query,
  onQueryChange,
  selected,
  onSelectedChange,
  categories,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search categories…"
        className="sm:flex-1"
        aria-label="Search categories"
      />
      <Select value={selected || 'all'} onValueChange={(v) => onSelectedChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="sm:w-56">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
