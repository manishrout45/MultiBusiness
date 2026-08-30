import { useEffect } from 'react';
import { CartPageClient } from '@/features/cart';

export default function CartPage() {
  useEffect(() => {
    document.title = 'Cart | LocalMart';
  }, []);

  return <CartPageClient />;
}
