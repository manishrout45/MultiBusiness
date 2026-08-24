'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import {
  subscriptionService,
  type CurrentSubscription,
  type SubscriptionPlan as Plan,
} from '@/services/subscriptionService';
import { CurrentPlan } from './CurrentPlan';
import { SubscriptionPlan } from './SubscriptionPlan';

export function SubscriptionPageClient() {
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [p, c] = await Promise.all([
      subscriptionService.listPlans(token),
      subscriptionService.getCurrentSubscription(token),
    ]);
    setPlans(p);
    setCurrent(c);
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSelect(planId: string) {
    setIsSubmitting(true);
    try {
      const sub = await subscriptionService.subscribe(planId, 'monthly', token);
      setCurrent(sub);
      toast({
        title: 'Plan updated',
        description: `You are now on ${sub.planName}.`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Subscription failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Subscription plans</h1>
        <p className="text-muted-foreground">Sign in as a vendor to manage your plan.</p>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a plan for your digital storefront, listings, analytics, and marketing tools.
        </p>
      </div>

      <CurrentPlan subscription={current} isLoading={isLoading} />

      <SubscriptionPlan
        plans={plans}
        currentPlanId={current?.planId}
        onSelect={(id) => void handleSelect(id)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
