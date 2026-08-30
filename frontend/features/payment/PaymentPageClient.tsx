'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentStatus } from '@/lib/constants';
import { paymentService } from '@/services/paymentService';

export function PaymentPageClient() {
  const params = useSearchParams();
  const status = (params.get('status') as PaymentStatus) || 'pending';
  const orderNumbers = params.get('numbers')?.split(',').filter(Boolean) ?? [];

  const icon =
    status === 'success' ? CheckCircle2 : status === 'failed' ? XCircle : Clock;
  const Icon = icon;

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="items-center text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`mb-2 flex size-16 items-center justify-center rounded-full ${
                status === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Icon className="size-8" />
            </motion.div>
            <CardTitle>{paymentService.getPaymentStatusLabel(status)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-sm">
            {orderNumbers.length > 0 && (
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-muted-foreground">Order number(s)</p>
                <ul className="mt-1 space-y-1 font-medium">
                  {orderNumbers.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-muted-foreground">
              {status === 'success'
                ? 'Thank you for shopping local. You can track your order anytime.'
                : status === 'failed'
                  ? 'Something went wrong. Please try checkout again or choose another method.'
                  : 'Complete payment in the gateway window if prompted.'}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/orders">View orders</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/businesses">Continue shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
