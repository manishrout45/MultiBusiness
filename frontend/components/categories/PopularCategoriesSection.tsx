'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Cpu,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { HOMEPAGE_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: UtensilsCrossed,
  'shopping-bag': ShoppingBag,
  cpu: Cpu,
  home: Home,
  wrench: Wrench,
  sparkles: Sparkles,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  plane: Plane,
  store: Store,
};

export function PopularCategoriesSection() {
  return (
    <section className="lm-section bg-card/40">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="lm-section-title">Popular Categories</h2>
            <p className="lm-section-sub">Browse what your neighborhood needs most</p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-primary hover:underline">
            All categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9">
          {HOMEPAGE_CATEGORIES.map((cat, i) => {
            const Icon = ICON_MAP[cat.icon] ?? Store;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group flex h-full flex-col items-center rounded-3xl border border-border/70 bg-white p-4 text-center marketplace-shadow transition hover:-translate-y-1 hover:border-primary/20 sm:p-5"
                >
                  <span
                    className={cn(
                      'mb-3 flex size-12 items-center justify-center rounded-2xl transition group-hover:scale-105 sm:size-14',
                      cat.tint
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="text-xs font-bold sm:text-sm">{cat.name}</span>
                  <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
                    {cat.blurb}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
