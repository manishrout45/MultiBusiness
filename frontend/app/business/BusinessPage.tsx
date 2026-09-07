import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BusinessHeader, BusinessProfileContent } from '@/features/business-page';
import { MOCK_VENDOR_PROFILE, type VendorProfile } from '@/features/vendor';
import { fetchBusinessBySlug } from '@/services/businessService';
import type { Product } from '@/features/products';
import NotFound from '@/app/not-found';

function mapBusinessProducts(
  rows: Array<{
    id: number | string;
    name: string;
    description?: string | null;
    price: number | string;
    sale_price?: number | string | null;
    stock?: number | string;
    image_url?: string | null;
    category_name?: string | null;
    category_slug?: string | null;
  }>,
  vendorId: string,
  categoryFallback: string,
  categorySlugFallback: string
): Product[] {
  return rows.map((p) => ({
    id: String(p.id),
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    salePrice: p.sale_price != null ? Number(p.sale_price) : null,
    images: p.image_url ? [String(p.image_url)] : [],
    category: p.category_name || categoryFallback,
    categorySlug: p.category_slug || categorySlugFallback,
    stock: Number(p.stock ?? 0),
    variations: [],
    vendorId,
    status: 'published' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export default function BusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [missing, setMissing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      const apiBusiness = await fetchBusinessBySlug(slug);

      if (!apiBusiness) {
        if (!cancelled) {
          setMissing(true);
          setLoaded(true);
        }
        return;
      }

      const nextProfile: VendorProfile = {
        ...MOCK_VENDOR_PROFILE,
        id: apiBusiness.id,
        vendorId: apiBusiness.id,
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
            .filter((g) => g.url) ?? [],
      };

      document.title = `${nextProfile.business.name} | LocalMart`;

      const nextProducts = mapBusinessProducts(
        apiBusiness.products || [],
        nextProfile.vendorId,
        nextProfile.business.category,
        nextProfile.business.categorySlug
      );

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

  return (
    <div>
      <BusinessHeader profile={profile} />
      <BusinessProfileContent
        profile={profile}
        products={products}
        reviews={[]}
        slug={slug}
      />
    </div>
  );
}
