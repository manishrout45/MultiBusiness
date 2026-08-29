import { AUTH_TOKEN_KEY } from '@/features/auth/types';
import { MOCK_VENDOR_PROFILE, type VendorProfile, type VendorProfileUpdate } from '@/features/vendor';
import { apiRequest, ApiError } from '@/lib/api';

export async function registerVendor(input: {
  ownerName: string;
  businessName: string;
  businessType: string;
  categoryId?: string | number;
  description?: string;
  address: string;
  city: string;
  state?: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  logo?: File;
  cover?: File;
}): Promise<unknown> {
  const token = getToken();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

  const form = new FormData();
  form.append('owner_name', input.ownerName);
  form.append('business_name', input.businessName);
  form.append('business_type', input.businessType);
  form.append('address', input.address);
  form.append('city', input.city);
  form.append('phone', input.phone);
  if (input.categoryId != null) form.append('category_id', String(input.categoryId));
  if (input.description) form.append('description', input.description);
  if (input.state) form.append('state', input.state);
  if (input.email) form.append('email', input.email);
  if (input.gstNumber) form.append('gst_number', input.gstNumber);
  if (input.logo) form.append('logo', input.logo);
  if (input.cover) form.append('cover', input.cover);

  const response = await fetch(`${API_BASE}/vendor/register`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

let localProfile: VendorProfile = structuredClone(MOCK_VENDOR_PROFILE);

function mapApiToProfile(row: Record<string, unknown>): VendorProfile {
  return {
    ...MOCK_VENDOR_PROFILE,
    id: String(row.id ?? MOCK_VENDOR_PROFILE.id),
    slug: String(row.slug ?? MOCK_VENDOR_PROFILE.slug),
    logoUrl: (row.logo as string) || MOCK_VENDOR_PROFILE.logoUrl,
    coverUrl: (row.cover_image as string) || MOCK_VENDOR_PROFILE.coverUrl,
    status: (row.status as VendorProfile['status']) || 'pending',
    business: {
      name: String(row.business_name ?? MOCK_VENDOR_PROFILE.business.name),
      description: String(row.description ?? ''),
      category: String(row.business_type ?? MOCK_VENDOR_PROFILE.business.category),
      categorySlug: String(row.category_slug ?? MOCK_VENDOR_PROFILE.business.categorySlug),
      address: String(row.address ?? ''),
      city: String(row.city ?? ''),
      state: (row.state as string) || '',
      pincode: (row.pincode as string) || '',
      phone: String(row.phone ?? ''),
      whatsapp: (row.whatsapp as string) || '',
      email: (row.email as string) || '',
      website: (row.website as string) || '',
      latitude: row.latitude != null ? Number(row.latitude) : null,
      longitude: row.longitude != null ? Number(row.longitude) : null,
    },
    social: {
      facebook: (row.facebook_url as string) || '',
      instagram: (row.instagram_url as string) || '',
      linkedin: (row.linkedin_url as string) || '',
      youtube: (row.youtube_url as string) || '',
      twitter: (row.twitter_url as string) || '',
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function getVendorProfile(): Promise<VendorProfile> {
  try {
    const token = getToken();
    const res = await apiRequest<{ data: Record<string, unknown> }>('/vendor/profile', {
      token,
    });
    localProfile = mapApiToProfile(res.data);
    return structuredClone(localProfile);
  } catch {
    return structuredClone(localProfile);
  }
}

export async function updateVendorProfile(update: VendorProfileUpdate): Promise<VendorProfile> {
  localProfile = {
    ...localProfile,
    ...update,
    business: { ...localProfile.business, ...update.business },
    social: { ...localProfile.social, ...update.social },
    workingHours: update.workingHours ?? localProfile.workingHours,
    gallery: update.gallery ?? localProfile.gallery,
    updatedAt: new Date().toISOString(),
  };

  try {
    const token = getToken();
    const b = localProfile.business;
    await apiRequest('/vendor/profile', {
      method: 'PUT',
      token,
      body: {
        business_name: b.name,
        business_type: b.category,
        description: b.description,
        address: b.address,
        city: b.city,
        state: b.state,
        pincode: b.pincode,
        phone: b.phone,
        whatsapp: b.whatsapp,
        email: b.email,
        website: b.website,
        latitude: b.latitude,
        longitude: b.longitude,
        facebook_url: localProfile.social.facebook,
        instagram_url: localProfile.social.instagram,
        linkedin_url: localProfile.social.linkedin,
        youtube_url: localProfile.social.youtube,
        twitter_url: localProfile.social.twitter,
        working_hours: localProfile.workingHours,
      },
    });
  } catch {
    // Keep local optimistic state for offline/demo use
  }

  return structuredClone(localProfile);
}

export async function uploadVendorImage(
  kind: 'logo' | 'cover' | 'gallery',
  file: File
): Promise<string> {
  const token = getToken();
  const form = new FormData();
  const field = kind === 'logo' ? 'logo' : kind === 'cover' ? 'cover' : 'media';
  form.append(field, file);

  const endpoint =
    kind === 'logo'
      ? '/vendor/profile/logo'
      : kind === 'cover'
        ? '/vendor/profile/cover'
        : '/vendor/gallery';

  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!response.ok) throw new Error('Upload failed');
    const json = (await response.json()) as {
      data?: { logo?: string; cover_image?: string; file_path?: string };
    };
    return (
      json.data?.logo ||
      json.data?.cover_image ||
      json.data?.file_path ||
      URL.createObjectURL(file)
    );
  } catch {
    return URL.createObjectURL(file);
  }
}
