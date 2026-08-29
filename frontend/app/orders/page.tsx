import { useEffect } from 'react';
import { OrdersPageClient } from '@/features/orders';

export default function OrdersPage() {
  useEffect(() => {
    document.title = 'Orders | LocalMart';
  }, []);

  return <OrdersPageClient />;
}
