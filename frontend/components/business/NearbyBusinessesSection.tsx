'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BusinessCard } from './BusinessCard';
import type { Business } from '@/features/businesses';

interface NearbyBusinessesSectionProps {
  businesses: Business[];
}

export function NearbyBusinessesSection({ businesses }: NearbyBusinessesSectionProps) {
  return (
    <section className="lm-section">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="lm-section-title">Nearby Businesses</h2>
            <p className="lm-section-sub">Trusted local stores around your location</p>
          </div>
          <Link href="/businesses" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>

        {/* Mobile: horizontal snap · Tablet+: grid */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((business, i) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="snap-start sm:min-w-0"
            >
              <BusinessCard business={business} featured className="h-full w-[280px] sm:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
