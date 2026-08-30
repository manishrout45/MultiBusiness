'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface OfferItem {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  imageUrl: string;
  tone: 'green' | 'orange' | 'blue' | 'purple';
}

const TONE_STYLES: Record<OfferItem['tone'], string> = {
  green: 'from-primary to-emerald-700',
  orange: 'from-[hsl(var(--offer))] to-orange-600',
  blue: 'from-[hsl(var(--trust))] to-blue-700',
  purple: 'from-[hsl(var(--services))] to-violet-700',
};

interface OfferCardProps {
  offer: OfferItem;
  index?: number;
}

export function OfferCard({ offer, index = 0 }: OfferCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        'relative flex min-h-[220px] overflow-hidden rounded-3xl bg-gradient-to-br text-white marketplace-shadow-lg sm:min-h-[240px]',
        TONE_STYLES[offer.tone]
      )}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            {offer.subtitle}
          </p>
          <h3 className="mt-2 max-w-[220px] text-2xl font-bold leading-snug sm:text-[1.65rem]">
            {offer.title}
          </h3>
        </div>
        <Button
          asChild
          size="sm"
          className="mt-4 w-fit rounded-full bg-white text-foreground hover:bg-white/90"
        >
          <Link href={offer.href}>{offer.cta}</Link>
        </Button>
      </div>
      <div className="relative hidden w-[44%] sm:block">
        <Image
          src={offer.imageUrl}
          alt=""
          fill
          className="object-cover opacity-90"
          sizes="220px"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
      </div>
    </motion.article>
  );
}
