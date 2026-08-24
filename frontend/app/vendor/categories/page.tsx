import type { Metadata } from 'next';
import { CategoriesExplorer } from '@/features/categories';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Vendor categories',
};

export default function VendorCategoriesPage() {
  return (
    <CategoriesExplorer
      title="Category catalog"
      description="Browse marketplace categories available for your products and business."
      hrefBase="/categories"
      categories={MARKETPLACE_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
      }))}
    />
  );
}
