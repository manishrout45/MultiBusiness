'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { VendorProfileCard } from '@/features/vendor/VendorProfileCard';
import { BusinessInfoForm } from '@/features/vendor/BusinessInfoForm';
import { BusinessGallery } from '@/features/vendor/BusinessGallery';
import { SocialLinks } from '@/features/vendor/SocialLinks';
import { WorkingHours } from '@/features/vendor/WorkingHours';
import type { BusinessDetails, SocialLinks as SocialLinksType, VendorProfile, WorkingHours as WorkingHoursType } from '@/features/vendor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getVendorProfile,
  updateVendorProfile,
  uploadVendorImage,
} from '@/services/vendorService';

export function VendorProfilePageClient() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [social, setSocial] = useState<SocialLinksType | null>(null);
  const [hours, setHours] = useState<WorkingHoursType | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVendorProfile()
      .then((data) => {
        setProfile(data);
        setBusiness(data.business);
        setSocial(data.social);
        setHours(data.workingHours);
      })
      .catch(() => setError('Failed to load vendor profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (patch: Parameters<typeof updateVendorProfile>[0]) => {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const next = await updateVendorProfile(patch);
      setProfile(next);
      setBusiness(next.business);
      setSocial(next.social);
      setHours(next.workingHours);
      setMessage('Profile updated successfully');
    } catch {
      setError('Unable to save changes');
    } finally {
      setPending(false);
    }
  };

  const onUploadBrand = async (kind: 'logo' | 'cover', file?: File | null) => {
    if (!file || !profile) return;
    setPending(true);
    try {
      const url = await uploadVendorImage(kind, file);
      const next = await updateVendorProfile(
        kind === 'logo' ? { logoUrl: url } : { coverUrl: url }
      );
      setProfile(next);
      setMessage(`${kind === 'logo' ? 'Logo' : 'Cover'} updated`);
    } catch {
      setError('Image upload failed');
    } finally {
      setPending(false);
    }
  };

  const onAddGallery = async (files: FileList | null) => {
    if (!files?.length || !profile) return;
    setPending(true);
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        const url = await uploadVendorImage('gallery', file);
        uploaded.push({
          id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url,
          caption: file.name,
        });
      }
      await save({ gallery: [...profile.gallery, ...uploaded] });
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile || !business || !social || !hours) {
    return <p className="text-sm text-red-600">{error || 'Profile unavailable'}</p>;
  }

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {error || message}
        </div>
      )}

      <VendorProfileCard profile={profile} />

      <Card>
        <CardHeader>
          <CardTitle>Brand images</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <label>
            <Button type="button" variant="outline" asChild disabled={pending}>
              <span>
                <ImagePlus /> Upload logo
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadBrand('logo', e.target.files?.[0])}
            />
          </label>
          <label>
            <Button type="button" variant="outline" asChild disabled={pending}>
              <span>
                <ImagePlus /> Upload cover
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadBrand('cover', e.target.files?.[0])}
            />
          </label>
          {pending && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
        </CardContent>
      </Card>

      <BusinessInfoForm
        value={business}
        onChange={setBusiness}
        pending={pending}
        onSubmit={() => save({ business })}
      />
      <SocialLinks
        value={social}
        onChange={setSocial}
        pending={pending}
        onSubmit={() => save({ social })}
      />
      <WorkingHours
        value={hours}
        onChange={setHours}
        pending={pending}
        onSubmit={() => save({ workingHours: hours })}
      />
      <BusinessGallery
        items={profile.gallery}
        pending={pending}
        onAdd={onAddGallery}
        onRemove={(id) =>
          save({ gallery: profile.gallery.filter((g) => g.id !== id) })
        }
      />
    </div>
  );
}
