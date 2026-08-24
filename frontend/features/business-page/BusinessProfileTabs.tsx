'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export const BUSINESS_PROFILE_TABS = [
  { id: 'about', label: 'About' },
  { id: 'products', label: 'Products' },
  { id: 'services', label: 'Services' },
  { id: 'offers', label: 'Offers' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'reviews', label: 'Reviews' },
] as const;

export type BusinessProfileTabId = (typeof BUSINESS_PROFILE_TABS)[number]['id'];

interface BusinessProfileTabsProps {
  active: BusinessProfileTabId;
  onChange: (tab: BusinessProfileTabId) => void;
  className?: string;
}

export function BusinessProfileTabs({ active, onChange, className }: BusinessProfileTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 overflow-x-auto hide-scrollbar rounded-2xl border border-border/70 bg-card p-1',
        className
      )}
      role="tablist"
    >
      {BUSINESS_PROFILE_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
            active === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface BusinessProfilePanelProps {
  tab: BusinessProfileTabId;
  children: React.ReactNode;
}

export function BusinessProfilePanel({ tab, children }: BusinessProfilePanelProps) {
  return (
    <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
      {children}
    </div>
  );
}

/** Hook for tab state on business profile pages */
export function useBusinessProfileTab(defaultTab: BusinessProfileTabId = 'about') {
  const [active, setActive] = useState<BusinessProfileTabId>(defaultTab);
  return { active, setActive };
}
