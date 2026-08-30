'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeroMarketplaceVisual } from './HeroMarketplaceVisual';

const POPULAR = ['Restaurants', 'Mobile Repair', 'Fashion', 'Beauty Salon'] as const;

export function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');

  function searchNow(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location.trim()) params.set('city', location.trim());
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-secondary via-background to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-10 size-96 rounded-full bg-[hsl(var(--trust)/0.08)] blur-3xl"
      />

      <div className="container relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Local discovery · Shopping · Trust
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground min-[375px]:text-4xl sm:text-5xl lg:text-[3.4rem] lg:leading-[1.12]">
            Everything Local,
            <br />
            <span className="text-primary">One Marketplace</span>
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Search nearby businesses, discover products, compare services, and shop from trusted
            local stores — online and around the corner.
          </p>

          <form onSubmit={searchNow} className="mt-8 space-y-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 marketplace-shadow">
              <MapPin className="size-5 shrink-0 text-primary" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your neighborhood or city"
                className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border-2 border-primary/20 bg-white p-2 marketplace-shadow sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search nearby businesses"
                  className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="h-11 w-full rounded-xl sm:w-auto sm:px-8">
                Search nearby
              </Button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {POPULAR.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-primary"
              >
                {term}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.65 }}
          className="hidden sm:block"
        >
          <HeroMarketplaceVisual />
        </motion.div>
      </div>
    </section>
  );
}
