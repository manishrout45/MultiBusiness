import { apiRequest } from '@/lib/api';

export interface HomeAnnouncement {
  id: string;
  title: string;
  description: string | null;
}

export async function fetchHomeAnnouncements(): Promise<HomeAnnouncement[]> {
  try {
    const res = await apiRequest<{
      data: Array<{ id: number; title: string; description?: string | null }>;
    }>('/announcements');
    return (res.data || []).map((row) => ({
      id: String(row.id),
      title: row.title,
      description: row.description ?? null,
    }));
  } catch {
    return [];
  }
}
