import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoriesExplorer } from '@/features/categories';
import type { CategoryItem } from '@/features/categories/CategoryCard';
import {
  buildDisplayCategories,
  findDisplayCategory,
} from '@/lib/displayCategories';
import { listCategories } from '@/services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'All Categories | LocalMart';
    let cancelled = false;

    listCategories().then((api) => {
      if (cancelled) return;

      const popular = buildDisplayCategories(api);
      const bySlug = new Map(popular.map((c) => [c.slug, c]));

      // Prefer popular display set (icons + colors), then any extra API categories
      const merged: CategoryItem[] = popular.map((c) => ({
        id: c.id ?? c.slug,
        name: c.name,
        slug: c.slug,
        description: c.description || `Find trusted ${c.name.toLowerCase()} near you.`,
        businessCount: c.businessCount,
        themeColor: c.themeColor,
        icon: c.icon,
      }));

      for (const row of api) {
        if (bySlug.has(row.slug)) continue;
        const display = findDisplayCategory(row.slug, api);
        if (!display) continue;
        merged.push({
          id: display.id ?? display.slug,
          name: display.name,
          slug: display.slug,
          description:
            display.description || `Find trusted ${display.name.toLowerCase()} near you.`,
          businessCount: display.businessCount,
          themeColor: display.themeColor,
          icon: display.icon,
        });
      }

      setCategories(merged);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-card">
      <div className="border-b border-border/40 bg-muted/20">
        <div className="container py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Categories</span>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        {loading ? (
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-3xl bg-muted" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        ) : (
          <CategoriesExplorer categories={categories} />
        )}
      </div>
    </div>
  );
}
