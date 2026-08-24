'use client';

import { Menu, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/features/notifications';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function DashboardHeader({
  title,
  subtitle,
  onMenuClick,
  onRefresh,
  refreshing,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-1.5 size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
    </header>
  );
}
