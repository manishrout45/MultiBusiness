import type { Metadata } from 'next';
import { HeroSection } from '@/components/Hero';
import { NearbyBusinessesSection } from '@/components/business';
import { PopularCategoriesSection } from '@/components/categories';
import { LocalOffersSection } from '@/components/offers';
import { SuccessStoriesSection } from '@/components/success-stories';
import { TrustSection } from '@/components/trust';
import { VendorCtaSection } from '@/components/vendor';
import { FEATURED_BUSINESSES } from '@/features/businesses';
import { fetchFeaturedBusinesses } from '@/services/businessService';
import { fetchSuccessStories } from '@/services/successStoriesService';

export const metadata: Metadata = {
  title: 'LocalMart — Everything Local, One Marketplace',
  description: 'Discover trusted businesses, products and services near you.',
};

export default async function HomePage() {
  let businesses = FEATURED_BUSINESSES;
  try {
    const featured = await fetchFeaturedBusinesses();
    if (featured.length) {
      businesses = featured.map((b, i) => ({
        ...b,
        distanceKm: FEATURED_BUSINESSES[i % FEATURED_BUSINESSES.length]?.distanceKm,
        isOpen: FEATURED_BUSINESSES[i % FEATURED_BUSINESSES.length]?.isOpen ?? true,
        badge: b.featured
          ? 'Bestseller'
          : FEATURED_BUSINESSES[i % FEATURED_BUSINESSES.length]?.badge,
      }));
    }
  } catch {
    businesses = FEATURED_BUSINESSES;
  }

  const successStories = await fetchSuccessStories();

  return (
    <>
      <HeroSection />
      <PopularCategoriesSection />
      <div id="offers">
        <LocalOffersSection />
      </div>
      <SuccessStoriesSection stats={successStories.stats} />
      <NearbyBusinessesSection businesses={businesses} />
      <TrustSection />
      <VendorCtaSection />
    </>
  );
}
