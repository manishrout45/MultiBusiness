'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { VendorProfile } from '@/features/vendor';
import { formatRating } from '@/lib/utils';

interface VendorProfileCardProps {
  profile: VendorProfile;
}

export function VendorProfileCard({ profile }: VendorProfileCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <div className="relative h-36 bg-muted sm:h-44">
          {profile.coverUrl && (
            <Image src={profile.coverUrl} alt="Cover" fill className="object-cover" sizes="100vw" />
          )}
        </div>
        <CardContent className="relative px-5 pb-5 pt-0 sm:px-6">
          <div className="relative -mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative size-20 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md sm:size-24">
              {profile.logoUrl ? (
                <Image src={profile.logoUrl} alt={profile.business.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Logo
                </div>
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold sm:text-2xl">{profile.business.name}</h2>
                {profile.status === 'approved' && (
                  <Badge variant="success" className="gap-1">
                    <BadgeCheck className="size-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-primary">{profile.business.category}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {formatRating(profile.rating)} ({profile.reviewCount})
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {profile.business.city}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {profile.business.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
