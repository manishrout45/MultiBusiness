'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GalleryItem } from '@/features/vendor';

export function BusinessGallerySection({ items }: { items: GalleryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gallery images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={item.url} alt={item.caption || 'Gallery image'} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
