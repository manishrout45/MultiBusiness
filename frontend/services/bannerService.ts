import { apiRequest } from '@/lib/api';

export interface HomeBanner {
  id: string;
  title: string;
  imageUrl: string | null;
  linkUrl: string | null;
}

const DEFAULT_BANNERS: HomeBanner[] = [
  {
    id: 'default-1',
    title: 'Discover local businesses near you',
    imageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=500&fit=crop',
    linkUrl: '/categories',
  },
  {
    id: 'default-2',
    title: 'Shop fresh products from trusted vendors',
    imageUrl:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=500&fit=crop',
    linkUrl: '/products',
  },
];

function mapBanner(row: Record<string, unknown>): HomeBanner {
  return {
    id: String(row.id),
    title: String(row.title ?? 'LocalMart'),
    imageUrl: row.image_path ? String(row.image_path) : null,
    linkUrl: row.link_url ? String(row.link_url) : null,
  };
}

export async function fetchHomeBanners(): Promise<HomeBanner[]> {
  try {
    const res = await apiRequest<{ data: Record<string, unknown>[] }>('/banners', {
      next: { revalidate: 60 },
    });
    const mapped = (res.data || []).map(mapBanner);
    return mapped.length ? mapped : DEFAULT_BANNERS;
  } catch {
    return DEFAULT_BANNERS;
  }
}
