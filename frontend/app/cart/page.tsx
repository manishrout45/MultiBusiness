import type { Metadata } from 'next';
import { CartPageClient } from '@/features/cart';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your cart and proceed to checkout.',
};

export default function CartPage() {
  return <CartPageClient />;
}
