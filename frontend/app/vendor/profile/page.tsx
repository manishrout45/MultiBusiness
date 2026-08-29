import { useEffect } from 'react';
import { VendorProfilePageClient } from '@/features/vendor/VendorProfilePageClient';

export default function VendorProfilePage() {
  useEffect(() => {
    document.title = 'Vendor profile | LocalMart';
  }, []);

  return <VendorProfilePageClient />;
}
