'use client';

import Link from 'next/link';
import { CategoryIconTile } from '@/components/category/CategoryThemeScope';
import type { DisplayCategory } from '@/lib/displayCategories';
import { cn } from '@/lib/utils';

interface PopularCategoriesGridProps {
  categories: DisplayCategory[];
  selectedSlug: string | null;
  onSelect: (category: DisplayCategory | null) => void;
  className?: string;
}

export function PopularCategoriesGrid({
  categories,
  selectedSlug,
  onSelect,
  className,
}: PopularCategoriesGridProps) {
  return (
    <section className={cn('border-b border-border/40 bg-card', className)}>
      <div className="container py-8 sm:py-10">
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              — Explore
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-dark sm:text-[1.75rem]">
              Popular Categories
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover businesses, shops and services near you
            </p>
          </div>
          <Link
            href="/categories"
            className="mt-1 shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedSlug === cat.slug;
            return (
              <div key={cat.slug} className="group flex flex-col items-center gap-2 text-center">
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : cat)}
                  className="outline-none"
                  title={cat.name}
                >
                  <CategoryIconTile themeColor={cat.themeColor} active={active}>
                    <Icon className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} />
                  </CategoryIconTile>
                </button>
                <Link
                  href={`/categories/${cat.slug}`}
                  className={cn(
                    'line-clamp-2 max-w-[5.5rem] text-[11px] font-medium leading-tight transition hover:underline sm:max-w-[6.5rem] sm:text-xs',
                    active ? 'text-primary' : 'text-foreground group-hover:text-primary'
                  )}
                  style={active ? { color: cat.themeColor } : undefined}
                >
                  {cat.name}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
