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
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';
import { POPULAR_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ICONS = [
  UtensilsCrossed,
  ShoppingBag,
  Cpu,
  Home,
  Wrench,
  Sparkles,
  GraduationCap,
  HeartPulse,
  Plane,
] as const;

export function CategorySection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular Categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore what&apos;s trending near you
            </p>
          </div>
          <Link
            href="/categories"
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible md:grid-cols-5 lg:grid-cols-9 sm:gap-4">
          {POPULAR_CATEGORIES.map((cat, index) => {
            const Icon = ICONS[index] ?? ShoppingBag;
            return (
              <motion.div
                key={cat.slug + cat.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.04 }}
                className="w-[104px] shrink-0 sm:w-auto"
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center rounded-2xl border border-border/70 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md marketplace-shadow"
                >
                  <span
                    className={cn(
                      'mb-3 flex size-14 items-center justify-center rounded-2xl transition group-hover:scale-105',
                      cat.tint
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">
                    {cat.name}
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
