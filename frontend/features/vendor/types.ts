import type { Weekday } from '@/lib/constants';

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export type WorkingHours = Record<Weekday, DayHours>;

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

export interface BusinessDetails {
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface VendorProfile {
  id: string;
  vendorId: string;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rating: number;
  reviewCount: number;
  business: BusinessDetails;
  social: SocialLinks;
  workingHours: WorkingHours;
  gallery: GalleryItem[];
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  mediaType?: 'image' | 'video';
}

export type VendorProfileUpdate = Partial<
  Pick<VendorProfile, 'logoUrl' | 'coverUrl' | 'social' | 'workingHours' | 'gallery'>
> & {
  business?: Partial<BusinessDetails>;
};
