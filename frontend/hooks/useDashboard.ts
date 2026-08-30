'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import {
  dashboardService,
  type AdminDashboardStats,
  type CustomerLead,
  type VendorDashboardStats,
} from '@/services/dashboardService';

export function useVendorDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([
        dashboardService.getVendorDashboard(token),
        dashboardService.getVendorLeads(token),
      ]);
      setStats(s);
      setLeads(l);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, leads, isLoading, error, refresh };
}

export function useAdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const s = await dashboardService.getAdminDashboard(token);
      setStats(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, isLoading, error, refresh };
}

export function useDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'business_manager';
  const vendor = useVendorDashboard();
  const admin = useAdminDashboard();

  if (isAdmin) {
    return {
      mode: 'admin' as const,
      stats: admin.stats,
      leads: [] as CustomerLead[],
      isLoading: admin.isLoading,
      error: admin.error,
      refresh: admin.refresh,
    };
  }

  return {
    mode: 'vendor' as const,
    stats: vendor.stats,
    leads: vendor.leads,
    isLoading: vendor.isLoading,
    error: vendor.error,
    refresh: vendor.refresh,
  };
}
