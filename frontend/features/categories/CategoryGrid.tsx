'use client';

import { CategoryCard, type CategoryItem } from '@/features/categories/CategoryCard';

interface CategoryGridProps {
  categories: CategoryItem[];
  hrefBase?: string;
}

export function CategoryGrid({ categories, hrefBase }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} hrefBase={hrefBase} />
      ))}
    </div>
  );
}
