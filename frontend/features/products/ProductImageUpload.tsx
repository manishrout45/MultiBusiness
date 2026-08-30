'use client';

import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ProductImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ProductImageUpload({ images, onChange }: ProductImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label>Product images</Label>
      <div className="flex flex-wrap gap-3">
        {images.map((src) => (
          <div key={src} className="relative size-20 overflow-hidden rounded-xl border bg-muted">
            <Image src={src} alt="" fill className="object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white"
              onClick={() => onChange(images.filter((i) => i !== src))}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <label className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
          <Plus className="size-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onChange([...images, URL.createObjectURL(file)]);
            }}
          />
        </label>
      </div>
    </div>
  );
}
