'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Tags,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/profile', label: 'Business Profile', icon: Store },
  { href: '/vendor/products', label: 'Products', icon: Package },
  { href: '/vendor/dashboard#orders', label: 'Orders', icon: Package },
  { href: '/vendor/dashboard#customers', label: 'Customers', icon: Users },
  { href: '/vendor/dashboard#analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/vendor/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/vendor/categories', label: 'Categories', icon: Tags },
  { href: '/vendor/profile', label: 'Settings', icon: Settings },
] as const;

export function VendorNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar md:flex-col md:overflow-visible">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const base = href.split('#')[0];
        const active =
          pathname === base ||
          (base !== '/vendor/dashboard' && pathname.startsWith(base));
        return (
          <Link
            key={`${href}-${label}`}
            href={href}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
