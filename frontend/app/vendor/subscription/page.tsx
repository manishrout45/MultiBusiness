import type { Metadata } from 'next';
import { SubscriptionPageClient } from '@/features/subscription';

export const metadata: Metadata = {
  title: 'Subscription',
  description: 'Choose a LocalMarket vendor subscription plan.',
};

export default function VendorSubscriptionPage() {
  return <SubscriptionPageClient />;
}
