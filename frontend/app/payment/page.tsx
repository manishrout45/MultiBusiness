import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentPageClient } from '@/features/payment';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Payment',
};

function PaymentFallback() {
  return (
    <div className="container py-10">
      <Skeleton className="mx-auto h-64 max-w-lg rounded-xl" />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentPageClient />
    </Suspense>
  );
}
