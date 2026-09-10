'use client';

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';

const KYC_ROLES = new Set(['vendor', 'business_manager']);

export function RequireAadhaar({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (KYC_ROLES.has(String(user.role)) && Number(user.aadhaar_verified) !== 1) {
    return <Navigate to="/verify-aadhaar" replace />;
  }

  return <>{children}</>;
}
