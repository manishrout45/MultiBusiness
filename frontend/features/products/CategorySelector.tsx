'use client';

import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CategorySelectorProps {
  value: string;
  onChange: (slug: string, name: string) => void;
  label?: string;
}

export function CategorySelector({ value, onChange, label = 'Category' }: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(slug) => {
          const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
          onChange(slug, cat?.name ?? slug);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {MARKETPLACE_CATEGORIES.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
