import type { Metadata } from 'next';
import { OrdersPageClient } from '@/features/orders';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'View your order history and track deliveries.',
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
