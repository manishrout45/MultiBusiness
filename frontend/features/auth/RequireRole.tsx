'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth, type AuthUser } from '@/features/auth';

type AppRole = AuthUser['role'];

interface RequireAuthProps {
  children: React.ReactNode;
  fallbackHref?: string;
}

export function RequireAuth({ children, fallbackHref = '/login' }: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(fallbackHref);
    }
  }, [isAuthenticated, isLoading, router, fallbackHref]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}

interface RequireRoleProps {
  children: React.ReactNode;
  roles: AppRole[];
  fallbackHref?: string;
}

export function RequireRole({ children, roles, fallbackHref = '/' }: RequireRoleProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !roles.includes(user.role)) {
      router.replace(fallbackHref);
    }
  }, [user, roles, isLoading, isAuthenticated, router, fallbackHref]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}

export function isAdminRole(role?: string | null) {
  return role === 'super_admin' || role === 'business_manager';
}

export function isVendorRole(role?: string | null) {
  return role === 'vendor';
}
