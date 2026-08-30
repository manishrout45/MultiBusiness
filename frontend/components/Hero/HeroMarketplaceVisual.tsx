'use client';

import { motion } from 'framer-motion';
import { MapPin, Package, ShoppingBag, Star, Users, type LucideIcon } from 'lucide-react';

const FLOATING: Array<{
  name: string;
  meta: string;
  icon: LucideIcon;
  delay: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}> = [
  { name: 'Pizza Hub', meta: '1.2 km · Open', icon: ShoppingBag, top: '6%', left: '2%', delay: 0.2 },
  { name: 'Tech Repair', meta: '4.9 ★', icon: Star, top: '14%', right: '0%', delay: 0.35 },
  { name: 'Local Map', meta: 'Near you', icon: MapPin, bottom: '28%', left: '-2%', delay: 0.45 },
  { name: 'Fresh Deals', meta: '120+ products', icon: Package, bottom: '10%', right: '2%', delay: 0.55 },
];

export function HeroMarketplaceVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-lg">
      <div aria-hidden className="absolute inset-6 rounded-[2rem] bg-secondary/80 blur-2xl" />
      <div
        aria-hidden
        className="absolute right-8 top-16 size-28 rounded-full bg-[hsl(var(--trust)/0.15)] blur-2xl"
      />
      <div
        aria-hidden
        className="absolute bottom-20 left-10 size-24 rounded-full bg-[hsl(var(--offer)/0.15)] blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-[12%] flex flex-col justify-end"
      >
        <div className="relative mb-2 flex items-end justify-center gap-2 px-6">
          {[40, 64, 52, 80, 48, 70, 44].map((h, i) => (
            <div
              key={i}
              className="w-7 rounded-t-lg bg-gradient-to-b from-primary/30 to-primary/70"
              style={{ height: h }}
            />
          ))}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 left-1/2 z-20 -translate-x-1/2"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground marketplace-shadow-lg">
              <MapPin className="size-6 fill-white" />
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto w-[78%] overflow-hidden rounded-3xl border border-primary/15 bg-white marketplace-shadow-lg">
          <div className="flex h-10 items-center justify-between bg-primary px-4">
            <span className="text-xs font-semibold text-primary-foreground">LocalMart City</span>
            <Users className="size-4 text-primary-foreground/80" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            {['Stores', 'Maps', 'Shop'].map((label) => (
              <div
                key={label}
                className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-secondary text-[10px] font-semibold text-primary"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="mx-auto mb-4 flex h-12 w-20 items-end justify-center rounded-t-2xl bg-foreground/90">
            <div className="mb-2 size-2 rounded-full bg-amber-300" />
          </div>
        </div>
        <div className="mx-auto mt-3 h-2.5 w-3/5 rounded-full bg-foreground/10 blur-[1px]" />
      </motion.div>

      {FLOATING.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: card.delay, duration: 0.45 }}
            className="absolute z-10 w-[132px] rounded-2xl border border-white/90 bg-white/95 p-2.5 marketplace-shadow backdrop-blur"
            style={{
              top: card.top,
              left: card.left,
              right: card.right,
              bottom: card.bottom,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{card.name}</p>
                <p className="text-[10px] text-muted-foreground">{card.meta}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
