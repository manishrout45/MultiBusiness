'use client';

import { PricingCard } from './PricingCard';
import type { FreeListingStatus, SubscriptionPlan } from '@/services/subscriptionService';

interface SubscriptionPlanProps {
  plans: SubscriptionPlan[];
  currentPlanId?: string | null;
  onSelect: (planId: string) => void;
  isSubmitting?: boolean;
  freeListing?: FreeListingStatus | null;
}

export function SubscriptionPlan({
  plans,
  currentPlanId,
  onSelect,
  isSubmitting,
  freeListing,
}: SubscriptionPlanProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {plans.map((plan) => {
        const isFree = plan.slug === 'free' || plan.monthlyFee <= 0;
        const freeBlocked = Boolean(isFree && freeListing && !freeListing.available);
        return (
          <PricingCard
            key={plan.id}
            plan={plan}
            currentPlanId={currentPlanId}
            onSelect={onSelect}
            isSubmitting={isSubmitting || freeBlocked}
            disabledReason={freeBlocked ? 'No free spots left' : undefined}
          />
        );
      })}
    </div>
  );
}
