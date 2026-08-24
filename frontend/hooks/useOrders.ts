'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import type { Order } from '@/services/orderService';
import { orderService } from '@/services/orderService';

export function useOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.listOrders(token);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getOrder = useCallback(
    (id: string) => orderService.getOrder(id, token),
    [token]
  );

  const trackOrder = useCallback(
    (id: string) => orderService.trackOrder(id, token),
    [token]
  );

  return { orders, isLoading, error, refresh, getOrder, trackOrder };
}

export function useOrder(id: string) {
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrder(id, token);
      if (!data) {
        setError('Order not found');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { order, isLoading, error, refresh };
}
