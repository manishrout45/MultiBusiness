import { useEffect } from 'react';
import { Suspense } from 'react';
import { PaymentPageClient } from '@/features/payment';
import { Skeleton } from '@/components/ui/skeleton';

function PaymentFallback() {
  return (
    <div className="container py-10">
      <Skeleton className="mx-auto h-64 max-w-lg rounded-xl" />
    </div>
  );
}

export default function PaymentPage() {
  useEffect(() => {
    document.title = 'Payment | LocalMart';
  }, []);

  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentPageClient />
    </Suspense>
  );
}
