import { useEffect } from 'react';
import { CheckoutPageClient } from '@/features/payment/CheckoutPageClient';

export default function CheckoutPage() {
  useEffect(() => {
    document.title = 'Checkout | LocalMart';
  }, []);

  return <CheckoutPageClient />;
}
