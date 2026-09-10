'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionPlan } from '@/services/subscriptionService';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: SubscriptionPlan;
  currentPlanId?: string | null;
  onSelect: (planId: string) => void;
  isSubmitting?: boolean;
  disabledReason?: string;
}

export function PricingCard({
  plan,
  currentPlanId,
  onSelect,
  isSubmitting,
  disabledReason,
}: PricingCardProps) {
  const isCurrent = currentPlanId === plan.id;
  const isFree = plan.monthlyFee <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card
        className={cn(
          'flex h-full flex-col',
          plan.highlighted && 'border-primary shadow-md ring-2 ring-primary/20',
          isFree && 'border-emerald-300'
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{plan.name}</CardTitle>
            {plan.highlighted && <Badge>Popular</Badge>}
            {isFree && <Badge variant="success">Free</Badge>}
          </div>
          <p className="pt-2">
            <span className="text-3xl font-bold">
              {isFree ? '₹0' : `₹${plan.monthlyFee.toLocaleString()}`}
            </span>
            <span className="text-sm text-muted-foreground">/month</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {isFree
              ? 'Limited free listing slots'
              : `or ₹${plan.yearlyFee.toLocaleString()}/year`}
            {plan.maxProducts != null
              ? ` · up to ${plan.maxProducts} products`
              : ' · unlimited products'}
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-2 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {disabledReason && (
            <p className="w-full text-center text-xs text-amber-700">{disabledReason}</p>
          )}
          <Button
            className="w-full"
            variant={isCurrent ? 'outline' : plan.highlighted ? 'default' : 'secondary'}
            disabled={isCurrent || isSubmitting || Boolean(disabledReason)}
            onClick={() => onSelect(plan.id)}
          >
            {isCurrent
              ? 'Current plan'
              : disabledReason
                ? 'Unavailable'
                : isSubmitting
                  ? 'Updating…'
                  : 'Choose plan'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
