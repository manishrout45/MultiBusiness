import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/Hero';
import { NearbyBusinessesSection } from '@/components/business';
import { PopularCategoriesSection } from '@/components/categories';
import { LocalOffersSection } from '@/components/offers';
import { SuccessStoriesSection, DEFAULT_SUCCESS_STORIES } from '@/components/success-stories';
import { TrustSection } from '@/components/trust';
import { VendorCtaSection } from '@/components/vendor';
import { FEATURED_BUSINESSES } from '@/features/businesses';
import { fetchFeaturedBusinesses } from '@/services/businessService';
import { fetchSuccessStories } from '@/services/successStoriesService';

export default function HomePage() {
  const [businesses, setBusinesses] = useState(FEATURED_BUSINESSES);
  const [successStories, setSuccessStories] = useState(DEFAULT_SUCCESS_STORIES);

  useEffect(() => {
    document.title = 'LocalMart — Everything Local, One Marketplace';
    let cancelled = false;

    (async () => {
      try {
        const featured = await fetchFeaturedBusinesses();
        if (!cancelled && featured.length) {
          setBusinesses(
            featured.map((b, i) => ({
              ...b,
              distanceKm: FEATURED_BUSINESSES[i % FEATURED_BUSINESSES.length]?.distanceKm,
              isOpen: FEATURED_BUSINESSES[i % FEATURED_BUSINESSES.length]?.isOpen ?? true,
              badge: b.featured
                ? 'Bestseller'
                : FEATURED_BUSINESSES[i % FEATURED_BUSINESSES.length]?.badge,
            }))
          );
        }
      } catch {
        if (!cancelled) setBusinesses(FEATURED_BUSINESSES);
      }

      const stories = await fetchSuccessStories();
      if (!cancelled) setSuccessStories(stories);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
