'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import type { SearchFilters } from '@/services/searchService';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(v) =>
              onChange({ ...filters, category: v === 'all' ? undefined : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {MARKETPLACE_CATEGORIES.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={filters.location || ''}
            onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
            placeholder="City or area"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="minPrice">Min price</Label>
            <Input
              id="minPrice"
              type="number"
              min={0}
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max price</Label>
            <Input
              id="maxPrice"
              type="number"
              min={0}
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Min rating</Label>
          <Input
            id="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={filters.minRating ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minRating: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
