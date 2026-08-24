import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReviewsPageClient } from '@/features/reviews';
import { MOCK_PRODUCTS } from '@/features/products';
import { MOCK_VENDOR_PROFILE } from '@/features/vendor';
import { fetchBusinessBySlug } from '@/services/businessService';

interface ReviewsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await fetchBusinessBySlug(slug);
  const name =
    slug === MOCK_VENDOR_PROFILE.slug
      ? MOCK_VENDOR_PROFILE.business.name
      : business?.name ?? 'Business';
  return {
    title: `${name} — Reviews`,
    description: `Customer reviews for ${name}`,
  };
}

export default async function BusinessReviewsPage({ params }: ReviewsPageProps) {
  const { slug } = await params;
  const apiBusiness = await fetchBusinessBySlug(slug);
  const isDemoSlug = slug === MOCK_VENDOR_PROFILE.slug;

  if (!apiBusiness && !isDemoSlug) {
    notFound();
  }

  const businessId = isDemoSlug ? MOCK_VENDOR_PROFILE.id : apiBusiness!.id;
  const businessName = isDemoSlug
    ? MOCK_VENDOR_PROFILE.business.name
    : apiBusiness!.name;

  const products =
    apiBusiness?.products?.map((p) => ({
      id: String(p.id),
      name: p.name,
    })) ??
    MOCK_PRODUCTS.map((p) => ({ id: p.id, name: p.name }));

  return (
    <ReviewsPageClient
      businessId={businessId}
      businessName={businessName}
      businessSlug={slug}
      products={products}
    />
  );
}
