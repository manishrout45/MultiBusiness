'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/features/products';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}>
      <Card className="overflow-hidden">
        <div className="relative aspect-[16/10] bg-muted">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
          ) : null}
          <Badge className="absolute left-3 top-3" variant={product.stock > 0 ? 'success' : 'warning'}>
            {product.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardContent className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase text-primary">{product.category}</p>
          <h3 className="font-semibold leading-tight">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="flex items-center justify-between pt-1">
            <p className="font-semibold text-foreground">
              ₹{(product.salePrice ?? product.price).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
          </div>
        </CardContent>
        <CardFooter className="gap-2 p-4 pt-0">
          <Button variant="outline" className="flex-1" onClick={() => onEdit(product)}>
            Edit
          </Button>
          <Button variant="ghost" className="flex-1 text-red-600" onClick={() => onDelete(product)}>
            Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
