'use client';

import type { CSSProperties, ReactNode } from 'react';
import { categoryThemeStyle } from '@/lib/categoryTheme';
import { cn } from '@/lib/utils';

interface CategoryThemeScopeProps {
  themeColor: string;
  className?: string;
  children: ReactNode;
}

/** Applies per-category CSS variables for themed pages and sections. */
export function CategoryThemeScope({ themeColor, className, children }: CategoryThemeScopeProps) {
  return (
    <div className={cn('category-themed', className)} style={categoryThemeStyle(themeColor)}>
      {children}
    </div>
  );
}

interface CategoryIconTileProps {
  themeColor: string;
  active?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

export function CategoryIconTile({
  themeColor,
  active,
  size = 'md',
  className,
  children,
}: CategoryIconTileProps) {
  const style: CSSProperties = active
    ? {
        backgroundColor: themeColor,
        borderColor: themeColor,
        color: '#fff',
      }
    : {
        backgroundColor: `${themeColor}14`,
        borderColor: `${themeColor}33`,
        color: themeColor,
      };

  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-xl border transition',
        size === 'sm' ? 'size-11' : 'size-[3.25rem] sm:size-14',
        active && 'shadow-sm',
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
