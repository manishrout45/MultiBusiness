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
  featured?: boolean;
}

export function BusinessCard({ business, className, featured }: BusinessCardProps) {
  const isOpen = business.isOpen ?? true;
  const distance =
    business.distanceKm != null ? `${business.distanceKm.toFixed(1)} km` : null;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card marketplace-shadow',
        featured ? 'min-w-[280px] sm:min-w-0' : 'min-w-[260px] sm:min-w-0',
        className
      )}
    >
      <div className={cn('relative overflow-hidden bg-muted', featured ? 'aspect-[5/4]' : 'aspect-[4/3]')}>
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          sizes="(max-width: 768px) 280px, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {(business.badge || business.featured) && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            {business.badge || 'Featured'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug sm:text-lg">{business.name}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {formatRating(business.rating)}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{business.category}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {distance && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" />
              {distance}
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center gap-1 font-semibold',
              isOpen ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className={cn('size-1.5 rounded-full', isOpen ? 'bg-primary' : 'bg-muted-foreground')} />
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
        <Button
          asChild
          className="mt-4 w-full rounded-2xl border-primary/20 bg-secondary text-primary hover:bg-primary hover:text-primary-foreground"
          variant="outline"
        >
          <Link href={`/business/${business.slug}`}>View Store</Link>
        </Button>
      </div>
    </motion.article>
  );
}
