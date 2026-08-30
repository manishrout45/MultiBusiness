import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BusinessHeader, BusinessProfileContent } from '@/features/business-page';
import { MOCK_PRODUCTS } from '@/features/products';
import { MOCK_VENDOR_PROFILE, type VendorProfile } from '@/features/vendor';
import { fetchBusinessBySlug } from '@/services/businessService';
import { listVendorProducts } from '@/services/productService';
import type { Product } from '@/features/products';
import NotFound from '@/app/not-found';

export default function BusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [missing, setMissing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      const apiBusiness = await fetchBusinessBySlug(slug);
      const isDemoSlug = slug === MOCK_VENDOR_PROFILE.slug;

      if (!apiBusiness && !isDemoSlug) {
        if (!cancelled) {
          setMissing(true);
          setLoaded(true);
        }
        return;
      }

      const nextProfile =
        isDemoSlug || !apiBusiness
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

      document.title = `${nextProfile.business.name} | LocalMart`;

      let nextProducts = MOCK_PRODUCTS;
      try {
        const listed = await listVendorProducts();
        if (listed.length) nextProducts = listed;
      } catch {
        nextProducts = MOCK_PRODUCTS;
      }

      if (apiBusiness?.products?.length) {
        nextProducts = apiBusiness.products.map((p) => ({
          id: String(p.id),
          name: p.name,
          description: p.description || '',
          price: Number(p.price),
          salePrice: p.sale_price != null ? Number(p.sale_price) : null,
          images: [],
          category: nextProfile.business.category,
          categorySlug: nextProfile.business.categorySlug,
          stock: Number(p.stock ?? 0),
          variations: [],
          vendorId: nextProfile.vendorId,
          status: 'published' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }

      if (!cancelled) {
        setProfile(nextProfile);
        setProducts(nextProducts);
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (missing) return <NotFound />;
  if (!loaded || !profile || !slug) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading business…</div>;
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
