'use client';

import { ChevronDown } from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export type SearchCategoryId = 'all' | (typeof MARKETPLACE_CATEGORIES)[number]['slug'];

interface SearchCategoryDropdownProps {
  value: SearchCategoryId;
  onChange: (value: SearchCategoryId) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

const OPTIONS: Array<{ id: SearchCategoryId; label: string }> = [
  { id: 'all', label: 'All' },
  ...MARKETPLACE_CATEGORIES.map((c) => ({ id: c.slug as SearchCategoryId, label: c.name })),
];

export function SearchCategoryDropdown({
  value,
  onChange,
  open,
  onOpenChange,
  className,
}: SearchCategoryDropdownProps) {
  const label = OPTIONS.find((t) => t.id === value)?.label ?? 'All';

  return (
    <div className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-full min-w-[4.5rem] items-center justify-center gap-1 rounded-l-[inherit] border-r border-border/80 bg-muted/70 px-2.5 text-xs font-semibold text-foreground transition hover:bg-muted sm:min-w-[5.5rem] sm:px-3 sm:text-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Search category"
      >
        <span className="max-w-[5.5rem] truncate sm:max-w-[7rem]">{label}</span>
        <ChevronDown className={cn('size-3.5 shrink-0 text-muted-foreground transition', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close category menu"
            onClick={() => onOpenChange(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 max-h-72 min-w-[200px] overflow-y-auto rounded-xl border bg-card py-1 marketplace-shadow-lg"
          >
            {OPTIONS.map((type) => (
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
