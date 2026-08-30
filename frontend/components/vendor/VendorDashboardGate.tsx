'use client';

import Link from 'next/link';
import { Clock, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PendingApprovalBanner, useVendorApproval } from '@/components/vendor/VendorApprovalGate';

interface VendorDashboardGateProps {
  children: React.ReactNode;
}

/** Locks vendor dashboard features until admin approval; profile editing remains available. */
export function VendorDashboardGate({ children }: VendorDashboardGateProps) {
  const { loading, isApproved, isPending, isRejected, profile } = useVendorApproval();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading seller workspace…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <LayoutDashboard className="size-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Complete seller registration</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Submit your business application to access the vendor dashboard.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/vendor/register">Become a Seller</Link>
        </Button>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <PendingApprovalBanner />
        <div className="rounded-3xl border border-dashed bg-muted/20 p-10 text-center">
          {isRejected ? (
            <>
              <ShieldAlert className="mx-auto size-10 text-destructive" />
              <h2 className="mt-4 text-xl font-bold">Dashboard locked</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your application was rejected. Update your business profile and contact support to
                reapply.
              </p>
            </>
          ) : (
            <>
              <Clock className="mx-auto size-10 text-amber-600" />
              <h2 className="mt-4 text-xl font-bold">
                {isPending ? 'Awaiting admin approval' : 'Dashboard locked'}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your business registration is under review. You can update your profile while you
                wait. Product management unlocks after approval.
              </p>
            </>
          )}
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link href="/vendor/profile">Edit business profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
