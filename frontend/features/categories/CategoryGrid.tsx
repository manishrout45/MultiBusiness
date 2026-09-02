'use client';

import { CategoryCard, type CategoryItem } from '@/features/categories/CategoryCard';

interface CategoryGridProps {
  categories: CategoryItem[];
  hrefBase?: string;
}

export function CategoryGrid({ categories, hrefBase }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-medium text-foreground">No categories match your search</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or clear filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {categories.map((category, index) => (
        <CategoryCard
          key={category.id || category.slug}
          category={category}
          hrefBase={hrefBase}
          index={index}
        />
      ))}
    </div>
  );
}
