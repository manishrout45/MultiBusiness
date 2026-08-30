'use client';

import { motion } from 'framer-motion';
import { RatingStars } from '@/features/reviews/RatingStars';
import type { Review } from '@/services/reviewService';

interface ReviewCardProps {
  review: Review;
  index?: number;
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{review.userName}</p>
          {review.productName && (
            <p className="text-xs text-muted-foreground">Product: {review.productName}</p>
          )}
        </div>
        <RatingStars value={review.rating} readOnly size="sm" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
      <p className="mt-3 text-xs text-muted-foreground">{date}</p>
    </motion.article>
  );
}
