import type { Metadata } from 'next';
import { VendorProfilePageClient } from '@/features/vendor/VendorProfilePageClient';

export const metadata: Metadata = {
  title: 'Vendor profile',
  description: 'Manage your business profile and storefront details.',
};

export default function VendorProfilePage() {
  return <VendorProfilePageClient />;
}
