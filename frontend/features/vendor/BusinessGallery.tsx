'use client';

import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GalleryItem } from '@/features/vendor';

interface BusinessGalleryProps {
  items: GalleryItem[];
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  pending?: boolean;
}

export function BusinessGallery({ items, onAdd, onRemove, pending }: BusinessGalleryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
        <CardDescription>Showcase your store, products, and workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image src={item.url} alt={item.caption || 'Gallery'} fill className="object-cover" />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition hover:bg-muted/50">
            <Plus className="size-5" />
            Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={pending}
              onChange={(e) => onAdd(e.target.files)}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
