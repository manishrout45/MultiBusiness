import { useEffect } from 'react';
import { AdminDashboardPageClient } from '@/features/admin-dashboard';

export default function AdminDashboardPage() {
  useEffect(() => {
    document.title = 'Admin dashboard | LocalMart';
  }, []);

  return <AdminDashboardPageClient />;
}
