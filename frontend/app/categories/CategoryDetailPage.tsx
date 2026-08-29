import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BusinessCard } from '@/components/BusinessCard';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { fetchBusinesses } from '@/services/businessService';
import type { Business } from '@/features/businesses';
import NotFound from '@/app/not-found';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = `${category?.name ?? 'Category'} | LocalMart`;
    if (!slug || !category) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    fetchBusinesses({ category: slug, limit: 24 }).then((result) => {
      if (!cancelled) {
        setBusinesses(result.data);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug, category]);

  if (loaded && !category) return <NotFound />;

  if (!category) {
    return <div className="container py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container py-12 md:py-16">
      <p className="text-sm text-muted-foreground">
        <Link href="/categories" className="hover:text-primary">
          Categories
        </Link>{' '}
        / {category.name}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{category.description}</p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {!loaded ? (
          <p className="col-span-full text-muted-foreground">Loading businesses…</p>
        ) : businesses.length === 0 ? (
          <p className="col-span-full text-muted-foreground">
            No businesses in this category yet. Try Search or browse all businesses.
          </p>
        ) : (
          businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))
        )}
      </div>
    </div>
  );
}
