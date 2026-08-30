import { useEffect } from 'react';
import { HomeDiscoveryPage } from '@/components/discovery/HomeDiscoveryPage';

export default function HomePage() {
  useEffect(() => {
    document.title = 'LocalMart — Discover nearby stores & products';
  }, []);

  return <HomeDiscoveryPage />;
}
