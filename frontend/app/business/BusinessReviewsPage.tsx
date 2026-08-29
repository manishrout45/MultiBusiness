import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReviewsPageClient } from '@/features/reviews';
import { MOCK_PRODUCTS } from '@/features/products';
import { MOCK_VENDOR_PROFILE } from '@/features/vendor';
import { fetchBusinessBySlug } from '@/services/businessService';
import NotFound from '@/app/not-found';

export default function BusinessReviewsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [missing, setMissing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

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

      const name =
        isDemoSlug ? MOCK_VENDOR_PROFILE.business.name : apiBusiness!.name;
      document.title = `${name} — Reviews | LocalMart`;

      if (!cancelled) {
        setBusinessId(isDemoSlug ? MOCK_VENDOR_PROFILE.id : apiBusiness!.id);
        setBusinessName(name);
        setProducts(
          apiBusiness?.products?.map((p) => ({
            id: String(p.id),
            name: p.name,
          })) ?? MOCK_PRODUCTS.map((p) => ({ id: p.id, name: p.name }))
        );
        setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (missing) return <NotFound />;
  if (!loaded || !slug) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading reviews…</div>;
  }

  return (
    <ReviewsPageClient
      businessId={businessId}
      businessName={businessName}
      businessSlug={slug}
      products={products}
    />
  );
}
