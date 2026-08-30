'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppNotification } from '@/services/notificationService';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  items: AppNotification[];
  isLoading?: boolean;
  onSelect?: (item: AppNotification) => void;
}

export function NotificationList({ items, isLoading, onSelect }: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        You&apos;re all caught up.
      </p>
    );
  }

  return (
    <ul className="max-h-80 overflow-y-auto">
      {items.map((item, index) => {
        const inner = (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              'px-4 py-3 transition hover:bg-muted/60',
              !item.read && 'bg-primary/5'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              {!item.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </motion.div>
        );

        return (
          <li key={item.id} className="border-b border-border/60 last:border-0">
            {item.link ? (
              <Link
                href={item.link}
                className="block"
                onClick={() => onSelect?.(item)}
              >
                {inner}
              </Link>
            ) : (
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => onSelect?.(item)}
              >
                {inner}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
