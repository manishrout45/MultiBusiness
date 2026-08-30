'use client';

import { Lock, RotateCcw, Headphones, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS = [
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Encrypted checkout and protected transactions',
    tone: 'bg-sky-50 text-[hsl(var(--trust))]',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Hassle-free returns on eligible orders',
    tone: 'bg-orange-50 text-[hsl(var(--offer))]',
  },
  {
    icon: Headphones,
    title: 'Quality Support',
    description: 'Dedicated help for buyers and sellers',
    tone: 'bg-violet-50 text-[hsl(var(--services))]',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Sellers',
    description: 'Trusted local businesses reviewed by the community',
    tone: 'bg-secondary text-primary',
  },
] as const;

export function TrustSection() {
  return (
    <section className="lm-section">
      <div className="container">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="lm-section-title">Shop with confidence</h2>
          <p className="lm-section-sub mx-auto">
            Premium local commerce backed by trust, support, and verified sellers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-border/70 bg-white p-6 text-center marketplace-shadow"
            >
              <span
                className={`mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl ${item.tone}`}
              >
                <item.icon className="size-6" />
              </span>
              <h3 className="text-base font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
