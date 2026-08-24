import type { Metadata } from 'next';
import { VendorProductsPageClient } from '@/features/products/VendorProductsPageClient';

export const metadata: Metadata = {
  title: 'Vendor products',
  description: 'Manage your product catalog.',
};

export default function VendorProductsPage() {
  return <VendorProductsPageClient />;
}
