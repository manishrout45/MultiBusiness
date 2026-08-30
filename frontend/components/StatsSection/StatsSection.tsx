'use client';

import { motion } from 'framer-motion';
import { FolderTree, Package, Smile, Store } from 'lucide-react';

const STATS = [
  { icon: Smile, value: '10,000+', label: 'Happy Customers' },
  { icon: Store, value: '2,500+', label: 'Verified Businesses' },
  { icon: Package, value: '50,000+', label: 'Products & Services' },
  { icon: FolderTree, value: '50+', label: 'Categories' },
] as const;

export function StatsSection() {
  return (
    <section className="pb-16 md:pb-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-6 rounded-3xl border border-primary/15 bg-primary/5 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-10"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <stat.icon className="size-6" />
              </span>
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
