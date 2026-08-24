import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BusinessCard } from '@/components/BusinessCard';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { fetchBusinesses } from '@/services/businessService';

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
  return {
    title: category?.name ?? 'Category',
    description: category?.description,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const result = await fetchBusinesses({ category: slug, limit: 24 });

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
        {result.data.length === 0 ? (
          <p className="col-span-full text-muted-foreground">
            No businesses in this category yet. Try Search or browse all businesses.
          </p>
        ) : (
          result.data.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))
        )}
      </div>
    </div>
  );
}
