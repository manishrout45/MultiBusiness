'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import {
  analyticsService,
  type AdminAnalytics,
  type VendorAnalytics,
} from '@/services/analyticsService';

export function useVendorAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState<VendorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await analyticsService.getVendorAnalytics(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}

export function useAdminAnalytics() {
  const { token } = useAuth();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await analyticsService.getAdminAnalytics(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}

export function useAnalytics(scope: 'vendor' | 'admin' = 'vendor') {
  const vendor = useVendorAnalytics();
  const admin = useAdminAnalytics();
  return scope === 'admin' ? admin : vendor;
}
