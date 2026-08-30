import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CategoryIconTile, CategoryThemeScope } from '@/components/category/CategoryThemeScope';
import { BusinessCard } from '@/components/BusinessCard';
import {
  buildDisplayCategories,
  findDisplayCategory,
  type DisplayCategory,
} from '@/lib/displayCategories';
import { DEFAULT_CATEGORY_THEME } from '@/lib/categoryTheme';
import { fetchBusinesses } from '@/services/businessService';
import type { Business } from '@/features/businesses';
import { listCategories } from '@/services/categoryService';
import NotFound from '@/app/not-found';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState<DisplayCategory | null>(null);

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
      }

      const result = await fetchBusinesses({
        categoryId: display?.id,
        category: slug,
        limit: 24,
      });

      if (!cancelled) {
        setBusinesses(result.data);
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
      <div className="border-b border-border/60 bg-[hsl(var(--category-theme-soft))]">
        <div className="container py-10 md:py-14">
          <p className="text-sm text-muted-foreground">
            <Link href="/categories" className="hover:text-primary">
              Categories
            </Link>{' '}
            / <span className="text-foreground">{category.name}</span>
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
                {category.description || 'Browse local businesses in this category.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {businesses.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
              No businesses in this category yet. Try Search or browse all businesses.
            </p>
          ) : (
            businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))
          )}
        </div>
      </div>
    </CategoryThemeScope>
  );
}
