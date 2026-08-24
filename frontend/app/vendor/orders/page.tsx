import type { Metadata } from 'next';
import { VendorOrdersPageClient } from '@/features/vendor-dashboard/VendorOrdersPageClient';

export const metadata: Metadata = {
  title: 'Vendor Orders — LocalMart',
};

export default function VendorOrdersPage() {
  return <VendorOrdersPageClient />;
}
