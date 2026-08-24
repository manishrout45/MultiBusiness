'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Package,
  ShoppingBag,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';

const CHIPS: Array<{
  label: string;
  icon: LucideIcon;
  delay: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}> = [
  { label: 'Stores', icon: Store, top: '8%', left: '0%', delay: 0.2 },
  { label: 'Customers', icon: Users, top: '12%', right: '0%', delay: 0.3 },
  { label: 'Products', icon: Package, bottom: '30%', left: '-4%', delay: 0.4 },
  { label: 'Delivery', icon: Truck, bottom: '14%', right: '0%', delay: 0.5 },
];

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[1.05/1] w-full max-w-md lg:max-w-lg">
      <div aria-hidden className="absolute inset-4 rounded-[2.5rem] bg-secondary blur-2xl" />
      <div
        aria-hidden
        className="absolute right-6 top-10 size-32 rounded-full bg-[hsl(var(--trust)/0.12)] blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-[10%] flex flex-col items-center justify-end"
      >
        {/* Mini skyline */}
        <div className="relative mb-3 flex w-full items-end justify-center gap-1.5 px-8">
          {[36, 56, 44, 72, 40, 60, 48].map((h, i) => (
            <div
              key={i}
              className="w-6 rounded-t-md bg-gradient-to-b from-primary/25 to-primary/65 sm:w-7"
              style={{ height: h }}
            />
          ))}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-12 left-1/2 z-20 -translate-x-1/2"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground marketplace-shadow-lg sm:size-12">
              <MapPin className="size-5 fill-white sm:size-6" />
            </div>
          </motion.div>
        </div>

        <div className="w-[82%] overflow-hidden rounded-[1.75rem] border border-primary/10 bg-white marketplace-shadow-lg">
          <div className="flex items-center justify-between bg-primary px-4 py-2.5">
            <span className="text-xs font-semibold text-primary-foreground">Local ecosystem</span>
            <ShoppingBag className="size-4 text-primary-foreground/80" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 p-4">
            {[
              { t: 'Digital shops', s: 'Online + offline' },
              { t: 'Local pins', s: 'Map discovery' },
              { t: 'Live orders', s: 'Nearby delivery' },
              { t: 'Trusted sellers', s: 'Verified' },
            ].map((cell) => (
              <div key={cell.t} className="rounded-2xl bg-secondary/80 p-3">
                <p className="text-xs font-bold text-foreground">{cell.t}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{cell.s}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {CHIPS.map((chip) => {
        const Icon = chip.icon;
        return (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: chip.delay }}
            className="absolute z-10 flex items-center gap-2 rounded-2xl border border-white bg-white/95 px-3 py-2 marketplace-shadow backdrop-blur"
            style={{
              top: chip.top,
              left: chip.left,
              right: chip.right,
              bottom: chip.bottom,
            }}
          >
            <span className="flex size-7 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-3.5" />
            </span>
            <span className="text-xs font-semibold">{chip.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
