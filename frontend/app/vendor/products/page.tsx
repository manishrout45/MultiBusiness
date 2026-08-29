import { useEffect } from 'react';
import { VendorProductsPageClient } from '@/features/products/VendorProductsPageClient';

export default function VendorProductsPage() {
  useEffect(() => {
    document.title = 'Vendor products | LocalMart';
  }, []);

  return <VendorProductsPageClient />;
}
