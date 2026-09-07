'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SuccessStoryStat } from '@/components/success-stories';
import { fetchSuccessStories } from '@/services/successStoriesService';

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
  if (!stats.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Live stats will appear once the API is reachable.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
  const [stats, setStats] = useState<SuccessStoryStat[]>([]);

  useEffect(() => {
    fetchSuccessStories().then((data) => setStats(data.stats));
  }, []);

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
            Live marketplace numbers from LocalMart — vendors, customers, orders, and more.
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
          <div className="grid gap-6 md:grid-cols-3">
            {STORIES.map((story) => (
              <article
                key={story.name}
                className="rounded-3xl border bg-card p-6 marketplace-shadow"
              >
                <Quote className="size-5 text-primary" />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{story.quote}</p>
                <p className="mt-4 font-semibold">{story.name}</p>
                <p className="text-xs text-muted-foreground">{story.city}</p>
                <p className="mt-2 text-sm font-medium text-primary">{story.growth}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
