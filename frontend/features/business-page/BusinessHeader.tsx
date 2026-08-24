'use client';

import Image from 'next/image';
import { BadgeCheck, MapPin, MessageCircle, Navigation, Phone, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRating } from '@/lib/utils';
import type { VendorProfile } from '@/features/vendor';

interface BusinessHeaderProps {
  profile: VendorProfile;
}

export function BusinessHeader({ profile }: BusinessHeaderProps) {
  const phone = profile.business.phone;
  const whatsapp = (profile.business.whatsapp || phone || '').replace(/[^\d+]/g, '');
  const directions =
    profile.business.latitude && profile.business.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${profile.business.latitude},${profile.business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${profile.business.address}, ${profile.business.city}`
        )}`;

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-44 bg-muted sm:h-56 md:h-72">
        {profile.coverUrl && (
          <Image
            src={profile.coverUrl}
            alt={`${profile.business.name} cover`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="container relative -mt-14 pb-4 sm:-mt-16">
        <div className="rounded-2xl border bg-card/95 p-4 shadow-sm backdrop-blur sm:p-6 marketplace-shadow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-muted sm:size-28">
              {profile.logoUrl && (
                <Image
                  src={profile.logoUrl}
                  alt={profile.business.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {profile.business.name}
                </h1>
                {profile.status === 'approved' && (
                  <Badge variant="success" className="gap-1">
                    <BadgeCheck className="size-3" /> Verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-primary">{profile.business.category}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {formatRating(profile.rating)} · {profile.reviewCount} reviews
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {profile.business.city}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <Button asChild size="sm" className="rounded-full" disabled={!phone}>
              <a href={phone ? `tel:${phone}` : undefined}>
                <Phone className="size-4" />
                Call
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full" disabled={!whatsapp}>
              <a
                href={whatsapp ? `https://wa.me/${whatsapp.replace('+', '')}` : undefined}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <a href={directions} target="_blank" rel="noreferrer">
                <Navigation className="size-4" />
                Directions
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
