'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  ShoppingBag,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NEARBY: {
  name: string;
  slug: string;
  href: string;
  icon: LucideIcon;
  tint: string;
  blurb: string;
}[] = [
  {
    name: 'Restaurants',
    slug: 'restaurant',
    href: '/categories/restaurant',
    icon: UtensilsCrossed,
    tint: 'bg-orange-100 text-orange-600',
    blurb: 'Dine nearby',
  },
  {
    name: 'Shops',
    slug: 'retail',
    href: '/categories/retail',
    icon: ShoppingBag,
    tint: 'bg-emerald-100 text-primary',
    blurb: 'Local stores',
  },
  {
    name: 'Services',
    slug: 'services',
    href: '/categories/services',
    icon: Wrench,
    tint: 'bg-violet-100 text-[hsl(var(--services))]',
    blurb: 'Pros near you',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    href: '/categories/healthcare',
    icon: HeartPulse,
    tint: 'bg-sky-100 text-[hsl(var(--trust))]',
    blurb: 'Care & clinics',
  },
];

export function NearbyDiscoverySection() {
  return (
    <section className="py-12 md:py-14">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Nearby Discovery</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Jump into what people search for around you
            </p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-primary hover:underline">
            All categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {NEARBY.map((item, i) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className="group flex flex-col items-start rounded-3xl border border-border/70 bg-white p-5 marketplace-shadow transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-md sm:p-6"
              >
                <span
                  className={cn(
                    'mb-4 flex size-14 items-center justify-center rounded-2xl transition group-hover:scale-105',
                    item.tint
                  )}
                >
                  <item.icon className="size-7" />
                </span>
                <span className="text-base font-bold text-foreground">{item.name}</span>
                <span className="mt-1 text-sm text-muted-foreground">{item.blurb}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
