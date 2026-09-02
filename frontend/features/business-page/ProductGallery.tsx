'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/features/products';

interface ProductGalleryProps {
  products: Product[];
  vendorId: string;
  vendorName: string;
}

export function ProductGallery({ products, vendorId, vendorName }: ProductGalleryProps) {
  const { addItem, isUpdating } = useCart();
  const { toast } = useToast();

  const placeholderImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop';

  async function handleAdd(product: Product) {
    await addItem({
      productId: product.id,
      vendorId,
      vendorName,
      productName: product.name,
      image: product.images[0] || placeholderImage,
      price: product.salePrice ?? product.price,
      quantity: 1,
    });
    toast({
      title: 'Added to cart',
      description: product.name,
      variant: 'success',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[375px]:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                className="overflow-hidden rounded-xl border bg-card"
              >
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      src={product.images[0] || placeholderImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="space-y-2 p-3">
                  <h3 className="font-medium leading-tight">
                    <Link href={`/products/${product.id}`} className="hover:text-primary hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-primary">
                      ₹{(product.salePrice ?? product.price).toLocaleString()}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={isUpdating || product.stock <= 0}
                      onClick={() => void handleAdd(product)}
                    >
                      <ShoppingCart className="mr-1 size-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
