'use client';

import { BusinessAbout } from './BusinessAbout';
import { BusinessGallerySection } from './BusinessGallerySection';
import {
  BusinessProfilePanel,
  BusinessProfileTabs,
  useBusinessProfileTab,
} from './BusinessProfileTabs';
import { ContactButtons } from './ContactButtons';
import { LocationMap } from './LocationMap';
import { ProductGallery } from './ProductGallery';
import { Reviews, type ReviewItem } from './Reviews';
import type { VendorProfile } from '@/features/vendor';
import type { Product } from '@/features/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Tag } from 'lucide-react';

interface BusinessProfileContentProps {
  profile: VendorProfile;
  products: Product[];
  reviews: ReviewItem[];
  slug: string;
}

const MOCK_OFFERS = [
  { id: 'o1', title: '10% off first order', code: 'LOCAL10' },
  { id: 'o2', title: 'Free delivery above ₹499', code: 'FREEDEL' },
];

const MOCK_SERVICES = [
  { id: 's1', name: 'Home delivery', price: 'From ₹49' },
  { id: 's2', name: 'In-store pickup', price: 'Free' },
  { id: 's3', name: 'Express service', price: 'From ₹199' },
];

export function BusinessProfileContent({
  profile,
  products,
  reviews,
  slug,
}: BusinessProfileContentProps) {
  const { active, setActive } = useBusinessProfileTab('about');

  return (
    <div className="container pb-16">
      <div className="mb-6">
        <BusinessProfileTabs active={active} onChange={setActive} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          {active === 'about' && (
            <BusinessProfilePanel tab="about">
              <BusinessAbout profile={profile} />
              <div className="mt-6">
                <LocationMap profile={profile} />
              </div>
            </BusinessProfilePanel>
          )}

          {active === 'products' && (
            <BusinessProfilePanel tab="products">
              <ProductGallery
                products={products}
                vendorId={profile.id}
                vendorName={profile.business.name}
              />
            </BusinessProfilePanel>
          )}

          {active === 'services' && (
            <BusinessProfilePanel tab="services">
              <div className="grid gap-3 sm:grid-cols-2">
                {MOCK_SERVICES.map((service) => (
                  <Card key={service.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-semibold text-primary">{service.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </BusinessProfilePanel>
          )}

          {active === 'offers' && (
            <BusinessProfilePanel tab="offers">
              <div className="grid gap-3 sm:grid-cols-2">
                {MOCK_OFFERS.map((offer) => (
                  <Card key={offer.id} className="border-orange-200 bg-orange-50/50">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-[hsl(var(--offer))]">
                        <Tag className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold">{offer.title}</p>
                        <p className="text-xs text-muted-foreground">Code: {offer.code}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </BusinessProfilePanel>
          )}

          {active === 'gallery' && (
            <BusinessProfilePanel tab="gallery">
              <BusinessGallerySection items={profile.gallery} />
            </BusinessProfilePanel>
          )}

          {active === 'reviews' && (
            <BusinessProfilePanel tab="reviews">
              <Reviews reviews={reviews} slug={slug} />
              <Link
                href={`/business/${slug}/reviews`}
                className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Write a review →
              </Link>
            </BusinessProfilePanel>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ContactButtons profile={profile} />
        </aside>
      </div>
    </div>
  );
}
