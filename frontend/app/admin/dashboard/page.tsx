import type { Metadata } from 'next';
import { AdminDashboardPageClient } from '@/features/admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  description: 'Platform administration, vendors, users, and commissions.',
};

export default function AdminDashboardPage() {
  return <AdminDashboardPageClient />;
}
