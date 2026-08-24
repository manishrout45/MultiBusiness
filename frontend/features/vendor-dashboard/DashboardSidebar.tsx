'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Percent,
  Store,
  Tags,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const LINKS = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/profile', label: 'Business profile', icon: Store },
  { href: '/vendor/products', label: 'Products', icon: Package },
  { href: '/vendor/categories', label: 'Categories', icon: Tags },
  { href: '/vendor/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/vendor/dashboard#commission', label: 'Commission', icon: Percent },
  { href: '/vendor/dashboard#analytics', label: 'Analytics', icon: BarChart3 },
] as const;

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Vendor
      </p>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const base = href.split('#')[0];
        const active =
          pathname === base ||
          (base !== '/vendor/dashboard' && pathname.startsWith(base));
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card lg:block">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close sidebar"
            onClick={onClose}
          />
          <div className="absolute left-0 top-0 flex h-full w-64 flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-3 py-3">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
