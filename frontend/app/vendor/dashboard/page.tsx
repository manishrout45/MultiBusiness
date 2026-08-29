import { useEffect } from 'react';
import { VendorDashboardPageClient } from '@/features/vendor-dashboard';

export default function VendorDashboardPage() {
  useEffect(() => {
    document.title = 'Vendor dashboard | LocalMart';
  }, []);

  return <VendorDashboardPageClient />;
}
