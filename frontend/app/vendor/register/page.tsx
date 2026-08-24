import type { Metadata } from 'next';
import { VendorRegisterPageClient } from '@/features/vendor/VendorRegisterPageClient';

export const metadata: Metadata = {
  title: 'Become a Seller — LocalMart',
  description: 'Register your business on LocalMart and start selling locally.',
};

export default function VendorRegisterPage() {
  return (
    <div className="container py-10 md:py-14">
      <VendorRegisterPageClient />
    </div>
  );
}
