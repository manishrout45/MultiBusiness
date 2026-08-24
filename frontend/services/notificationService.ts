import { apiRequest } from '@/lib/api';

export type NotificationAudience = 'vendor' | 'customer' | 'admin';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
  audience?: NotificationAudience;
}

function mapApiNotification(row: {
  id: number;
  title: string;
  message: string;
  type?: string;
  link?: string | null;
  is_read?: number | boolean;
  created_at: string;
}): AppNotification {
  return {
    id: String(row.id),
    title: row.title,
    message: row.message,
    type: row.type || 'general',
    link: row.link,
    read: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

function audienceForRole(role: string | undefined): NotificationAudience {
  if (role === 'super_admin' || role === 'business_manager') return 'admin';
  if (role === 'vendor') return 'vendor';
  return 'customer';
}

function listPath(audience: NotificationAudience): string | null {
  if (audience === 'vendor') return '/vendor/notifications';
  if (audience === 'customer') return '/customer/notifications';
  if (audience === 'admin') return '/manager/notifications';
  return null;
}

export const notificationService = {
  async list(
    role: string | undefined,
    token?: string | null
  ): Promise<AppNotification[]> {
    const audience = audienceForRole(role);
    if (!token) return [];

    const path = listPath(audience);
    if (!path) return [];

    try {
      const res = await apiRequest<{
        data: Array<{
          id: number;
          title: string;
          message: string;
          type?: string;
          link?: string | null;
          is_read?: number | boolean;
          created_at: string;
        }>;
      }>(path, { token });
      return (res.data || []).map((row) => ({
        ...mapApiNotification(row),
        audience,
      }));
    } catch {
      return [];
    }
  },

  async markRead(
    id: string,
    role: string | undefined,
    token?: string | null
  ): Promise<void> {
    if (!token || id.startsWith('n')) return;
    const audience = audienceForRole(role);
    const base = listPath(audience);
    if (!base || audience === 'admin') return;
    await apiRequest(`${base}/${id}/read`, { method: 'PATCH', token });
  },

  async markAllRead(role: string | undefined, token?: string | null): Promise<void> {
    if (!token) return;
    const audience = audienceForRole(role);
    const base = listPath(audience);
    if (!base || audience === 'admin') return;
    await apiRequest(`${base}/read-all`, { method: 'PATCH', token });
  },

  markReadLocal(id: string, items: AppNotification[]): AppNotification[] {
    return items.map((n) => (n.id === id ? { ...n, read: true } : n));
  },

  markAllReadLocal(items: AppNotification[]): AppNotification[] {
    return items.map((n) => ({ ...n, read: true }));
  },
};
