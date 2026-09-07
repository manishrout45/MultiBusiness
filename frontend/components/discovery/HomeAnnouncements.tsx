'use client';

import { Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchHomeAnnouncements,
  type HomeAnnouncement,
} from '@/services/announcementService';

export function HomeAnnouncements() {
  const [items, setItems] = useState<HomeAnnouncement[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchHomeAnnouncements().then((rows) => {
      if (!cancelled) setItems(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="border-b border-border bg-primary/5">
      <div className="container flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
          <Megaphone className="size-4" />
          Announcements
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          {items.slice(0, 3).map((item) => (
            <p key={item.id} className="truncate text-sm text-foreground">
              <span className="font-medium">{item.title}</span>
              {item.description ? (
                <span className="text-muted-foreground"> — {item.description}</span>
              ) : null}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
