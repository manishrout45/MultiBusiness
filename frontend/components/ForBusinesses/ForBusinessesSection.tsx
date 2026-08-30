'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForBusinessesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary via-primary to-emerald-800 px-6 py-12 text-primary-foreground sm:px-10 md:py-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-10 size-48 rounded-full bg-black/10 blur-2xl"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Store className="size-3.5" />
                For businesses
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Create your digital store today
              </h2>
              <p className="mt-3 text-base text-primary-foreground/85 sm:text-lg">
                List products, get discovered by nearby customers, accept orders, and grow with
                LocalMart — built for local sellers who want a premium storefront.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-primary hover:bg-white/90"
                >
                  <Link href="/register">
                    Start selling
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/vendor/subscription">View plans</Link>
                </Button>
              </div>
            </div>

            <ul className="grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1 lg:text-right">
              {['Digital storefront', 'Local discovery', 'Orders & analytics'].map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-medium backdrop-blur"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
