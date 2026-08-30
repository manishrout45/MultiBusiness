'use client';

import { ReviewCard } from '@/features/reviews/ReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Review } from '@/services/reviewService';

interface ReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first to share your experience.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review, index) => (
        <ReviewCard key={review.id} review={review} index={index} />
      ))}
    </div>
  );
}
