'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Store } from 'lucide-react';
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
  icon?: LucideIcon;
}

interface CategoryCardProps {
  category: CategoryItem;
  className?: string;
  hrefBase?: string;
  index?: number;
}

export function CategoryCard({
  category,
  className,
  hrefBase = '/categories',
  index = 0,
}: CategoryCardProps) {
  const themeColor = category.themeColor ?? DEFAULT_CATEGORY_THEME;
  const Icon = category.icon ?? Store;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.35), duration: 0.35 }}
      whileHover={{ y: -4 }}
      className={cn('h-full', className)}
    >
      <Link
        href={`${hrefBase}/${category.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-transparent hover:shadow-lg"
        style={{
          backgroundImage: `linear-gradient(160deg, ${themeColor}12 0%, transparent 55%)`,
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <CategoryIconTile themeColor={themeColor} className="transition group-hover:scale-105">
            <Icon className="size-5 sm:size-6" strokeWidth={1.75} />
          </CategoryIconTile>
          <span
            className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-white/80 text-muted-foreground opacity-0 transition group-hover:opacity-100"
            style={{ color: themeColor, borderColor: `${themeColor}40` }}
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        <h3 className="text-base font-bold tracking-tight text-dark sm:text-lg">{category.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {category.description || `Explore local ${category.name.toLowerCase()} near you.`}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
          <span className="text-xs font-medium" style={{ color: themeColor }}>
            {category.businessCount != null && category.businessCount > 0
              ? `${category.businessCount} businesses`
              : 'Browse vendors'}
          </span>
          <span className="text-xs font-semibold text-muted-foreground transition group-hover:text-foreground">
            View →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
