'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Package,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: Store, title: 'Create Digital Store', desc: 'Launch your branded online storefront' },
  { icon: Package, title: 'Manage Products', desc: 'Catalog, inventory, and pricing tools' },
  { icon: Users, title: 'Receive Customer Leads', desc: 'Inquiries from nearby shoppers' },
  { icon: TrendingUp, title: 'Track Sales', desc: 'Real-time order and revenue tracking' },
  { icon: BarChart3, title: 'Analytics', desc: 'Insights to grow your business' },
] as const;

export function VendorCtaSection() {
  return (
    <section className="lm-section pt-0">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white marketplace-shadow-lg"
        >
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-gradient-to-br from-primary to-emerald-900 p-7 text-primary-foreground sm:p-10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/75">
                For business owners
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Grow Your Business Online
              </h2>
              <p className="mt-3 max-w-md text-sm text-primary-foreground/85 sm:text-base">
                Everything you need to sell locally — digital store, products, leads, and
                analytics in one Shopify-inspired dashboard.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-7 rounded-full bg-white text-primary hover:bg-white/90"
              >
                <Link href="/register">
                  Become a Seller
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-1 lg:content-center">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-3.5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
