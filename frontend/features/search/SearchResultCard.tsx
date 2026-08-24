'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SearchResultItem } from '@/services/searchService';

interface SearchResultCardProps {
  item: SearchResultItem;
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  return (
    <motion.article whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <Link href={item.href} className="flex flex-col sm:flex-row">
        <div className="relative h-40 w-full shrink-0 bg-muted sm:h-auto sm:w-44">
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="176px" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Badge variant="secondary" className="mb-2 capitalize">
                {item.type}
              </Badge>
              <h3 className="font-semibold leading-tight">{item.title}</h3>
            </div>
            {item.price != null && (
              <p className="font-semibold text-primary">₹{item.price.toLocaleString()}</p>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>
          <div className="mt-auto flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Tag className="size-3.5" />
              {item.category}
            </span>
            {item.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {item.location}
              </span>
            )}
            {item.rating != null && item.rating > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {item.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
