'use client';

import { Radar } from 'lucide-react';
import {
  SEARCH_RADIUS_OPTIONS_KM,
  type SearchRadiusKm,
} from '@/lib/theme';
import { cn } from '@/lib/utils';

interface RadiusSelectorProps {
  value: SearchRadiusKm;
  onChange: (radius: SearchRadiusKm) => void;
  options?: readonly number[];
  className?: string;
}

export function RadiusSelector({
  value,
  onChange,
  options = SEARCH_RADIUS_OPTIONS_KM,
  className,
}: RadiusSelectorProps) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <label className="sr-only" htmlFor="search-radius">
        Search radius
      </label>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3">
        <Radar className="size-4 shrink-0 text-primary" />
        <select
          id="search-radius"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) as SearchRadiusKm)}
          className="h-full w-full min-w-0 flex-1 appearance-none bg-transparent text-sm font-medium text-foreground outline-none"
        >
          {options.map((km) => (
            <option key={km} value={km}>
              {km} km radius
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
