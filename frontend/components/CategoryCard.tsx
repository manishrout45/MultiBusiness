'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Category } from '@/features/categories';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={cn('h-full', className)}
    >
      <Link
        href={`/categories/${category.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-6" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {category.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
        <p className="mt-4 text-xs font-medium text-primary">
          {category.businessCount}+ businesses
        </p>
      </Link>
    </motion.div>
  );
}
