'use client';

import { motion } from 'framer-motion';
import { Headphones, Lock, MapPin, ShieldCheck, Tag } from 'lucide-react';

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Trusted Businesses',
    description: 'Verified sellers you can rely on',
    tone: 'text-[hsl(var(--trust))] bg-sky-50',
  },
  {
    icon: Tag,
    title: 'Best Prices',
    description: 'Compare products and local deals',
    tone: 'text-[hsl(var(--offer))] bg-orange-50',
  },
  {
    icon: MapPin,
    title: 'Nearby Stores',
    description: 'Discover shops around you',
    tone: 'text-primary bg-secondary',
  },
  {
    icon: Lock,
    title: 'Safe & Secure',
    description: 'Protected payments and privacy',
    tone: 'text-[hsl(var(--trust))] bg-sky-50',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Help whenever you need it',
    tone: 'text-[hsl(var(--services))] bg-violet-50',
  },
] as const;

export function WhyChooseSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why LocalMart?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Premium local discovery with the shopping confidence of a modern marketplace.
          </p>
        </div>

        <div className="grid gap-4 min-[375px]:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl border border-border/70 bg-white p-5 text-center marketplace-shadow"
            >
              <span
                className={`mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl ${item.tone}`}
              >
                <item.icon className="size-6" />
              </span>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
