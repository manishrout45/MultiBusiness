'use client';

import { motion } from 'framer-motion';
import type { OrderStatus } from '@/lib/constants';
import { formatOrderStatus } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-900 border-blue-200',
  processing: 'bg-violet-100 text-violet-900 border-violet-200',
  shipped: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  cancelled: 'bg-red-100 text-red-900 border-red-200',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <motion.div
      key={status}
      initial={{ scale: 0.92, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
    >
      <Badge
        variant="outline"
        className={cn('border font-medium capitalize', STATUS_STYLES[status], className)}
      >
        {formatOrderStatus(status)}
      </Badge>
    </motion.div>
  );
}
