'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { CurrentSubscription } from '@/services/subscriptionService';

interface CurrentPlanProps {
  subscription: CurrentSubscription | null;
  isLoading?: boolean;
}

export function CurrentPlan({ subscription, isLoading }: CurrentPlanProps) {
  if (isLoading) return <Skeleton className="h-36 w-full rounded-2xl" />;

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active subscription. Choose a plan below.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base">{subscription.planName}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            ₹{subscription.monthlyFee.toLocaleString()}/month
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {subscription.status}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>
          Billing period: {new Date(subscription.startDate).toLocaleDateString()} –{' '}
          {new Date(subscription.endDate).toLocaleDateString()}
        </p>
        {subscription.features.length > 0 && (
          <p className="mt-2">{subscription.features.slice(0, 3).join(' · ')}</p>
        )}
      </CardContent>
    </Card>
  );
}
