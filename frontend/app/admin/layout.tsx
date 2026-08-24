'use client';

import { RequireAuth, RequireRole } from '@/features/auth/RequireRole';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth fallbackHref="/login">
      <RequireRole roles={['super_admin', 'business_manager']} fallbackHref="/">
        {children}
      </RequireRole>
    </RequireAuth>
  );
}
