'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessCount?: number;
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
  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} className={cn('h-full', className)}>
      <Link
        href={`${hrefBase}/${category.slug}`}
        className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
          {category.name.slice(0, 1)}
        </div>
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{category.description}</p>
        {category.businessCount != null && (
          <p className="mt-4 text-xs font-medium text-primary">
            {category.businessCount}+ listings
          </p>
        )}
      </Link>
    </motion.div>
  );
}
