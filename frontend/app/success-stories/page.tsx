import type { Metadata } from 'next';
import { SuccessStoriesPageClient } from './SuccessStoriesPageClient';

export const metadata: Metadata = {
  title: 'Success Stories — LocalMart',
  description: 'See how local businesses grow with LocalMart.',
};

export default function SuccessStoriesPage() {
  return <SuccessStoriesPageClient />;
}
