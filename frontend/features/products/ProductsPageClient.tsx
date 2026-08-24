'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import {
  searchCatalogProducts,
  type CatalogProduct,
} from '@/services/catalogService';
import { fetchBusinesses } from '@/services/businessService';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
] as const;

export function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isAuthenticated } = useAuth();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') || '');
  const [businessId, setBusinessId] = useState(searchParams.get('businessId') || '');
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['value']>(
    (searchParams.get('sort') as (typeof SORT_OPTIONS)[number]['value']) || 'newest'
  );
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await searchCatalogProducts({
      q: query.trim() || undefined,
      categorySlug: categorySlug || undefined,
      businessId: businessId || undefined,
      sort,
      limit: 48,
    });
    setProducts(data);
    setLoading(false);
  }, [query, categorySlug, businessId, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void fetchBusinesses({ limit: 40 }).then((res) => {
      setBusinesses(res.data.map((b) => ({ id: b.id, name: b.name })));
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistService.list(token).then((items) => {
      setWishlistIds(new Set(items.map((i) => i.productId)));
    });
  }, [isAuthenticated, token]);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (categorySlug) params.set('category', categorySlug);
    if (businessId) params.set('businessId', businessId);
    if (sort !== 'newest') params.set('sort', sort);
    router.push(`/products${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse local products from verified businesses near you.
        </p>
      </div>

      <form
        onSubmit={applyFilters}
        className="mb-8 grid gap-3 rounded-3xl border bg-card p-4 marketplace-shadow sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="relative sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="h-11 pl-9"
          />
        </label>
        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {MARKETPLACE_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-11 rounded-md border border-input bg-background px-3 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="submit" className="h-11 rounded-xl">
          Apply
        </Button>
      </form>

      {businessId && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered by business</span>
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => {
              setBusinessId('');
              router.push('/products');
            }}
          >
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-3xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try another search or browse categories."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              vendorName={product.businessName}
              businessSlug={product.businessSlug}
              rating={product.rating}
              wishlisted={wishlistIds.has(product.id)}
              onWishlistChange={(id, next) => {
                setWishlistIds((prev) => {
                  const copy = new Set(prev);
                  if (next) copy.add(id);
                  else copy.delete(id);
                  return copy;
                });
              }}
              className={cn('w-full')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
