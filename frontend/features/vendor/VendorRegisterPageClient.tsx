'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Store, Upload } from 'lucide-react';
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
import { useAuth } from '@/features/auth';
import { registerVendor } from '@/services/vendorService';
import { listCategories, type CategoryDto } from '@/services/categoryService';
import { consumeVendorRegisterDraft } from '@/lib/vendorRegister';
import { ApiError } from '@/lib/api';

export function VendorRegisterPageClient() {
  const { isAuthenticated, user, register: registerUser, refreshProfile } = useAuth();

  const [ownerName, setOwnerName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listCategories()
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) return;
    const draft = consumeVendorRegisterDraft();
    if (!draft) return;
    setOwnerName(draft.name);
    setEmail(draft.email);
    setPhone(draft.phone ?? '');
    setPassword(draft.password);
  }, [isAuthenticated]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a business category.');
      return;
    }
    setError(null);
    setPending(true);

    try {
      if (!isAuthenticated) {
        await registerUser({
          name: ownerName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          role: 'vendor',
        });
      }

      await registerVendor({
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        businessType: selectedCategory?.name ?? 'General',
        categoryId: selectedCategory?.id,
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        gstNumber: gstNumber.trim() || undefined,
        logo: logoFile ?? undefined,
        cover: coverFile ?? undefined,
      });

      await refreshProfile();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to submit registration');
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border bg-card p-8 text-center marketplace-shadow">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Application submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Your business registration is under review. We will notify you once an admin approves
          your seller account.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/vendor/dashboard">View status</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Store className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Become a Seller</h1>
        <p className="mt-2 text-muted-foreground">
          Register your local business on LocalMart. Admin approval is required before you can
          list products.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-8 rounded-3xl border bg-card p-6 marketplace-shadow sm:p-8"
      >
        {!isAuthenticated && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Account details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ownerName">Owner name</Label>
                <Input
                  id="ownerName"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-bold">Business information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                required
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={categoriesLoading || categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      categoriesLoading
                        ? 'Loading categories…'
                        : categories.length === 0
                          ? 'No categories available'
                          : 'Select category'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="gst">GST number (optional)</Label>
              <Input id="gst" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">Cover image</Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Submitting application…
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Submit for review
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
