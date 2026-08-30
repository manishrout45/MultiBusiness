import { useEffect } from 'react';
import { VendorRegisterPageClient } from '@/features/vendor/VendorRegisterPageClient';

export default function VendorRegisterPage() {
  useEffect(() => {
    document.title = 'Become a Seller — LocalMart';
  }, []);

  return (
    <div className="container py-10 md:py-14">
      <VendorRegisterPageClient />
    </div>
  );
}
