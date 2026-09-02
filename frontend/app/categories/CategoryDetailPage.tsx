'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CategoryIconTile, CategoryThemeScope } from '@/components/category/CategoryThemeScope';
import { CategoryVendorsSection } from '@/components/category/CategoryVendorsSection';
import {
  buildDisplayCategories,
  findDisplayCategory,
  type DisplayCategory,
} from '@/lib/displayCategories';
import { DEFAULT_CATEGORY_THEME } from '@/lib/categoryTheme';
import { listCategories } from '@/services/categoryService';
import NotFound from '@/app/not-found';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<DisplayCategory | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoaded(true);
      return;
    }
    let cancelled = false;

    (async () => {
      const allCategories = await listCategories();
      const display = findDisplayCategory(slug, allCategories);

      if (!cancelled) {
        setCategory(display);
        if (display) document.title = `${display.name} | LocalMart`;
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loaded && !category) return <NotFound />;

  if (!category || !loaded) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  const themeColor = category.themeColor ?? DEFAULT_CATEGORY_THEME;
  const Icon = category.icon;

  return (
    <CategoryThemeScope themeColor={themeColor} className="min-h-[60vh] bg-background">
      <div className="border-b border-[hsl(var(--category-theme-border))] bg-[hsl(var(--category-theme-soft))]">
        <div className="container py-10 md:py-14">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            {' / '}
            <Link href="/categories" className="hover:text-primary">
              Categories
            </Link>
            {' / '}
            <span className="text-foreground">{category.name}</span>
          </p>

          <div className="mt-4 flex items-start gap-4">
            <CategoryIconTile themeColor={themeColor} active>
              <Icon className="size-7" strokeWidth={1.75} />
            </CategoryIconTile>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-dark md:text-4xl">
                {category.name}
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {category.description ||
                  `Browse trusted ${category.name.toLowerCase()} vendors near you.`}
              </p>
              {category.businessCount != null && category.businessCount > 0 ? (
                <p className="mt-2 text-sm font-medium text-primary">
                  {category.businessCount} businesses listed
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10 md:py-12">
        <CategoryVendorsSection category={category} />
      </div>
    </CategoryThemeScope>
  );
}
