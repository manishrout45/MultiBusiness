import { useEffect } from 'react';
import { SuccessStoriesPageClient } from './SuccessStoriesPageClient';

export default function SuccessStoriesPage() {
  useEffect(() => {
    document.title = 'Success Stories — LocalMart';
  }, []);

  return <SuccessStoriesPageClient />;
}
