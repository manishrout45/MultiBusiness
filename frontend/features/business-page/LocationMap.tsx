import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VendorProfile } from '@/features/vendor';

export function LocationMap({ profile }: { profile: VendorProfile }) {
  const query = encodeURIComponent(
    `${profile.business.address}, ${profile.business.city}`
  );
  const src =
    profile.business.latitude && profile.business.longitude
      ? `https://maps.google.com/maps?q=${profile.business.latitude},${profile.business.longitude}&z=15&output=embed`
      : `https://maps.google.com/maps?q=${query}&z=14&output=embed`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border">
          <iframe
            title={`${profile.business.name} map`}
            src={src}
            className="h-64 w-full border-0 md:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {profile.business.address}, {profile.business.city}
          {profile.business.state ? `, ${profile.business.state}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}
