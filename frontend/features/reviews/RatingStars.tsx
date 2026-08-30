'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md';
  readOnly?: boolean;
}

export function RatingStars({ value, onChange, size = 'md', readOnly }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'size-4' : 'size-5';

  return (
    <div className="inline-flex items-center gap-0.5" role={readOnly ? 'img' : 'group'} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly || !onChange}
            onClick={() => onChange?.(i + 1)}
            className={cn(
              'rounded p-0.5 transition-colors',
              !readOnly && onChange && 'hover:scale-110',
              readOnly && 'cursor-default'
            )}
            aria-label={`Rate ${i + 1} stars`}
          >
            <Star
              className={cn(
                starSize,
                filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
