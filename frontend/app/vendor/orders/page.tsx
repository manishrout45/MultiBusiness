import { useEffect } from 'react';
import { VendorOrdersPageClient } from '@/features/vendor-dashboard/VendorOrdersPageClient';

export default function VendorOrdersPage() {
  useEffect(() => {
    document.title = 'Vendor Orders — LocalMart';
  }, []);

  return <VendorOrdersPageClient />;
}
