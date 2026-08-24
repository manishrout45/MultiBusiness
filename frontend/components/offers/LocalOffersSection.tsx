'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OFFERS = [
  {
    id: '1',
    title: 'Restaurant deals up to 50% OFF',
    subtitle: 'Food',
    cta: 'Order now',
    href: '/categories/restaurant',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&q=80',
    tone: 'from-primary to-emerald-800',
  },
  {
    id: '2',
    title: 'Fashion offers 30–70% OFF',
    subtitle: 'Shopping',
    cta: 'Shop deals',
    href: '/categories/retail',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80',
    tone: 'from-[hsl(var(--offer))] to-orange-700',
  },
  {
    id: '3',
    title: 'Electronics discounts this week',
    subtitle: 'Gadgets',
    cta: 'Explore',
    href: '/categories/electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80',
    tone: 'from-[hsl(var(--trust))] to-blue-800',
  },
] as const;

export function LocalOffersSection() {
  return (
    <section className="lm-section bg-card/50">
      <div className="container">
        <div className="mb-6 sm:mb-8">
          <h2 className="lm-section-title">Local Offers</h2>
          <p className="lm-section-sub">Premium promotions from businesses near you</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {OFFERS.map((offer, i) => (
            <motion.article
              key={offer.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'relative flex min-h-[200px] overflow-hidden rounded-3xl bg-gradient-to-br text-white marketplace-shadow-lg sm:min-h-[220px]',
                offer.tone
              )}
            >
              <div className="relative z-10 flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/75">
                    {offer.subtitle}
                  </p>
                  <h3 className="mt-2 max-w-[16rem] text-xl font-bold leading-snug sm:text-2xl">
                    {offer.title}
                  </h3>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="mt-5 w-fit rounded-full bg-white text-foreground hover:bg-white/90"
                >
                  <Link href={offer.href}>{offer.cta}</Link>
                </Button>
              </div>
              <div className="relative hidden w-[40%] sm:block">
                <Image src={offer.image} alt="" fill className="object-cover opacity-90" sizes="200px" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/25" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
