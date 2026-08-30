import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrderDetailPageClient } from '@/features/orders';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = 'Order details | LocalMart';
  }, []);

  if (!id) return null;
  return <OrderDetailPageClient orderId={id} />;
}
