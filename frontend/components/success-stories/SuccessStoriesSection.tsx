'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Store, MapPinned, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SuccessStoryStat } from './types';

const STAT_ICONS: Record<string, typeof Store> = {
  businesses: Store,
  products: Package,
  orders: Truck,
  rating: Star,
  cities: MapPinned,
};

interface SuccessStoriesSectionProps {
  stats: SuccessStoryStat[];
}

export function SuccessStoriesSection({ stats }: SuccessStoriesSectionProps) {
  return (
    <section className="lm-section bg-gradient-to-b from-secondary/40 to-background">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Success Stories</p>
            <h2 className="lm-section-title mt-1">Local commerce, growing together</h2>
            <p className="lm-section-sub">
              Real impact for neighborhood businesses and shoppers across India.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-full">
            <Link href="/success-stories">
              View All Stories
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 min-[375px]:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {stats.map((stat, i) => {
            const Icon = STAT_ICONS[stat.id] ?? Store;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-border/70 bg-white p-5 text-center marketplace-shadow sm:p-6"
              >
                <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-semibold">{stat.label}</p>
                {stat.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
