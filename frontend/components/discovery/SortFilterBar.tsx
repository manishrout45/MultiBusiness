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
  showDistanceSort?: boolean;
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
  showDistanceSort = true,
}: SortFilterBarProps) {
  let options = SORT_LABELS;
  if (!showPriceSort) options = options.filter((o) => o.id !== 'price');
  if (!showDistanceSort) options = options.filter((o) => o.id !== 'distance');

  return (
    <div className={cn('flex flex-col gap-2.5 sm:gap-3', className)}>
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar sm:flex-wrap">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
          Sort
        </span>
        <div className="flex items-center gap-1.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSortChange(opt.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-3.5 sm:text-sm',
                sort === opt.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar sm:flex-wrap">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
          Rating
        </span>
        <div className="flex items-center gap-1.5">
          {[4, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onMinRatingChange(minRating === n ? null : n)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-3.5 sm:text-sm',
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
    </div>
  );
}
