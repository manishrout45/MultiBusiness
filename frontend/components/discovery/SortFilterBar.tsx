'use client';

import { cn } from '@/lib/utils';

export type SortOption = 'distance' | 'rating' | 'popularity' | 'price';

interface SortFilterBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  minRating: number | null;
  onMinRatingChange: (rating: number | null) => void;
  className?: string;
  showPriceSort?: boolean;
}

const SORT_LABELS: { id: SortOption; label: string }[] = [
  { id: 'distance', label: 'Distance' },
  { id: 'rating', label: 'Rating' },
  { id: 'popularity', label: 'Popularity' },
  { id: 'price', label: 'Price' },
];

export function SortFilterBar({
  sort,
  onSortChange,
  minRating,
  onMinRatingChange,
  className,
  showPriceSort = true,
}: SortFilterBarProps) {
  const options = showPriceSort
    ? SORT_LABELS
    : SORT_LABELS.filter((o) => o.id !== 'price');

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sort
        </span>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSortChange(opt.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
              sort === opt.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Rating
        </span>
        {[4, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onMinRatingChange(minRating === n ? null : n)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
              minRating === n
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {n}+ ★
          </button>
        ))}
      </div>
    </div>
  );
}
