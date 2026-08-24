import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BusinessHeader, BusinessProfileContent } from '@/features/business-page';
import { MOCK_PRODUCTS } from '@/features/products';
import { MOCK_VENDOR_PROFILE } from '@/features/vendor';
import { fetchBusinessBySlug } from '@/services/businessService';
import { listVendorProducts } from '@/services/productService';

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === MOCK_VENDOR_PROFILE.slug) {
    return {
      title: MOCK_VENDOR_PROFILE.business.name,
      description: MOCK_VENDOR_PROFILE.business.description,
    };
  }
  const business = await fetchBusinessBySlug(slug);
  return {
    title: business?.name ?? 'Business',
    description: business?.description,
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const apiBusiness = await fetchBusinessBySlug(slug);
  const isDemoSlug = slug === MOCK_VENDOR_PROFILE.slug;

  if (!apiBusiness && !isDemoSlug) {
    notFound();
  }

  const profile = isDemoSlug || !apiBusiness
      ? MOCK_VENDOR_PROFILE
      : {
          ...MOCK_VENDOR_PROFILE,
          id: apiBusiness.id,
          slug: apiBusiness.slug,
          logoUrl: apiBusiness.imageUrl,
          coverUrl: apiBusiness.coverUrl || apiBusiness.imageUrl,
          rating: apiBusiness.rating,
          reviewCount: apiBusiness.reviewCount,
          business: {
            ...MOCK_VENDOR_PROFILE.business,
            name: apiBusiness.name,
            description: apiBusiness.description,
            category: apiBusiness.category,
            categorySlug: apiBusiness.categorySlug,
            address: apiBusiness.location,
            city: apiBusiness.city,
            phone: apiBusiness.phone || MOCK_VENDOR_PROFILE.business.phone,
            email: apiBusiness.email,
            website: apiBusiness.website,
          },
          gallery:
            apiBusiness.gallery
              ?.map((g, index) => ({
                id: String(g.id ?? index),
                url: g.url || g.file_path || '',
                caption: g.caption || undefined,
              }))
              .filter((g) => g.url) ?? MOCK_VENDOR_PROFILE.gallery,
        };

  let products = MOCK_PRODUCTS;
  try {
    const listed = await listVendorProducts();
    if (listed.length) products = listed;
  } catch {
    products = MOCK_PRODUCTS;
  }

  if (apiBusiness?.products?.length) {
    products = apiBusiness.products.map((p) => ({
      id: String(p.id),
      name: p.name,
      description: p.description || '',
      price: Number(p.price),
      salePrice: p.sale_price != null ? Number(p.sale_price) : null,
      images: [],
      category: profile.business.category,
      categorySlug: profile.business.categorySlug,
      stock: Number(p.stock ?? 0),
      variations: [],
      vendorId: profile.vendorId,
      status: 'published' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  const reviews = [
    {
      id: 'r1',
      author: 'Ananya S.',
      rating: 5,
      comment: 'Excellent service and genuine products. Highly recommended local store.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'r2',
      author: 'Rohit K.',
      rating: 4,
      comment: 'Good pricing and quick support. Will visit again.',
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div>
      <BusinessHeader profile={profile} />
      <BusinessProfileContent
        profile={profile}
        products={products}
        reviews={reviews}
        slug={slug}
      />
    </div>
  );
}
