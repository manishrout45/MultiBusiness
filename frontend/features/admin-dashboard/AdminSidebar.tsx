'use client';

import Link from 'next/link';
import {
  BarChart3,
  ClipboardList,
  Flag,
  FolderTree,
  LayoutDashboard,
  Megaphone,
  Palette,
  Percent,
  Star,
  Store,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';

export type AdminSection =
  | 'overview'
  | 'analytics'
  | 'users'
  | 'vendors'
  | 'orders'
  | 'reviews'
  | 'categories'
  | 'theme'
  | 'offers'
  | 'announcements'
  | 'reports'
  | 'commissions';

const LINKS: Array<{
  section: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Array<'super_admin' | 'business_manager'>;
}> = [
  { section: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['super_admin', 'business_manager'] },
  { section: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['super_admin', 'business_manager'] },
  { section: 'users', label: 'Users', icon: Users, roles: ['super_admin'] },
  { section: 'vendors', label: 'Vendors', icon: Store, roles: ['super_admin', 'business_manager'] },
  { section: 'orders', label: 'Orders', icon: ClipboardList, roles: ['super_admin', 'business_manager'] },
  { section: 'reviews', label: 'Reviews', icon: Star, roles: ['super_admin', 'business_manager'] },
  { section: 'categories', label: 'Categories', icon: FolderTree, roles: ['super_admin', 'business_manager'] },
  { section: 'theme', label: 'Theme', icon: Palette, roles: ['super_admin', 'business_manager'] },
  { section: 'offers', label: 'Offers / Banners', icon: Tag, roles: ['super_admin', 'business_manager'] },
  { section: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['super_admin', 'business_manager'] },
  { section: 'reports', label: 'Reports', icon: Flag, roles: ['super_admin'] },
  { section: 'commissions', label: 'Commissions', icon: Percent, roles: ['super_admin'] },
];

export const ADMIN_SECTIONS = new Set<string>(LINKS.map((l) => l.section));

export function sectionHref(section: AdminSection): string {
  return section === 'overview' ? '/admin/dashboard' : `/admin/dashboard#${section}`;
}

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
  activeSection?: AdminSection;
  onNavigate?: (section: AdminSection) => void;
}

export function AdminSidebar({
  open,
  onClose,
  activeSection = 'overview',
  onNavigate,
}: AdminSidebarProps) {
  const { user } = useAuth();
  const role = user?.role === 'business_manager' ? 'business_manager' : 'super_admin';
  const links = LINKS.filter((link) => link.roles.includes(role));

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {role === 'super_admin' ? 'Super admin' : 'Business manager'}
      </p>
      {links.map(({ section, label, icon: Icon }) => {
        const active = activeSection === section;
        return (
          <Link
            key={section}
            href={sectionHref(section)}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.(section);
              onClose?.();
              if (typeof window !== 'undefined') {
                const next = sectionHref(section);
                window.history.pushState(null, '', next);
              }
            }}
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
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-label="Close"
          />
          <div className="absolute left-0 top-0 flex h-full w-64 flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <span className="text-sm font-semibold">Menu</span>
              <Button type="button" size="icon" variant="ghost" onClick={onClose}>
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
