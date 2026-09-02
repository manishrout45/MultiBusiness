'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { CategoryIconTile } from '@/components/category/CategoryThemeScope';
import type { DisplayCategory } from '@/lib/displayCategories';
import { cn } from '@/lib/utils';

/** Approx width of one desktop category column. */
const DESKTOP_ITEM_WIDTH = 96;
const MOBILE_MAX = 8;

interface PopularCategoriesGridProps {
  categories: DisplayCategory[];
  className?: string;
}

export function PopularCategoriesGrid({ categories, className }: PopularCategoriesGridProps) {
  const desktopRowRef = useRef<HTMLDivElement>(null);
  const [desktopVisible, setDesktopVisible] = useState(8);

  useEffect(() => {
    const el = desktopRowRef.current;
    if (!el) return;

    function measure() {
      const width = el?.clientWidth ?? 0;
      const slots = Math.max(4, Math.floor(width / DESKTOP_ITEM_WIDTH));
      const cats = Math.max(3, slots - 1);
      setDesktopVisible(Math.min(cats, categories.length));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [categories.length]);

  const mobileCats = categories.slice(0, MOBILE_MAX);
  const desktopCats = categories.slice(0, desktopVisible);
  const desktopHasMore = categories.length > desktopVisible;

  return (
    <section className={cn('border-b border-border/40 bg-card', className)}>
      <div className="container py-3 sm:py-4 md:py-5">
        {/* Mobile: scroll up to 8 categories, Show all fixed on the right */}
        <div className="flex items-start gap-2.5 md:hidden">
          <div className="min-w-0 flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex w-max gap-2.5">
              {mobileCats.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="group flex w-[3.85rem] shrink-0 flex-col items-center gap-1 text-center outline-none"
                    title={cat.name}
                  >
                    <CategoryIconTile
                      themeColor={cat.themeColor}
                      active={false}
                      size="sm"
                      className="size-10 rounded-lg"
                    >
                      <Icon className="size-3.5" strokeWidth={1.75} />
                    </CategoryIconTile>
                    <span className="line-clamp-2 text-[9px] font-medium leading-tight text-foreground group-hover:text-primary">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            href="/categories"
            className="group flex w-[3.85rem] shrink-0 flex-col items-center gap-1 text-center outline-none"
          >
            <span className="flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <LayoutGrid className="size-3.5" />
            </span>
            <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-primary">
              Show all
            </span>
          </Link>
        </div>

        {/* Desktop / tablet: auto-fit centered row */}
        <div
          ref={desktopRowRef}
          className="hidden w-full items-start justify-evenly gap-2 md:flex"
        >
          {desktopCats.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex min-w-0 flex-1 basis-0 flex-col items-center gap-2 text-center outline-none"
                title={cat.name}
              >
                <CategoryIconTile
                  themeColor={cat.themeColor}
                  active={false}
                  className="transition group-hover:scale-105"
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </CategoryIconTile>
                <span className="line-clamp-2 max-w-[5.5rem] text-xs font-medium leading-tight text-foreground group-hover:text-primary group-hover:underline">
                  {cat.name}
                </span>
              </Link>
            );
          })}

          <Link
            href="/categories"
            className="group flex min-w-0 flex-1 basis-0 flex-col items-center gap-2 text-center outline-none"
          >
            <span className="flex size-[3.25rem] items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground sm:size-14">
              <LayoutGrid className="size-5" />
            </span>
            <span className="line-clamp-2 max-w-[5.5rem] text-xs font-semibold leading-tight text-primary">
              {desktopHasMore ? 'Show all' : 'All'}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
