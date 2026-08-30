import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { normalizeHexColor } from '@/lib/categoryTheme';
import { defaultThemeForSlug } from '@/lib/displayCategories';
import { apiRequest } from '@/lib/api';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessCount?: number;
  themeColor: string;
}

function mapCategoryRow(row: Record<string, unknown>): CategoryDto {
  const slug = String(row.slug ?? '');
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    slug,
    description: String(row.description ?? ''),
    businessCount: Number(row.business_count ?? 0),
    themeColor: normalizeHexColor(
      (row.theme_color as string) ?? defaultThemeForSlug(slug)
    ),
  };
}

export async function listCategories(): Promise<CategoryDto[]> {
  try {
    const res = await apiRequest<{ data: Record<string, unknown>[] }>('/categories', {
      next: { revalidate: 120 },
    });
    if (res.data?.length) {
      return res.data.map(mapCategoryRow);
    }
  } catch {
    // fallback below
  }

  return MARKETPLACE_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    businessCount: 0,
    themeColor: defaultThemeForSlug(c.slug),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDto | null> {
  try {
    const res = await apiRequest<{ data: Record<string, unknown> }>(`/categories/${slug}`, {
      next: { revalidate: 120 },
    });
    if (res.data) return mapCategoryRow(res.data);
  } catch {
    // fallback to list
  }

  const all = await listCategories();
  return all.find((c) => c.slug === slug) ?? null;
}
