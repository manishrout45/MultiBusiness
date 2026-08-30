'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BusinessDetails } from '@/features/vendor';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';

interface BusinessInfoFormProps {
  value: BusinessDetails;
  onChange: (next: BusinessDetails) => void;
  onSubmit: () => void;
  pending?: boolean;
}

export function BusinessInfoForm({ value, onChange, onSubmit, pending }: BusinessInfoFormProps) {
  const set = <K extends keyof BusinessDetails>(key: K, val: BusinessDetails[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business information</CardTitle>
        <CardDescription>Update your public storefront details.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              value={value.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={value.description}
              onChange={(e) => set('description', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={value.categorySlug}
              onValueChange={(slug) => {
                const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
                onChange({
                  ...value,
                  categorySlug: slug,
                  category: cat?.name ?? value.category,
                });
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

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={value.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={value.whatsapp || ''}
              onChange={(e) => set('whatsapp', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={value.email || ''}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={value.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City / Location</Label>
            <Input id="city" value={value.city} onChange={(e) => set('city', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={value.state || ''}
              onChange={(e) => set('state', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              value={value.website || ''}
              onChange={(e) => set('website', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={value.pincode || ''}
              onChange={(e) => set('pincode', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save business info'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
