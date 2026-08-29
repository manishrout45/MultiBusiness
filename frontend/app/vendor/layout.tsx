import { Outlet } from 'react-router-dom';
import { usePathname } from 'next/navigation';
import { RequireAuth, RequireRole } from '@/features/auth/RequireRole';
import { VendorNav } from '@/components/layout/VendorNav';

export default function VendorLayout() {
  const pathname = usePathname();
  const isPublicVendorRoute =
    pathname === '/vendor/register' || pathname?.startsWith('/vendor/register/');
  const isDashboardShell = pathname?.startsWith('/vendor/dashboard');

  if (isPublicVendorRoute) {
    return <Outlet />;
  }

  if (isDashboardShell) {
    return (
      <RequireAuth fallbackHref="/login">
        <RequireRole roles={['vendor']} fallbackHref="/">
          <Outlet />
        </RequireRole>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth fallbackHref="/login">
      <RequireRole roles={['vendor']} fallbackHref="/">
        <div className="container py-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Vendor workspace
              </p>
              <VendorNav />
            </aside>
            <div className="min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}
