import { useEffect } from 'react';
import { WishlistPageClient } from './WishlistPageClient';

export default function WishlistPage() {
  useEffect(() => {
    document.title = 'Wishlist — LocalMart';
  }, []);

  return <WishlistPageClient />;
}
