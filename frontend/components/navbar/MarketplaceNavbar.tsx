'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { MarketplaceSearchBar } from '@/components/search';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/features/notifications';
import { useAuth } from '@/features/auth';
import { useCart } from '@/hooks/useCart';
import { APP_NAME } from '@/lib/constants';

export function MarketplaceNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totals } = useCart();

  const profileHref = !isAuthenticated
    ? '/login'
    : user?.role === 'super_admin' || user?.role === 'business_manager'
      ? '/admin/dashboard'
      : user?.role === 'vendor'
        ? '/vendor/dashboard'
        : '/orders';

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="container flex flex-col gap-2.5 py-2.5 sm:py-3">
        {/* Top row: brand + actions (desktop search sits in center) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm md:size-10">
              <ShoppingBag className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold tracking-tight md:text-lg">{APP_NAME}</span>
              <span className="hidden text-[10px] font-medium leading-tight text-muted-foreground sm:block lg:text-[11px]">
                Everything Local, One Marketplace
              </span>
            </span>
          </Link>

          {/* Centered Amazon-style search — tablet/desktop */}
          <MarketplaceSearchBar className="mx-1 hidden min-w-0 flex-1 md:flex" />

          <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden font-medium lg:inline-flex"
            >
              <Link href="/products">Products</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden font-medium lg:inline-flex"
            >
              <Link href="/vendor/register">Become a Seller</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden font-medium md:inline-flex"
            >
              <Link href="/orders">Orders</Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Wishlist">
              <Link href="/wishlist">
                <Heart className="size-5" />
              </Link>
            </Button>
            {isAuthenticated && <NotificationBell />}
            <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
              <Link href="/cart">
                <ShoppingCart className="size-5" />
                {totals.itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {totals.itemCount > 9 ? '9+' : totals.itemCount}
                  </span>
                )}
              </Link>
            </Button>
            {isAuthenticated && user ? (
              <div className="ml-1 flex items-center gap-1 border-l border-border pl-2 sm:gap-2 sm:pl-3">
                <Link
                  href={profileHref}
                  className="flex items-center gap-2 rounded-full hover:opacity-90"
                  aria-label="Profile"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[88px] truncate text-sm font-semibold xl:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <Button variant="ghost" size="sm" className="hidden lg:inline-flex" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="ml-1 rounded-full px-3 sm:ml-2 sm:px-4">
                <Link href="/login">
                  <User className="size-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </Button>
            )}
          </nav>
        </div>

        {/* Mobile / small tablet: full-width Amazon search */}
        <div className="md:hidden">
          <MarketplaceSearchBar compact />
        </div>

        {/* Compact utility links for mid breakpoints */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-0.5 text-sm font-medium text-muted-foreground lg:hidden">
          <Link href="/products" className="shrink-0 hover:text-primary">
            Products
          </Link>
          <Link href="/vendor/register" className="shrink-0 hover:text-primary">
            Become a Seller
          </Link>
          <Link href="/orders" className="shrink-0 hover:text-primary sm:hidden">
            Orders
          </Link>
          <Link href="/categories" className="shrink-0 hover:text-primary">
            Categories
          </Link>
        </div>
      </div>
    </header>
  );
}
