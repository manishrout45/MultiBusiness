'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategorySelector } from '@/features/products/CategorySelector';
import { ProductImageUpload } from '@/features/products/ProductImageUpload';
import type { Product, ProductInput, ProductVariation } from '@/features/products';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Product | null;
  onSubmit: (input: ProductInput) => Promise<void>;
}

const emptyVariation = (): ProductVariation => ({
  id: `var-${Date.now()}`,
  name: 'Size',
  value: '',
  priceAdjustment: 0,
  stock: 0,
});

export function ProductForm({ open, onOpenChange, initial, onSubmit }: ProductFormProps) {
  const [pending, setPending] = useState(false);
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [salePrice, setSalePrice] = useState(String(initial?.salePrice ?? ''));
  const [stock, setStock] = useState(String(initial?.stock ?? '0'));
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? 'electronics');
  const [category, setCategory] = useState(initial?.category ?? 'Electronics');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variations, setVariations] = useState<ProductVariation[]>(initial?.variations ?? []);
  const [status, setStatus] = useState<Product['status']>(initial?.status ?? 'published');

  const resetFromInitial = () => {
    setName(initial?.name ?? '');
    setDescription(initial?.description ?? '');
    setPrice(String(initial?.price ?? ''));
    setSalePrice(String(initial?.salePrice ?? ''));
    setStock(String(initial?.stock ?? '0'));
    setCategorySlug(initial?.categorySlug ?? 'electronics');
    setCategory(initial?.category ?? 'Electronics');
    setImages(initial?.images ?? []);
    setVariations(initial?.variations ?? []);
    setStatus(initial?.status ?? 'published');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) resetFromInitial();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit product' : 'Add product'}</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            try {
              await onSubmit({
                name,
                description,
                price: Number(price),
                salePrice: salePrice ? Number(salePrice) : null,
                stock: Number(stock),
                category,
                categorySlug,
                images,
                variations,
                status: Number(stock) <= 0 ? 'out_of_stock' : status,
              });
              onOpenChange(false);
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-desc">Description</Label>
            <Textarea
              id="product-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale">Sale price</Label>
              <Input
                id="sale"
                type="number"
                min={0}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock quantity</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
            <CategorySelector
              value={categorySlug}
              onChange={(slug, nameValue) => {
                setCategorySlug(slug);
                setCategory(nameValue);
              }}
            />
          </div>

          <ProductImageUpload images={images} onChange={setImages} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Variations</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setVariations((v) => [...v, emptyVariation()])}
              >
                <Plus /> Add
              </Button>
            </div>
            {variations.map((variation, index) => (
              <div key={variation.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  placeholder="Name (Color)"
                  value={variation.name}
                  onChange={(e) => {
                    const next = [...variations];
                    next[index] = { ...variation, name: e.target.value };
                    setVariations(next);
                  }}
                />
                <Input
                  placeholder="Value (Red)"
                  value={variation.value}
                  onChange={(e) => {
                    const next = [...variations];
                    next[index] = { ...variation, value: e.target.value };
                    setVariations(next);
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setVariations((v) => v.filter((x) => x.id !== variation.id))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : initial ? 'Update product' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
