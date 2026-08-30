'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SocialLinks } from '@/features/vendor';

interface SocialLinksFormProps {
  value: SocialLinks;
  onChange: (next: SocialLinks) => void;
  onSubmit: () => void;
  pending?: boolean;
}

const FIELDS: { key: keyof SocialLinks; label: string }[] = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
];

export function SocialLinksForm({ value, onChange, onSubmit, pending }: SocialLinksFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social links</CardTitle>
        <CardDescription>Help customers find you on social platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="url"
                placeholder="https://"
                value={value[field.key] || ''}
                onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save social links'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** Alias matching requested filename SocialLinks.tsx export */
export { SocialLinksForm as SocialLinks };
