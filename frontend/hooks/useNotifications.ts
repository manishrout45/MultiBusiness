'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth';
import {
  notificationService,
  type AppNotification,
} from '@/services/notificationService';

export function useNotifications() {
  const { token, user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await notificationService.list(user?.role, token);
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, user?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markRead = useCallback(
    (id: string) => {
      setItems((prev) => notificationService.markReadLocal(id, prev));
      void notificationService.markRead(id, user?.role, token).catch(() => undefined);
    },
    [token, user?.role]
  );

  const markAllRead = useCallback(() => {
    setItems((prev) => notificationService.markAllReadLocal(prev));
    void notificationService.markAllRead(user?.role, token).catch(() => undefined);
  }, [token, user?.role]);

  return {
    items,
    unreadCount,
    isLoading,
    open,
    setOpen,
    refresh,
    markRead,
    markAllRead,
  };
}
