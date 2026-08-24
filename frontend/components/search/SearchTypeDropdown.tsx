'use client';

import { ChevronDown } from 'lucide-react';
import { SEARCH_FILTER_TYPES, type SearchFilterType } from './types';
import { cn } from '@/lib/utils';

interface SearchTypeDropdownProps {
  value: SearchFilterType;
  onChange: (value: SearchFilterType) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function SearchTypeDropdown({
  value,
  onChange,
  open,
  onOpenChange,
  className,
}: SearchTypeDropdownProps) {
  const label = SEARCH_FILTER_TYPES.find((t) => t.id === value)?.label ?? 'All';

  return (
    <div className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-full items-center gap-1 border-r border-border px-3 text-xs font-semibold text-muted-foreground transition hover:bg-secondary/60 lg:px-4 lg:text-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {label}
        <ChevronDown className={cn('size-3.5 transition', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close filter menu"
            onClick={() => onOpenChange(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-xl border bg-card py-1 marketplace-shadow-lg"
          >
            {SEARCH_FILTER_TYPES.map((type) => (
              <li key={type.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === type.id}
                  onClick={() => {
                    onChange(type.id);
                    onOpenChange(false);
                  }}
                  className={cn(
                    'flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-secondary',
                    value === type.id && 'bg-secondary font-semibold text-primary'
                  )}
                >
                  {type.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
