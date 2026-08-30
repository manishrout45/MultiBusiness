'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_SUCCESS_STORIES } from '@/components/success-stories';
import type { SuccessStoryStat } from '@/components/success-stories';

const STORIES = [
  {
    name: 'Pizza Hub',
    city: 'Bhubaneswar',
    quote:
      'LocalMart helped us reach customers we never had online. Orders doubled in three months.',
    growth: '+120% online orders',
  },
  {
    name: 'Fashion World',
    city: 'Cuttack',
    quote:
      'Our digital storefront looks premium and customers trust the verified badge.',
    growth: '4.9★ average rating',
  },
  {
    name: 'Tech Repair Zone',
    city: 'Puri',
    quote: 'Lead inquiries from nearby shoppers keep our workshop fully booked.',
    growth: '300+ monthly leads',
  },
] as const;

function StatGrid({ stats }: { stats: SuccessStoryStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-3xl border bg-card p-6 text-center marketplace-shadow"
        >
          <p className="text-3xl font-bold text-primary">{stat.value}</p>
          <p className="mt-1 font-semibold">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function SuccessStoriesPageClient() {
  const { stats } = DEFAULT_SUCCESS_STORIES;

  return (
    <div className="pb-20">
      <div className="border-b bg-gradient-to-br from-secondary/60 to-background">
        <div className="container py-10 sm:py-14">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Success Stories</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Discover how local businesses grow with LocalMart — from first listing to
            thousands of orders.
          </p>
        </div>
      </div>

      <div className="container space-y-12 py-10 sm:py-14">
        <section>
          <h2 className="mb-6 text-xl font-bold">Platform milestones</h2>
          <StatGrid stats={stats} />
        </section>

        <section>
          <h2 className="mb-6 text-xl font-bold">Featured seller stories</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {STORIES.map((story, i) => (
              <motion.article
                key={story.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border bg-card p-6 marketplace-shadow"
              >
                <Quote className="size-8 text-primary/30" />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  “{story.quote}”
                </p>
                <div className="mt-6 border-t pt-4">
                  <p className="font-bold">{story.name}</p>
                  <p className="text-sm text-muted-foreground">{story.city}</p>
                  <p className="mt-2 text-sm font-semibold text-primary">{story.growth}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-primary p-8 text-primary-foreground sm:p-10">
          <h2 className="text-2xl font-bold">Ready to write your story?</h2>
          <p className="mt-2 max-w-lg text-primary-foreground/85">
            Join thousands of local businesses selling online with LocalMart.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full bg-white text-primary hover:bg-white/90">
            <Link href="/register">Become a Seller</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
