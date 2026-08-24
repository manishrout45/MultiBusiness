'use client';

import { MessageCircle, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VendorProfile } from '@/features/vendor';

export function ContactButtons({ profile }: { profile: VendorProfile }) {
  const phone = profile.business.phone;
  const whatsapp = (profile.business.whatsapp || phone || '').replace(/[^\d+]/g, '');
  const directions =
    profile.business.latitude && profile.business.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${profile.business.latitude},${profile.business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${profile.business.address}, ${profile.business.city}`
        )}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild className="w-full" disabled={!phone}>
          <a href={phone ? `tel:${phone}` : undefined}>
            <Phone /> Call business
          </a>
        </Button>
        <Button asChild variant="outline" className="w-full" disabled={!whatsapp}>
          <a
            href={whatsapp ? `https://wa.me/${whatsapp.replace('+', '')}` : undefined}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle /> WhatsApp
          </a>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <a href={directions} target="_blank" rel="noreferrer">
            <Navigation /> Get directions
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
