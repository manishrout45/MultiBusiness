'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { items, unreadCount, open, setOpen, markRead, markAllRead, isLoading } =
    useNotifications();

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              'absolute right-0 z-50 mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl'
            )}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>
            <NotificationList
              items={items}
              isLoading={isLoading}
              onSelect={(n) => {
                markRead(n.id);
                setOpen(false);
              }}
            />
            <div className="border-t px-4 py-2 text-center">
              <Link
                href="/orders"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                View activity
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
