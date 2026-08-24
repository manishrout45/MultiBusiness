import type { Metadata } from 'next';
import { WishlistPageClient } from './WishlistPageClient';

export const metadata: Metadata = {
  title: 'Wishlist — LocalMart',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
