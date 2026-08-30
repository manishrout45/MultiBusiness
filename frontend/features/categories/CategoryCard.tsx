'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CategoryIconTile } from '@/components/category/CategoryThemeScope';
import { DEFAULT_CATEGORY_THEME } from '@/lib/categoryTheme';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessCount?: number;
  themeColor?: string;
}

interface CategoryCardProps {
  category: CategoryItem;
  className?: string;
  hrefBase?: string;
}

export function CategoryCard({
  category,
  className,
  hrefBase = '/categories',
}: CategoryCardProps) {
  const themeColor = category.themeColor ?? DEFAULT_CATEGORY_THEME;

  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} className={cn('h-full', className)}>
      <Link
        href={`${hrefBase}/${category.slug}`}
        className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:shadow-md"
        style={{ borderColor: `${themeColor}33` }}
      >
        <CategoryIconTile themeColor={themeColor} className="mb-4">
          <span className="text-lg font-bold">{category.name.slice(0, 1)}</span>
        </CategoryIconTile>
        <h3 className="text-lg font-semibold" style={{ color: themeColor }}>
          {category.name}
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{category.description}</p>
        {category.businessCount != null && category.businessCount > 0 ? (
          <p className="mt-4 text-xs font-medium" style={{ color: themeColor }}>
            {category.businessCount}+ listings
          </p>
        ) : null}
      </Link>
    </motion.div>
  );
}
