import type { Metadata } from 'next';
import { CategoriesExplorer } from '@/features/categories';
import { listCategories } from '@/services/categoryService';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse local businesses by category.',
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="container py-12 md:py-16">
      <CategoriesExplorer categories={categories} />
    </div>
  );
}
