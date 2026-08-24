import type { Metadata } from 'next';
import { VendorDashboardPageClient } from '@/features/vendor-dashboard';

export const metadata: Metadata = {
  title: 'Vendor dashboard',
  description: 'Sales, orders, products, and analytics for your business.',
};

export default function VendorDashboardPage() {
  return <VendorDashboardPageClient />;
}
