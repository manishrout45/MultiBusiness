import { useEffect } from 'react';
import { CategoriesExplorer } from '@/features/categories';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';

export default function VendorCategoriesPage() {
  useEffect(() => {
    document.title = 'Vendor categories | LocalMart';
  }, []);

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
