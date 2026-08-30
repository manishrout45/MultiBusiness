'use client';

import { OfferCard, type OfferItem } from './OfferCard';

const OFFERS: OfferItem[] = [
  {
    id: '1',
    title: 'Up to 50% OFF On Restaurant Orders',
    subtitle: 'Food offers',
    cta: 'Order Now',
    href: '/categories/restaurant',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    tone: 'green',
  },
  {
    id: '2',
    title: 'Fashion Sale 30-70% OFF',
    subtitle: 'Limited time',
    cta: 'Shop Now',
    href: '/categories/retail',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    tone: 'orange',
  },
  {
    id: '3',
    title: 'Electronics Mega Deals',
    subtitle: 'Trusted gadgets',
    cta: 'Explore',
    href: '/categories/electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    tone: 'blue',
  },
  {
    id: '4',
    title: 'Beauty & Spa Special Offers',
    subtitle: 'Local services',
    cta: 'Book Now',
    href: '/search?q=beauty',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
    tone: 'purple',
  },
];

export function OffersSection() {
  return (
    <section className="bg-white/60 py-12 md:py-16">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Offers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Big promotional banners from businesses near you
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {OFFERS.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { OfferCard };
export type { OfferItem };
