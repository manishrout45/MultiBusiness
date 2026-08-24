import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VendorProfile } from '@/features/vendor';

export function BusinessAbout({ profile }: { profile: VendorProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About business</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p className="text-foreground/90">{profile.business.description}</p>
        <p>
          <span className="font-medium text-foreground">Address:</span> {profile.business.address}
          {profile.business.city ? `, ${profile.business.city}` : ''}
        </p>
        {profile.business.website && (
          <p>
            <span className="font-medium text-foreground">Website:</span>{' '}
            <a href={profile.business.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
              {profile.business.website}
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
