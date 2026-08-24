'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Business } from '@/features/businesses';
import { cn, formatRating } from '@/lib/utils';

interface BusinessCardProps {
  business: Business;
  className?: string;
}

export function BusinessCard({ business, className }: BusinessCardProps) {
  const isOpen = business.isOpen ?? true;
  const distance =
    business.distanceKm != null ? `${business.distanceKm.toFixed(1)} km` : null;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={cn(
        'group flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-lg marketplace-shadow sm:w-auto',
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          sizes="(max-width: 768px) 260px, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {(business.badge || business.featured) && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow">
            {business.badge || 'Featured'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {business.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {formatRating(business.rating)}
          </div>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{business.category}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {distance && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" />
              {distance}
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              isOpen ? 'text-emerald-600' : 'text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                isOpen ? 'bg-emerald-500' : 'bg-muted-foreground'
              )}
            />
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>

        <Button
          asChild
          className="mt-4 w-full rounded-xl border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground"
          variant="outline"
        >
          <Link href={`/business/${business.slug}`}>View Store</Link>
        </Button>
      </div>
    </motion.article>
  );
}
