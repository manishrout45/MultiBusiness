'use client';

import { motion } from 'framer-motion';
import { Check, Circle, Package, Truck } from 'lucide-react';
import type { OrderStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STEPS: { status: OrderStatus; label: string; icon: typeof Circle }[] = [
  { status: 'pending', label: 'Pending', icon: Circle },
  { status: 'confirmed', label: 'Confirmed', icon: Check },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Check },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

interface OrderTimelineProps {
  status: OrderStatus;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        This order was cancelled.
      </div>
    );
  }

  const activeIndex = STATUS_INDEX[status];

  return (
    <ol className="space-y-0">
      {STEPS.map((step, index) => {
        const done = index <= activeIndex;
        const current = index === activeIndex;
        const Icon = step.icon;

        return (
          <li key={step.status} className="relative flex gap-3 pb-6 last:pb-0">
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  'absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5',
                  done ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
            <motion.div
              initial={false}
              animate={{
                scale: current ? 1.08 : 1,
                backgroundColor: done ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              }}
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                done ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-4" />
            </motion.div>
            <div className="pt-1">
              <p className={cn('text-sm font-medium', done ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
              </p>
              {current && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  Current status
                </motion.p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
