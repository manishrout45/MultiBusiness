import { useEffect, useState } from 'react';
import { CategoriesExplorer } from '@/features/categories';
import { listCategories, type CategoryDto } from '@/services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  useEffect(() => {
    document.title = 'Categories | LocalMart';
    let cancelled = false;
    listCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container py-12 md:py-16">
      <CategoriesExplorer categories={categories} />
    </div>
  );
}
