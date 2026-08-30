'use client';

import {
  Cpu,
  GraduationCap,
  HeartPulse,
  Home,
  LayoutGrid,
  Plane,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryDto } from '@/services/categoryService';
import { cn } from '@/lib/utils';

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  restaurant: Utensils,
  retail: ShoppingBag,
  electronics: Cpu,
  services: Wrench,
  healthcare: HeartPulse,
  education: GraduationCap,
  travel: Plane,
  beauty: Sparkles,
  home: Home,
  'real-estate': Home,
  'retail-store': ShoppingBag,
};

function iconFor(slug: string, name: string): LucideIcon {
  const key = slug.toLowerCase();
  if (ICON_BY_SLUG[key]) return ICON_BY_SLUG[key];
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('restaurant')) return Utensils;
  if (n.includes('electr')) return Cpu;
  if (n.includes('health') || n.includes('pharma')) return HeartPulse;
  if (n.includes('beauty') || n.includes('salon')) return Sparkles;
  if (n.includes('service')) return Wrench;
  if (n.includes('shop') || n.includes('retail') || n.includes('fashion')) return ShoppingBag;
  return Store;
}

interface CategoryFilterProps {
  categories: CategoryDto[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading?: boolean;
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
  loading,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('border-b border-border/50 bg-card/40', className)}>
      <div className="container py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition',
              selectedId == null
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary'
            )}
          >
            <LayoutGrid className="size-3.5" />
            All
          </button>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-muted"
                />
              ))
            : categories.map((cat) => {
                const Icon = iconFor(cat.slug, cat.name);
                const active = selectedId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelect(active ? null : cat.id)}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition',
                      active
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary'
                    )}
                  >
                    <Icon className="size-3.5" />
                    {cat.name}
                    {cat.businessCount ? (
                      <span
                        className={cn(
                          'rounded-full px-1.5 text-[10px]',
                          active ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {cat.businessCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
        </div>
      </div>
    </div>
  );
}
