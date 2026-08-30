import { useEffect } from 'react';
import { Suspense } from 'react';
import { SearchPageClient } from './SearchPageClient';

export default function SearchPage() {
  useEffect(() => {
    document.title = 'Search | LocalMart';
  }, []);

  return (
    <Suspense fallback={<div className="container py-16 text-sm text-muted-foreground">Loading search…</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
