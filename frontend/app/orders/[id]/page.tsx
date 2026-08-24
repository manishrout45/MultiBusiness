import type { Metadata } from 'next';
import { OrderDetailPageClient } from '@/features/orders';

export const metadata: Metadata = {
  title: 'Order details',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailPageClient orderId={id} />;
}
