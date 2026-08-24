'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/features/reviews/ReviewForm';
import { ReviewList } from '@/features/reviews/ReviewList';
import { reviewService, type Review } from '@/services/reviewService';

interface ReviewsPageClientProps {
  businessId: string;
  businessName: string;
  businessSlug: string;
  products?: { id: string; name: string }[];
}

export function ReviewsPageClient({
  businessId,
  businessName,
  businessSlug,
  products = [],
}: ReviewsPageClientProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    const data = await reviewService.getReviews(businessId);
    setReviews(data);
    setIsLoading(false);
  }, [businessId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const average = reviewService.averageRating(reviews);

  return (
    <div className="container py-8 sm:py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={`/business/${businessSlug}`}>
          <ArrowLeft className="mr-1 size-4" />
          Back to {businessName}
        </Link>
      </Button>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">{businessName}</p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-semibold">{average}</span>
            <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ReviewList reviews={reviews} isLoading={isLoading} />
        <ReviewForm
          businessId={businessId}
          businessName={businessName}
          products={products}
          onSubmitted={loadReviews}
        />
      </div>
    </div>
  );
}
