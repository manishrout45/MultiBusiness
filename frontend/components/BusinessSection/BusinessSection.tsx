'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BusinessCard } from '@/components/BusinessCard';
import type { Business } from '@/features/businesses';

interface BusinessSectionProps {
  businesses: Business[];
  title?: string;
  subtitle?: string;
}

export function BusinessSection({
  businesses,
  title = 'Popular Businesses Near You',
  subtitle = 'Top-rated local stores and services around your location',
}: BusinessSectionProps) {
  return (
    <section className="bg-muted/30 py-12 md:py-16">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link
            href="/businesses"
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            View All →
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4"
        >
          {businesses.map((business, i) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="sm:min-w-0"
            >
              <BusinessCard business={business} className="sm:w-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
