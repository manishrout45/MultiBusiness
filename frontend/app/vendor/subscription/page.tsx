import { useEffect } from 'react';
import { SubscriptionPageClient } from '@/features/subscription';

export default function VendorSubscriptionPage() {
  useEffect(() => {
    document.title = 'Subscription | LocalMart';
  }, []);

  return <SubscriptionPageClient />;
}
