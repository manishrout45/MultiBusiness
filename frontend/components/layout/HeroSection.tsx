'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { useSearch } from '@/hooks/useSearch';

export function HeroSection() {
  const {
    query,
    setQuery,
    category,
    setCategory,
    categoryOptions,
    isSearching,
    submitSearch,
  } = useSearch();

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-blue-200/30 blur-3xl"
      />

      <div className="container relative py-16 md:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Store className="size-4" />
            Your local business marketplace
          </motion.div>

          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Discover and grow local businesses in one marketplace
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Find trusted local businesses, explore services, and connect with your community.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/businesses">
                Explore businesses
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/vendor/register">List your business</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-3xl md:mt-12"
        >
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            categoryOptions={categoryOptions}
            onSubmit={submitSearch}
            isSearching={isSearching}
            size="large"
          />
        </motion.div>
      </div>
    </section>
  );
}
