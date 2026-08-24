import { DEFAULT_WORKING_HOURS } from '@/lib/constants';
import type { VendorProfile } from './types';

export const MOCK_VENDOR_PROFILE: VendorProfile = {
  id: 'biz-1',
  vendorId: 'vendor-1',
  slug: 'sharma-electronics',
  logoUrl: 'https://images.unsplash.com/photo-1560179707-f14eea528764?w=200&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  status: 'approved',
  rating: 4.7,
  reviewCount: 128,
  business: {
    name: 'Sharma Electronics',
    description:
      'Trusted local electronics store offering mobiles, laptops, accessories, and repair services with genuine warranty support.',
    category: 'Electronics',
    categorySlug: 'electronics',
    address: '12 Market Road, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    latitude: 19.1197,
    longitude: 72.8464,
    phone: '+919876543210',
    whatsapp: '+919876543210',
    email: 'hello@sharmaelectronics.local',
    website: 'https://example.com',
  },
  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: '',
    linkedin: '',
    youtube: '',
  },
  workingHours: { ...DEFAULT_WORKING_HOURS },
  gallery: [
    {
      id: 'g1',
      url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      caption: 'Storefront',
    },
    {
      id: 'g2',
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      caption: 'Service desk',
    },
  ],
  updatedAt: new Date().toISOString(),
};
