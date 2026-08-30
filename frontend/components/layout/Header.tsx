'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, Store, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/features/notifications';
import { useAuth } from '@/features/auth';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Businesses', href: '/businesses' },
  { label: 'Categories', href: '/categories' },
  { label: 'Search', href: '/search' },
  { label: 'Orders', href: '/orders' },
  { label: 'For Vendors', href: '/vendor/dashboard' },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { totals } = useCart();

  const dashboardHref =
    user?.role === 'super_admin' || user?.role === 'business_manager'
      ? '/admin/dashboard'
      : user?.role === 'vendor'
        ? '/vendor/dashboard'
        : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-5" />
          </span>
          <span className="hidden sm:inline">LocalMarket</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && <NotificationBell />}
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Shopping cart">
            <Link href="/cart">
              <ShoppingCart className="size-5" />
              {totals.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totals.itemCount > 9 ? '9+' : totals.itemCount}
                </span>
              )}
            </Link>
          </Button>
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated && user ? (
            <>
              {dashboardHref && (
                <Button asChild variant="outline" size="sm">
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
              )}
              <span className="max-w-[120px] truncate text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && <NotificationBell />}
          <Link
            href="/cart"
            className="relative inline-flex size-10 items-center justify-center rounded-md border border-border"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="size-5" />
            {totals.itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {totals.itemCount > 9 ? '9+' : totals.itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'border-t border-border/60 bg-background md:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <nav className="container flex flex-col gap-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 pt-2">
            {dashboardHref && (
              <Button asChild variant="outline">
                <Link href={dashboardHref} onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/cart" onClick={() => setOpen(false)}>
                Cart {totals.itemCount > 0 ? `(${totals.itemCount})` : ''}
              </Link>
            </Button>
            {isAuthenticated && user ? (
              <>
                <p className="px-3 text-sm text-muted-foreground">{user.name}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
