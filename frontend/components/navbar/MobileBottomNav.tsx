'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Package, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/login', label: 'Profile', icon: User, authHref: true },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const hideOnDashboard =
    pathname?.startsWith('/vendor/dashboard') || pathname?.startsWith('/admin/dashboard');

  if (hideOnDashboard) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {TABS.map((tab) => {
          let href: string = tab.href;
          if ('authHref' in tab && tab.authHref) {
            if (isAuthenticated) {
              href =
                user?.role === 'super_admin' || user?.role === 'business_manager'
                  ? '/admin/dashboard'
                  : user?.role === 'vendor'
                    ? '/vendor/dashboard'
                    : '/orders';
            } else {
              href = '/login';
            }
          }
          const active =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname?.startsWith(`${href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.label} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('size-5', active && 'stroke-[2.5px]')} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
