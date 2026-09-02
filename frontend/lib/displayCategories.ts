import type { LucideIcon } from 'lucide-react';
import { Store } from 'lucide-react';
import {
  POPULAR_CATEGORIES,
  type PopularCategoryItem,
} from '@/lib/popularCategories';
import { normalizeHexColor } from '@/lib/categoryTheme';
import type { CategoryDto } from '@/services/categoryService';

export interface DisplayCategory extends PopularCategoryItem {
  id?: string;
  themeColor: string;
  description?: string;
  businessCount?: number;
}

const DEFAULT_THEMES: Record<string, string> = {
  'grocery-store': '#16A34A',
  'cloth-store': '#7C3AED',
  'electronic-shop': '#2563EB',
  'mobile-accessories': '#0891B2',
  pharmacy: '#DC2626',
  'restaurant-cafe': '#EA580C',
  'beauty-cosmetics': '#DB2777',
  'hardware-store': '#78716C',
  'bakery-shop': '#D97706',
  'book-store': '#4F46E5',
  'xerox-print-shop': '#64748B',
  'tour-travel-agency': '#0D9488',
  'real-estate': '#484AAA',
  'jewellery-shop': '#CA8A04',
  'footwear-shop': '#9333EA',
  'gift-shop': '#E11D48',
  'computer-laptop-store': '#1D4ED8',
  'furniture-store': '#B45309',
  'watch-shop': '#475569',
  'salon-beauty-parlour': '#BE185D',
  'car-wash-shop': '#0284C7',
  'car-showroom': '#1E40AF',
  'bike-showroom': '#059669',
  'bike-service-repair': '#57534E',
  'paint-sanitary-shop': '#F59E0B',
  'home-decor': '#A855F7',
  'photo-studio': '#6366F1',
  hotel: '#0F766E',
};

export function defaultThemeForSlug(slug: string): string {
  return DEFAULT_THEMES[slug] ?? '#484AAA';
}

/** Merge home popular categories with API data (colors + ids from admin). */
export function buildDisplayCategories(apiCategories: CategoryDto[]): DisplayCategory[] {
  const bySlug = new Map(apiCategories.map((c) => [c.slug, c]));

  return POPULAR_CATEGORIES.map((popular) => {
    const api = bySlug.get(popular.slug);
    return {
      ...popular,
      id: api?.id,
      description: api?.description,
      businessCount: api?.businessCount,
      themeColor: normalizeHexColor(api?.themeColor ?? defaultThemeForSlug(popular.slug)),
    };
  });
}

export function findDisplayCategory(
  slug: string,
  apiCategories: CategoryDto[]
): DisplayCategory | null {
  const merged = buildDisplayCategories(apiCategories);
  const fromPopular = merged.find((c) => c.slug === slug);
  if (fromPopular) return fromPopular;

  const api = apiCategories.find((c) => c.slug === slug);
  if (!api) return null;

  return {
    slug: api.slug,
    name: api.name,
    keywords: [api.name.toLowerCase(), api.slug.replace(/-/g, ' ')],
    icon: iconForCategory(api.slug),
    id: api.id,
    description: api.description,
    businessCount: api.businessCount,
    themeColor: api.themeColor,
  };
}

export function iconForCategory(slug: string): LucideIcon {
  const found = POPULAR_CATEGORIES.find((c) => c.slug === slug);
  return found?.icon ?? Store;
}
