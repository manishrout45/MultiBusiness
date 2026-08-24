'use client';

import { useEffect, useState } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import { getVendorProfile } from '@/services/vendorService';
import type { VendorProfile } from '@/features/vendor';
import { cn } from '@/lib/utils';

export function useVendorApproval() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendorProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const isApproved = profile?.status === 'approved';
  const isPending = profile?.status === 'pending';
  const isRejected = profile?.status === 'rejected';

  return { profile, loading, isApproved, isPending, isRejected };
}

interface PendingApprovalBannerProps {
  className?: string;
}

export function PendingApprovalBanner({ className }: PendingApprovalBannerProps) {
  const { loading, isApproved, isPending, isRejected } = useVendorApproval();

  if (loading || isApproved) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        isRejected
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-amber-200 bg-amber-50',
        className
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            isRejected ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-700'
          )}
        >
          {isRejected ? <ShieldAlert className="size-5" /> : <Clock className="size-5" />}
        </span>
        <div>
          <p className="font-bold">
            {isRejected
              ? 'Application not approved'
              : 'Pending admin approval'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRejected
              ? 'Your seller application was rejected. Contact support or update your business profile to reapply.'
              : 'Your business profile is under review. You can edit your profile, but product management unlocks after admin approval.'}
          </p>
        </div>
      </div>
    </div>
  );
}

interface VendorApprovalGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function VendorApprovalGate({ children, fallback }: VendorApprovalGateProps) {
  const { loading, isApproved } = useVendorApproval();

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Checking seller status…
      </div>
    );
  }

  if (!isApproved) {
    return (
      <>
        <PendingApprovalBanner className="mb-6" />
        {fallback ?? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center">
            <p className="font-semibold">Products locked until approval</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete your business profile and wait for admin verification to start listing
              products.
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
