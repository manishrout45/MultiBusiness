'use client';

import { useEffect, useState } from 'react';
import { PackagePlus } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { VendorApprovalGate } from '@/components/vendor/VendorApprovalGate';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/features/products/ProductCard';
import { ProductForm } from '@/features/products/ProductForm';
import { ProductTable } from '@/features/products/ProductTable';
import type { Product, ProductInput } from '@/features/products';
import {
  createProduct,
  deleteProduct,
  listVendorProducts,
  updateProduct,
} from '@/services/productService';

function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setProducts(await listVendorProducts());
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onSubmit = async (input: ProductInput) => {
    if (editing) {
      await updateProduct(editing.id, input);
    } else {
      await createProduct(input);
    }
    await refresh();
  };

  const onDelete = async (product: Product) => {
    if (!window.confirm(`Delete “${product.name}”?`)) return;
    await deleteProduct(product.id);
    await refresh();
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div />
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <PackagePlus /> Add product
        </Button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to start selling on LocalMart."
          actionLabel="Add product"
          onAction={() => {
            setEditing(null);
            setOpen(true);
          }}
        />
      ) : (
        <>
          <ProductTable
            products={products}
            onEdit={(p) => {
              setEditing(p);
              setOpen(true);
            }}
            onDelete={onDelete}
          />
          <div className="grid gap-4 sm:grid-cols-2 md:hidden lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => {
                  setEditing(p);
                  setOpen(true);
                }}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}

      <ProductForm
        key={editing?.id ?? 'new'}
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSubmit={onSubmit}
      />
    </>
  );
}

export function VendorProductsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, and manage your catalog inventory.
        </p>
      </div>

      <VendorApprovalGate>
        <ProductsManager />
      </VendorApprovalGate>
    </div>
  );
}
