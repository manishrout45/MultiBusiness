import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vendor',
};

export default function VendorHomePage() {
  redirect('/vendor/dashboard');
}
