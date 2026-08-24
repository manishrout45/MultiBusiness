import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { apiRequest } from '@/lib/api';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessCount?: number;
}

export async function listCategories(): Promise<CategoryDto[]> {
  try {
    const res = await apiRequest<{ data: Record<string, unknown>[] }>('/categories', {
      next: { revalidate: 120 },
    });
    if (res.data?.length) {
      return res.data.map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ''),
        slug: String(row.slug ?? ''),
        description: String(row.description ?? ''),
        businessCount: Number(row.business_count ?? 0),
      }));
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
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDto | null> {
  const all = await listCategories();
  return all.find((c) => c.slug === slug) ?? null;
}
