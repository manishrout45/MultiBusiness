'use client';

import { PricingCard } from './PricingCard';
import type { SubscriptionPlan } from '@/services/subscriptionService';

interface SubscriptionPlanProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string | null;
  onSelect: (planId: string) => void;
  isSubmitting?: boolean;
}

export function SubscriptionPlan({
  plans,
  currentPlanId,
  onSelect,
  isSubmitting,
}: SubscriptionPlanProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          currentPlanId={currentPlanId}
          onSelect={onSelect}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
}
